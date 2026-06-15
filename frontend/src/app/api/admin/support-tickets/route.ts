import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.optiohire.com'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const token = request.headers.get('authorization')?.split(' ')[1] || ''
    const headers: Record<string, string> = {
      'Content-Type': request.headers.get('content-type') || 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
    const res = await fetch(`${BACKEND_URL}/api/admin/support-tickets${url.search}`, { headers })
    const data = await res.text()

    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
