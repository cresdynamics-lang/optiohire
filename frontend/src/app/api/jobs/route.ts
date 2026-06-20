import { NextRequest, NextResponse } from 'next/server'

const getBackendUrl = () =>
  (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.optiohire.com')
    .trim()
    .replace(/\/$/, '')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const backendUrl = getBackendUrl()
    const captchaToken = request.headers.get('x-captcha-token')

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (captchaToken) {
      headers['X-Captcha-Token'] = captchaToken
    }

    const res = await fetch(`${backendUrl}/jobs${queryString ? `?${queryString}` : ''}`, {
      headers,
      signal: AbortSignal.timeout(10000),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.error || 'Failed to fetch jobs' }, { status: res.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: 'Cannot reach jobs service' }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const backendUrl = getBackendUrl()

    const res = await fetch(`${backendUrl}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || 'Failed to create job posting' },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('[API] Jobs POST proxy error:', err)
    return NextResponse.json({ error: 'Cannot reach jobs service' }, { status: 502 })
  }
}
