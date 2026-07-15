import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://127.0.0.1:3001'

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

// GET /api/job-postings/[jobId] - Proxy to backend
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { jobId } = await params
    const response = await fetch(`${BACKEND_URL}/api/job-postings/${jobId}`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      signal: createTimeoutSignal(10000),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (err) {
    console.error('Proxy GET job-posting by id error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/job-postings/[jobId] - Proxy to backend
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { jobId } = await params
    const body = await request.json()
    const response = await fetch(`${BACKEND_URL}/api/job-postings/${jobId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: createTimeoutSignal(10000),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (err) {
    console.error('Proxy PATCH job-posting error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/job-postings/[jobId] - Proxy to backend
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { jobId } = await params
    const response = await fetch(`${BACKEND_URL}/api/job-postings/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      signal: createTimeoutSignal(10000),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (err) {
    console.error('Proxy DELETE job-posting error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
