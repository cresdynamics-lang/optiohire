import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

type JwtPayload = {
  sub?: string
  email?: string
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
): Promise<{ authorized: boolean; status?: number; error?: string }> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, status: 401, error: 'Unauthorized' }
  }

  // Fast path: local JWT verification when frontend JWT_SECRET matches token issuer.
  const payload = resolveTokenPayload(request)
  if (payload) {
    const normalizedCompanyRole = normalizeRole(payload.company_role || payload.companyRole || null)
    const normalizedRole = normalizeRole(payload.role || null)
    const isCandidate = normalizedCompanyRole === 'candidate' || normalizedRole === 'candidate'
    if (isCandidate) return { authorized: true }
  }

  // Fallback path: backend auth source of truth (handles JWT secret drift).
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
    return { authorized: true }
  } catch {
    return { authorized: false, status: 401, error: 'Unauthorized' }
  }
}

export async function GET(request: NextRequest) {
  const auth = await resolveCandidateAuth(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
  }

  const { getPool } = await import('@/lib/db')
  const pool = getPool()
  const client = await pool.connect()
  try {
    const { rows } = await client.query(
      `SELECT
         jp.job_posting_id,
         jp.job_title,
         jp.job_description,
         jp.skills_required,
         jp.application_deadline,
         jp.created_at,
         jp.job_poster_url,
         c.company_name
       FROM job_postings jp
       LEFT JOIN companies c ON c.company_id = jp.company_id
       WHERE UPPER(COALESCE(jp.status, 'ACTIVE')) = 'ACTIVE'
         -- Use date-level comparison to avoid timezone edge cases hiding newly created jobs.
         AND (jp.application_deadline IS NULL OR jp.application_deadline::date >= CURRENT_DATE)
       ORDER BY jp.created_at DESC
       LIMIT 100`
    )

    return NextResponse.json({ jobs: rows })
  } catch (error) {
    console.error('Candidate jobs fetch error:', error)
    return NextResponse.json({ error: 'Failed to load jobs' }, { status: 500 })
  } finally {
    client.release()
  }
}

