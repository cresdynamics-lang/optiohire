import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

// POST /api/hr/reports/generate
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const body = await request.json()
    const { jobPostingId } = body

    if (!jobPostingId) {
      return NextResponse.json({ error: 'jobPostingId is required' }, { status: 400 })
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hr/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ jobPostingId }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to generate report' }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

