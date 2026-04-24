import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const backendUrl = (process.env.BACKEND_URL || '').trim()

    if (!backendUrl) {
      return NextResponse.json(
        { error: 'Signup service is not configured. Set BACKEND_URL in your environment.' },
        { status: 500 }
      )
    }

    const res = await fetch(`${backendUrl.replace(/\/$/, '')}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || data?.details || 'Sign up failed' },
        { status: res.status || 502 }
      )
    }

    return NextResponse.json(data, { status: res.status || 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const isNetwork = /fetch|network|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|aborted/i.test(message)
    return NextResponse.json(
      { error: isNetwork ? 'Cannot reach signup service. Check BACKEND_URL and backend status.' : 'Sign up failed' },
      { status: 502 }
    )
  }
}

