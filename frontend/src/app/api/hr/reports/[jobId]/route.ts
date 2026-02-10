import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

// GET /api/hr/reports/[jobId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const user = requireAuth(request)
    // In Next.js 16, params is always a Promise
    const resolvedParams = await params
    const jobId = resolvedParams.jobId

    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hr/reports/${jobId}`, {
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
    return NextResponse.json(data)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

