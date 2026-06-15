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

// GET /api/hr/candidates?jobId=...
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const status = searchParams.get('status')

    if (!jobId) {
      return NextResponse.json({ error: 'jobId query parameter is required' }, { status: 400 })
    }

    const url = new URL(`${BACKEND_URL}/api/hr/candidates`)
    url.searchParams.set('jobId', jobId)
    if (status) url.searchParams.set('status', status)

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      signal: createTimeoutSignal(10000),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (err) {
    console.error('Proxy GET hr-candidates error:', err)
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
  }
}

