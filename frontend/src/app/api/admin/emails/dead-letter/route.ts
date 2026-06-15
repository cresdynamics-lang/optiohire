import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

function createTimeoutSignal(ms: number): AbortSignal {
  if (
    typeof AbortSignal !== 'undefined' &&
    typeof (AbortSignal as { timeout?: (timeoutMs: number) => AbortSignal }).timeout === 'function'
  ) {
    return (AbortSignal as { timeout: (timeoutMs: number) => AbortSignal }).timeout(ms)
  }
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms)
  return controller.signal
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.toString()
    const queryString = query ? `?${query}` : ''

    const response = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/api/admin/emails/dead-letter${queryString}`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      signal: createTimeoutSignal(10000),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (err) {
    console.error('Proxy GET emails/dead-letter error:', err)
    return NextResponse.json({ error: 'Failed to fetch dead-letter emails' }, { status: 500 })
  }
}
