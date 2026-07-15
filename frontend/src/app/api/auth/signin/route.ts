import { NextRequest, NextResponse } from 'next/server'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text()
    const backendUrl = (
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      'http://127.0.0.1:3001'
    )
      .trim()
      .replace(/\/$/, '')

    console.log(`[AUTH] Proxying signin request to: ${backendUrl}/auth/signin`)

    const backendRes = await fetch(`${backendUrl}/auth/signin`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'OptioHire-Frontend-Proxy/1.0',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '127.0.0.1',
        'X-Real-IP': request.headers.get('x-real-ip') || '127.0.0.1',
      },
      body: bodyText,
      signal: AbortSignal.timeout(15000),
    })

    const data = await backendRes.json().catch(() => ({}))
    
    if (!backendRes.ok) {
      console.error(`[AUTH] Backend signin failed: ${backendRes.status}`, data)
      return NextResponse.json(
        { error: data?.error || data?.details || 'Sign in failed' },
        { status: backendRes.status || 502 }
      )
    }

    return NextResponse.json(data, { status: backendRes.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[AUTH] Proxy error during signin:`, err)
    
    const isNetwork = /fetch|network|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|aborted/i.test(message)
    return NextResponse.json(
      { error: isNetwork ? 'Cannot reach signin service. Check BACKEND_URL and backend status.' : 'Sign in failed' },
      { status: 502 }
    )
  }
}


