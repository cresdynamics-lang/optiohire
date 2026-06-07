import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/candidate/dashboard`, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json().catch(() => ({}))
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Candidate dashboard proxy error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load candidate dashboard' },
      { status: 500 }
    )
  }
}
