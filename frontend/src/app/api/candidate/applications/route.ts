import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createHash } from 'crypto'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type JwtPayload = {
  sub?: string
  email?: string
  name?: string
  role?: string
  company_role?: string
  companyRole?: string
}

function normalizeRole(value?: string | null): string | null {
  if (!value) return null
  const role = value.toLowerCase().trim()
  if (role === 'candidate' || role === 'job_seeker' || role === 'jobseeker' || role === 'job seeker') {
    return 'candidate'
  }
  return role
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

function resolveTokenPayload(request: NextRequest): JwtPayload | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const secret = process.env.JWT_SECRET
  if (!secret) return null
  try {
    return jwt.verify(token, secret) as JwtPayload
  } catch {
    return null
  }
}

function createTimeoutSignal(ms: number): AbortSignal {
  if (
    typeof AbortSignal !== 'undefined' &&
    typeof (AbortSignal as { timeout?: (timeoutMs: number) => AbortSignal }).timeout === 'function'
  ) {
    return (AbortSignal as { timeout: (timeoutMs: number) => AbortSignal }).timeout(ms)
  }
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms)
  return controller.signal
}

async function resolveCandidateAuth(
  request: NextRequest
): Promise<{ authorized: boolean; status?: number; error?: string; email?: string | null; name?: string | null }> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, status: 401, error: 'Unauthorized' }
  }

  const payload = resolveTokenPayload(request)
  if (payload) {
    const normalizedCompanyRole = normalizeRole(payload.company_role || payload.companyRole || null)
    const normalizedRole = normalizeRole(payload.role || null)
    const isCandidate = normalizedCompanyRole === 'candidate' || normalizedRole === 'candidate'
    if (isCandidate) {
      return {
        authorized: true,
        email: payload.email?.toLowerCase() || null,
        name: payload.name || null,
      }
    }
  }

  try {
    const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '')
    const meResponse = await fetch(`${backendUrl}/api/user/me`, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      signal: createTimeoutSignal(8000),
    })
    if (!meResponse.ok) {
      return { authorized: false, status: 401, error: 'Unauthorized' }
    }
    const me = await meResponse.json().catch(() => null)
    const normalizedCompanyRole = normalizeRole(me?.company_role || me?.companyRole || null)
    const normalizedRole = normalizeRole(me?.role || null)
    const isCandidate = normalizedCompanyRole === 'candidate' || normalizedRole === 'candidate'
    if (!isCandidate) {
      return { authorized: false, status: 403, error: 'Only job seeker accounts can access this endpoint' }
    }
    return {
      authorized: true,
      email: me?.email ? String(me.email).toLowerCase() : null,
      name: me?.name ? String(me.name) : null,
    }
  } catch {
    return { authorized: false, status: 401, error: 'Unauthorized' }
  }
}

export async function GET(request: NextRequest) {
  const auth = await resolveCandidateAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
  }

  const email = auth.email || null
  if (!email) {
    return NextResponse.json({ error: 'Missing candidate email in token' }, { status: 400 })
  }

  const { getPool } = await import('@/lib/db')
  const pool = getPool()
  const client = await pool.connect()
  try {
    const { rows } = await client.query(
      `SELECT
         a.application_id,
         a.created_at,
         a.updated_at,
         a.ai_score,
         a.ai_status,
         a.reasoning,
         a.resume_url,
         a.parsed_resume_json,
         a.phone,
         jp.job_posting_id,
         jp.job_title,
         c.company_name
       FROM applications a
       JOIN job_postings jp ON jp.job_posting_id = a.job_posting_id
       LEFT JOIN companies c ON c.company_id = a.company_id
       WHERE LOWER(a.email) = LOWER($1)
       ORDER BY COALESCE(a.updated_at, a.created_at) DESC
       LIMIT 100`,
      [email]
    )

    return NextResponse.json({ applications: rows })
  } catch (error) {
    console.error('Candidate applications fetch error:', error)
    return NextResponse.json({ error: 'Failed to load application history' }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const hasBearerToken = Boolean(authHeader && authHeader.startsWith('Bearer '))
  let auth: { email?: string | null; name?: string | null } | null = null
  if (hasBearerToken) {
    const resolved = await resolveCandidateAuth(request)
    if (!resolved.authorized) {
      const deniedMessage =
        (resolved.error || '').toLowerCase().includes('job seeker')
          ? 'Only job seeker accounts can apply using account mode'
          : (resolved.error || 'Unauthorized')
      return NextResponse.json({ error: deniedMessage }, { status: resolved.status || 401 })
    }
    auth = { email: resolved.email || null, name: resolved.name || null }
  }

  const body = await request.json().catch(() => null)
  const jobPostingId = body?.jobPostingId ? String(body.jobPostingId) : ''
  const resumeUrl = body?.resumeUrl ? String(body.resumeUrl).trim() : ''
  const resumeFileName = body?.resumeFileName ? String(body.resumeFileName).trim() : ''
  const resumeMimeType = body?.resumeMimeType ? String(body.resumeMimeType).trim() : ''
  const linkedinUrl = body?.linkedinUrl ? String(body.linkedinUrl).trim() : ''
  const githubUrl = body?.githubUrl ? String(body.githubUrl).trim() : ''
  const otherUrl = body?.otherUrl ? String(body.otherUrl).trim() : ''
  const phone = body?.phone ? String(body.phone).trim() : ''
  const message = body?.message ? String(body.message).trim() : ''
  const bodyEmail = body?.email ? String(body.email).toLowerCase().trim() : ''
  const bodyName = body?.name ? String(body.name).trim() : ''

  if (!jobPostingId) {
    return NextResponse.json({ error: 'jobPostingId is required' }, { status: 400 })
  }
  if (!resumeUrl && !linkedinUrl && !githubUrl && !otherUrl) {
    return NextResponse.json(
      { error: 'Provide at least one application link (CV, LinkedIn, GitHub, or other link).' },
      { status: 400 }
    )
  }

  const email = (auth?.email || bodyEmail || '').toLowerCase().trim()
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'A valid applicant email is required.' }, { status: 400 })
  }
  const candidateName = auth?.name || bodyName || email.split('@')[0] || null

  const { getPool } = await import('@/lib/db')
  const pool = getPool()
  const client = await pool.connect()
  try {
    const { rows: jobs } = await client.query<{ job_posting_id: string; company_id: string }>(
      `SELECT job_posting_id, company_id
       FROM job_postings
       WHERE job_posting_id = $1
       LIMIT 1`,
      [jobPostingId]
    )
    const job = jobs[0]
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const parsedResume = {
      source: 'candidate_portal',
      links: {
        resumeUrl: resumeUrl || null,
        linkedinUrl: linkedinUrl || null,
        githubUrl: githubUrl || null,
        otherUrl: otherUrl || null,
      },
      document: {
        name: resumeFileName || null,
        mimeType: resumeMimeType || null,
      },
      note: message || null,
    }

    const externalId = sha256Hex(`${jobPostingId}|${email}`)

    const writeParams = [
      candidateName,
      phone || null,
      resumeUrl || linkedinUrl || githubUrl || otherUrl || null,
      JSON.stringify(parsedResume),
      externalId,
      job.job_posting_id,
      email,
      job.company_id,
    ]

    // Use update-then-insert so applications work even in environments
    // where the (job_posting_id, email) unique constraint is missing.
    const updateResult = await client.query<{ application_id: string }>(
      `UPDATE applications
       SET candidate_name = $1,
           phone = $2,
           resume_url = $3,
           parsed_resume_json = $4::jsonb,
           external_id = $5,
           company_id = $8,
           updated_at = NOW()
       WHERE job_posting_id = $6
         AND LOWER(email) = LOWER($7)
       RETURNING application_id`,
      writeParams
    )

    let applicationId = updateResult.rows[0]?.application_id || null

    if (!applicationId) {
      const insertResult = await client.query<{ application_id: string }>(
        `INSERT INTO applications
          (job_posting_id, company_id, candidate_name, email, phone, resume_url, parsed_resume_json, external_id)
         VALUES
          ($6, $8, $1, $7, $2, $3, $4::jsonb, $5)
         RETURNING application_id`,
        writeParams
      )
      applicationId = insertResult.rows[0]?.application_id || null
    }

    // Trigger AI watcher/scoring pipeline in background so candidate submit
    // does not wait on a potentially slow model/email workflow.
    if (applicationId) {
      void (async () => {
        try {
          const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '')
          const scoringResponse = await fetch(`${backendUrl}/applications/score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              application_id: applicationId,
              job_posting_id: job.job_posting_id,
            }),
            signal: createTimeoutSignal(12000),
          })
          if (!scoringResponse.ok && scoringResponse.status !== 409) {
            const data = await scoringResponse.json().catch(() => ({}))
            console.warn(
              'Background scoring trigger failed:',
              data.error || `Scoring trigger failed (${scoringResponse.status})`
            )
          }
        } catch (error: any) {
          console.warn('Background scoring trigger error:', error?.message || error)
        }
      })()
    }

    return NextResponse.json({
      success: true,
      applicationId,
      scoringQueued: Boolean(applicationId),
    })
  } catch (error) {
    console.error('Candidate application submit error:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  } finally {
    client.release()
  }
}

