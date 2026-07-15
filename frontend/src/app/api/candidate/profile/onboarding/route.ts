import { NextRequest, NextResponse } from 'next/server'
import { createTimeoutSignal, getBackendUrl } from '@/lib/backend-url'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const targetUrl = `${getBackendUrl()}/api/candidate/profile/onboarding`

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { Authorization: authHeader },
      body: formData,
      signal: createTimeoutSignal(120000),
    })

    const data = await res.json().catch(() => ({
      success: false,
      error: 'Invalid response from profile service',
    }))

    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error('Candidate profile onboarding proxy error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update profile',
        details: error?.message || 'Proxy error',
      },
      { status: 500 }
    )
  }
}
