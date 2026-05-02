import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxies GET /api/user/me to the backend so the browser stays same-origin
 * (avoids mixed dev noise and matches admin-signin / signin proxy pattern).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization')
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const backendUrl = (
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      'http://localhost:3001'
    )
      .trim()
      .replace(/\/$/, '')

    const res = await fetch(`${backendUrl}/api/user/me`, {
      method: 'GET',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(20000),
    })

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const isNetwork = /fetch|network|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|aborted/i.test(message)
    return NextResponse.json(
      { error: isNetwork ? 'Cannot reach user service. Check backend URL and backend status.' : 'Request failed' },
      { status: 502 }
    )
  }
}
