import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    const { path } = await params
    const body = await request.json()
    const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001').trim()

    if (!backendUrl) {
      return NextResponse.json(
        { error: 'Auth service is not configured. Set BACKEND_URL in your environment.' },
        { status: 500 }
      )
    }

    const res = await fetch(`${backendUrl.replace(/\/$/, '')}/auth/${path}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '127.0.0.1',
        'X-Real-IP': request.headers.get('x-real-ip') || '127.0.0.1',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || data?.details || `Auth action ${path} failed` },
        { status: res.status || 502 }
      )
    }

    return NextResponse.json(data, { status: res.status || 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const isNetwork = /fetch|network|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|aborted/i.test(message)
    return NextResponse.json(
      { error: isNetwork ? 'Cannot reach auth service. Check BACKEND_URL and backend status.' : 'Auth action failed' },
      { status: 502 }
    )
  }
}
