import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy admin user stats endpoint
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const resolvedParams = await params
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const res = await fetch(`${backendUrl}/api/admin/users/${resolvedParams.userId}/stats`, {
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
      { error: 'Failed to fetch user stats' },
      { status: 502 }
    )
  }
}
