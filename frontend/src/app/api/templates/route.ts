import { NextRequest, NextResponse } from 'next/server'
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function handleRequest(request: NextRequest) {
  try {
    const method = request.method
    const url = new URL(request.url)
    
    const token = request.headers.get('authorization')?.split(' ')[1] || ''
    
    const headers: Record<string, string> = {
      'Content-Type': request.headers.get('content-type') || 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
    
    let body = undefined
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await request.text()
      } catch (e) {}
    }
    
    const targetUrl = `${BACKEND_URL}/api/templates${url.search}`
    
    const res = await fetch(targetUrl, {
      method,
      headers,
      body
    })
    
    const data = await res.text()
    
    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const DELETE = handleRequest
export const PATCH = handleRequest
