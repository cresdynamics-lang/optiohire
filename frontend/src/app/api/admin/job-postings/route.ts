import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy admin job postings list endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const backendUrl = 'https://api.optiohire.com'
    const queryString = searchParams.toString()
    
    const res = await fetch(`${backendUrl}/api/admin/job-postings?${queryString}`, {
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
      { error: 'Failed to fetch job postings' },
      { status: 502 }
    )
  }
}
