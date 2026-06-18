import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.optiohire.com'

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

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1] || ''
    
    // We expect FormData from the frontend because of file uploads
    const formData = await request.formData()

    const targetUrl = `${BACKEND_URL}/api/candidate/certificate`
    
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        // Do NOT set Content-Type header manually when passing FormData to fetch.
        // Fetch will automatically set the Content-Type boundary.
      },
      body: formData,
      signal: createTimeoutSignal(15000),
    })
    
    const data = await res.json().catch(() => ({}))
    
    return NextResponse.json(data, {
      status: res.status,
    })
  } catch (error: any) {
    console.error('Candidate certificate proxy error:', error)
    return NextResponse.json({ error: error.message || 'Failed to proxy certificate request' }, { status: 500 })
  }
}
