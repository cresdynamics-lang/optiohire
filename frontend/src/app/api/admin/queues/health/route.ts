import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy admin queues health endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const res = await fetch(`${backendUrl}/api/admin/queues/health`, {
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
    console.error('Proxy error for queues health:', err)
    return NextResponse.json(
      { error: 'Failed to fetch queue health' },
      { status: 502 }
    )
  }
}
