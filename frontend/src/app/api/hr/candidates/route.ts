import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { query } from '@/lib/db'

type CandidateRow = {
  id: string
  candidate_name: string | null
  email: string
  score: number | null
  status: string | null
  interview_time: string | null
  interview_link: string | null
  interview_status: string | null
  reasoning: string | null
}

// GET /api/hr/candidates?jobId=...
export async function GET(request: NextRequest) {
  try {
    // Check DATABASE_URL first
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set in environment variables')
      return NextResponse.json({
        error: 'Database connection failed',
        details: 'DATABASE_URL environment variable is not set. Please check your .env.local file and restart the server.',
      }, { status: 500 })
    }

    const user = requireAuth(request)
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'jobId query parameter is required' }, { status: 400 })
    }

    // Verify user has access to this job's company
    // For now, we'll check if the job exists and allow access
    // In production, you'd check user_companies or user_roles table
    let jobRows
    try {
      const jobResult = await query<{ company_id: string }>(
        `SELECT company_id FROM job_postings WHERE job_posting_id = $1`,
        [jobId]
      )
      jobRows = jobResult.rows
    } catch (dbError: any) {
      console.error('Database error checking job:', {
        message: dbError.message,
        code: dbError.code,
        detail: dbError.detail
      })
      
      // Provide more specific error messages
      let errorDetails = dbError?.message || 'Could not connect to database.'
      if (dbError?.code === 'ENOTFOUND' || dbError?.code === 'ECONNREFUSED') {
        errorDetails = 'Cannot reach database server. Please check your network connection and DATABASE_URL.'
      } else if (dbError?.message?.includes('password') || dbError?.message?.includes('authentication')) {
        errorDetails = 'Database authentication failed. Please check your DATABASE_URL password.'
      } else if (dbError?.message?.includes('timeout')) {
        errorDetails = 'Database connection timeout. The server may be unreachable.'
      }
      
      return NextResponse.json({ 
        error: 'Failed to verify job',
        details: process.env.NODE_ENV === 'development' ? errorDetails : 'Database connection error'
      }, { status: 500 })
    }

    if (jobRows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check if we should filter by status (for shortlisted page)
    const statusFilter = searchParams.get('status')
    const statusCondition = statusFilter 
      ? `AND ai_status = $2`
      : ''
    const queryParams = statusFilter ? [jobId, statusFilter] : [jobId]

    // Fetch candidates ordered: shortlist first, then flagged, then rejected; within each by score DESC (top ranked first)
    let result
    try {
      // Check if interview_status column exists, if not use NULL as fallback
      // Note: ai_status is an enum, so we cast it to text before using TRIM
      const queryText = `SELECT 
          application_id as id,
          candidate_name,
          email,
          ai_score as score,
          ai_status as status,
          interview_time,
          interview_link,
          COALESCE(interview_status, 'PENDING') as interview_status,
          reasoning
        FROM applications 
        WHERE job_posting_id = $1 ${statusCondition}
        ORDER BY 
          CASE COALESCE(UPPER(TRIM(ai_status::text)), '')
            WHEN 'SHORTLIST' THEN 1
            WHEN 'FLAG' THEN 2
            WHEN 'REJECT' THEN 3
            ELSE 4
          END,
          ai_score DESC NULLS LAST,
          created_at ASC`
      
      result = await query<CandidateRow>(queryText, queryParams)
    } catch (dbError: any) {
      console.error('Database error fetching candidates:', {
        message: dbError.message,
        code: dbError.code,
        detail: dbError.detail,
        hint: dbError.hint,
        stack: dbError.stack,
        jobId,
        statusFilter
      })
      return NextResponse.json({ 
        error: 'Failed to fetch candidates', 
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined,
        code: dbError.code
      }, { status: 500 })
    }

    // Explicitly type the rows as CandidateRow[]
    const rows: CandidateRow[] = result.rows || []

    // Map to response format (normalize status from enum to text) with ranking
    const candidates = rows.map((row: CandidateRow, index: number) => {
      // Ensure score is a number or null
      let score: number | null = null
      if (row.score !== null && row.score !== undefined) {
        const numScore = typeof row.score === 'number' ? row.score : Number(row.score)
        score = isNaN(numScore) ? null : numScore
      }
      
      return {
        id: row.id,
        rank: index + 1,
        candidate_name: row.candidate_name || 'Unknown',
        email: row.email,
        score: score,
        status: row.status || 'PENDING',
        interview_time: row.interview_time,
        interview_link: row.interview_link,
        interview_status: row.interview_status || null,
        reasoning: row.reasoning || null,
      }
    })

    return NextResponse.json(candidates)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching candidates:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

