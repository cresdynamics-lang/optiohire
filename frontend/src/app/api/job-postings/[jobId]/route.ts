import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { query } from '@/lib/db'

async function getAccessibleCompanyIds(userId: string, userEmail: string): Promise<string[]> {
  const normalizedEmail = userEmail.toLowerCase()
  const { rows } = await query<{ company_id: string }>(
    `SELECT DISTINCT company_id
     FROM companies
     WHERE user_id = $1
        OR LOWER(company_email) = $2
        OR LOWER(hr_email) = $2
        OR LOWER(hiring_manager_email) = $2`,
    [userId, normalizedEmail]
  )
  return rows.map((row) => row.company_id)
}

// GET /api/job-postings/[jobId] - Fetch a single job posting by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const user = requireAuth(request)
    // In Next.js 16, params is always a Promise
    const resolvedParams = await params
    const jobId = resolvedParams.jobId

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Fetch single job posting with meeting link
    const result = await query<{
      job_posting_id: string
      interview_meeting_link: string | null
      meeting_link: string | null
    }>(
      `SELECT 
        job_posting_id,
        interview_meeting_link,
        meeting_link
      FROM job_postings 
      WHERE job_posting_id = $1
      LIMIT 1`,
      [jobId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const job = result.rows[0]
    
    return NextResponse.json({
      id: job.job_posting_id,
      meeting_link: job.meeting_link || job.interview_meeting_link || '',
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching job posting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/job-postings/[jobId] - Update a single job posting
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const user = requireAuth(request)
    const resolvedParams = await params
    const jobId = resolvedParams.jobId

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    const companyIds = await getAccessibleCompanyIds(user.user_id, user.email)
    if (companyIds.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const updates: string[] = []
    const values: any[] = []
    let param = 1

    if (typeof body.job_title === 'string' && body.job_title.trim()) {
      updates.push(`job_title = $${param++}`)
      values.push(body.job_title.trim())
    }
    if (typeof body.job_description === 'string') {
      updates.push(`job_description = $${param++}`)
      values.push(body.job_description)
    }
    if (Array.isArray(body.required_skills)) {
      updates.push(`skills_required = $${param++}`)
      values.push(body.required_skills)
    }
    if (Object.prototype.hasOwnProperty.call(body, 'application_deadline')) {
      updates.push(`application_deadline = $${param++}`)
      values.push(body.application_deadline || null)
    }
    if (Object.prototype.hasOwnProperty.call(body, 'meeting_link')) {
      updates.push(`meeting_link = $${param++}`)
      values.push(body.meeting_link || null)
      updates.push(`interview_meeting_link = $${param++}`)
      values.push(body.meeting_link || null)
    }
    if (typeof body.status === 'string') {
      const normalizedStatus = body.status.trim().toUpperCase()
      const allowedStatuses = new Set(['ACTIVE', 'DRAFT', 'CLOSED', 'PAUSED'])
      if (!allowedStatuses.has(normalizedStatus)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
      }
      updates.push(`status = $${param++}`)
      values.push(normalizedStatus)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 })
    }

    values.push(jobId)
    values.push(companyIds)

    const result = await query(
      `UPDATE job_postings
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE job_posting_id = $${param++}
         AND company_id = ANY($${param}::uuid[])
       RETURNING job_posting_id`,
      values
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating job posting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/job-postings/[jobId] - Delete a single job posting
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const user = requireAuth(request)
    const resolvedParams = await params
    const jobId = resolvedParams.jobId

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    const companyIds = await getAccessibleCompanyIds(user.user_id, user.email)
    if (companyIds.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const result = await query(
      `DELETE FROM job_postings
       WHERE job_posting_id = $1
         AND company_id = ANY($2::uuid[])
       RETURNING job_posting_id`,
      [jobId, companyIds]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting job posting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
