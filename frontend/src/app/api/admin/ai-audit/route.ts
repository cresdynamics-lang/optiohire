import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy admin AI audit endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '20'
    const jobId = searchParams.get('job_id')
    const companyId = searchParams.get('company_id')

    const qs = new URLSearchParams({ page, limit })
    if (jobId) qs.set('job_id', jobId)
    if (companyId) qs.set('company_id', companyId)

    const res = await fetch(`${backendUrl}/api/admin/ai-audit?${qs.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }
    return NextResponse.json(data)
  } catch (_err) {
    return NextResponse.json(
      { error: 'Failed to fetch AI audit trail' },
      { status: 502 }
    )
  }
}

