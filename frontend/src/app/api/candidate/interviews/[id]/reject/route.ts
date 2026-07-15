import { NextRequest, NextResponse } from 'next/server'
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001'

export async function POST(request: NextRequest, { params }: any) {
  try {
    const id = params.id
    const token = request.headers.get('authorization')?.split(' ')[1] || ''
    const body = await request.text()
    
    const targetUrl = `${BACKEND_URL}/api/schedule-interview/${id}/reject`
    
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
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
