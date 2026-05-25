import { NextRequest, NextResponse } from 'next/server'

const getBackendUrl = () =>
  (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001')
    .trim()
    .replace(/\/$/, '')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const backendUrl = getBackendUrl()

    const res = await fetch(`${backendUrl}/jobs${queryString ? `?${queryString}` : ''}`, {
      headers: { 'Content-Type': 'application/json' },
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
