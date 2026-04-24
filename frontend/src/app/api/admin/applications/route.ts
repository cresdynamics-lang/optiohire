import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy admin applications list endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const queryString = searchParams.toString()
    
    const res = await fetch(`${backendUrl}/api/admin/applications?${queryString}`, {
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
      { error: 'Failed to fetch applications' },
      { status: 502 }
    )
  }
}
