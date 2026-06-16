import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy admin job posting resend email endpoint
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const resolvedParams = await params
    const backendUrl = 'https://api.optiohire.com'
    const res = await fetch(`${backendUrl}/api/admin/job-postings/${resolvedParams.jobId}/resend-email`, {
      method: 'POST',
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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const isNetwork = /fetch|network|ECONNREFUSED|ETIMEDOUT|ENOTFOUND/i.test(message)
    return NextResponse.json(
      { error: isNetwork ? 'Cannot reach server. Check backend URL and try again.' : 'Failed to resend email' },
      { status: 502 }
    )
  }
}
