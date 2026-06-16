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

    const backendUrl = 'https://api.optiohire.com'
    const { searchParams } = new URL(request.url)
    const qs = new URLSearchParams()
    searchParams.forEach((value, key) => {
      qs.set(key, value)
    })
    if (!qs.has('page')) qs.set('page', '1')
    if (!qs.has('limit')) qs.set('limit', '20')

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

