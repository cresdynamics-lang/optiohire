import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

// GET /api/report/[job_posting_id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ job_posting_id: string }> }
) {
  try {
    const user = requireAuth(request)
    // In Next.js 16, params is always a Promise
    const resolvedParams = await params
    const jobPostingId = resolvedParams.job_posting_id

    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch report from backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hr/reports/${jobPostingId}`, {
      headers: {
        Authorization: authHeader,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
      }
      throw new Error('Failed to fetch report')
    }

    const data = await response.json()

    // Fetch job details and candidates for full report view
    const jobResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/job-postings/${jobPostingId}`, {
      headers: {
        Authorization: authHeader,
      },
    })

    let jobData = null
    let candidates = []

    if (jobResponse.ok) {
      jobData = await jobResponse.json()
      
      // Fetch candidates
      const candidatesResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hr/candidates?jobId=${jobPostingId}`, {
        headers: {
          Authorization: authHeader,
        },
      })

      if (candidatesResponse.ok) {
        candidates = await candidatesResponse.json()
      }
    }

    return NextResponse.json({
      report: data.report,
      job: jobData,
      candidates,
      insights: {
        totalApplicants: candidates.length,
        shortlisted: candidates.filter((c: any) => c.status === 'SHORTLIST').length,
        flagged: candidates.filter((c: any) => c.status === 'FLAGGED').length,
        rejected: candidates.filter((c: any) => c.status === 'REJECTED').length
      }
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

