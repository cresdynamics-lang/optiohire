import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy admin AI usage analytics endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const backendUrl = 'https://api.optiohire.com'
    const searchParams = request.nextUrl.searchParams.toString()
    const res = await fetch(`${backendUrl}/api/admin/ai-usage${searchParams ? `?${searchParams}` : ''}`, {
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
    return NextResponse.json(
      { error: 'Failed to fetch AI usage data' },
      { status: 502 }
    )
  }
}
