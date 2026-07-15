import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ settingKey: string }> }) {
  try {
    const { settingKey } = await params
    const token = request.headers.get('authorization')?.split(' ')[1] || ''
    const headers: Record<string, string> = {
      'Content-Type': request.headers.get('content-type') || 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
    const body = await request.text().catch(() => undefined)
    const res = await fetch(`${BACKEND_URL}/api/admin/settings/${encodeURIComponent(settingKey)}`, {
      method: 'PATCH',
      headers,
      body,
    })
    const data = await res.text()

    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
