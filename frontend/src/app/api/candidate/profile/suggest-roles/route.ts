import { NextRequest, NextResponse } from 'next/server'
import { createTimeoutSignal, getBackendUrl } from '@/lib/backend-url'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.text()
    const res = await fetch(`${getBackendUrl()}/api/candidate/profile/suggest-roles`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body,
      signal: createTimeoutSignal(60000),
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error('Suggest roles proxy error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to suggest roles' },
      { status: 500 }
    )
  }
}
