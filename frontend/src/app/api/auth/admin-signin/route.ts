import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxies admin login to the backend so the browser only calls same-origin.
 * Avoids client-side CORS/mixed-content issues by proxying server-side.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body || {}
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const url = `${backendUrl.replace(/\/$/, '')}/auth/admin-signin`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase(), password }),
      signal: AbortSignal.timeout(15000),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || 'Invalid credentials' },
        { status: res.status >= 400 ? res.status : 500 }
      )
    }

    if (data?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'This account does not have admin access' },
        { status: 403 }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const isNetwork = /fetch|network|ECONNREFUSED|ETIMEDOUT|ENOTFOUND/i.test(message)
    return NextResponse.json(
      { error: isNetwork ? 'Cannot reach server. Check backend URL and try again.' : 'Login failed.' },
      { status: 502 }
    )
  }
}
