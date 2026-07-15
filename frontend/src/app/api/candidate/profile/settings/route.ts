import { NextRequest, NextResponse } from 'next/server'
import { createTimeoutSignal, getBackendUrl } from '@/lib/backend-url'

export const runtime = 'nodejs'

async function proxy(request: NextRequest, method: 'GET' | 'PATCH') {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const targetUrl = `${getBackendUrl()}/api/candidate/profile/settings`
    const init: RequestInit = {
      method,
      headers: {
        Authorization: authHeader,
        ...(method === 'PATCH' ? { 'Content-Type': 'application/json' } : {}),
      },
      signal: createTimeoutSignal(30000),
    }
    if (method === 'PATCH') {
      init.body = await request.text()
    }

    const res = await fetch(targetUrl, init)
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error(`Candidate profile settings ${method} proxy error:`, error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to reach profile settings' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return proxy(request, 'GET')
}

export async function PATCH(request: NextRequest) {
  return proxy(request, 'PATCH')
}
