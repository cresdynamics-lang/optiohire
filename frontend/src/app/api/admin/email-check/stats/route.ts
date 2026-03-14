import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:3001'

    const response = await fetch(`${backendUrl}/api/admin/email-check/stats`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch email check stats' }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching email check stats:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch email check stats' },
      { status: 500 }
    )
  }
}
