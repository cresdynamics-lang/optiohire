import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text()
    const backendUrl = (process.env.BACKEND_URL || '').trim()

    if (!backendUrl) {
      return NextResponse.json(
        { error: 'Signin service is not configured. Set BACKEND_URL in your environment.' },
        { status: 500 }
      )
    }

    const backendRes = await fetch(`${backendUrl.replace(/\/$/, '')}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyText,
      signal: AbortSignal.timeout(15000),
    })

    const data = await backendRes.json().catch(() => ({}))
    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data?.error || data?.details || 'Sign in failed' },
        { status: backendRes.status || 502 }
      )
    }

    return NextResponse.json(data, { status: backendRes.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const isNetwork = /fetch|network|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|aborted/i.test(message)
    return NextResponse.json(
      { error: isNetwork ? 'Cannot reach signin service. Check BACKEND_URL and backend status.' : 'Sign in failed' },
      { status: 502 }
    )
  }
}

