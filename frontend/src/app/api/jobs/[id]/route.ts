import { NextRequest, NextResponse } from 'next/server'

const getBackendUrl = () =>
  (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:3001')
    .trim()
    .replace(/\/$/, '')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const backendUrl = getBackendUrl()
    const resolvedParams = await params
    const captchaToken = request.headers.get('x-captcha-token')

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (captchaToken) {
      headers['X-Captcha-Token'] = captchaToken
    }

    const res = await fetch(`${backendUrl}/api/job-postings/public/${resolvedParams.id}`, {
      headers,
      signal: AbortSignal.timeout(10000),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data?.error || 'Job not found' }, { status: res.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: 'Cannot reach jobs service' }, { status: 502 })
  }
}
