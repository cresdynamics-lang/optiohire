import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'https://api.optiohire.com'

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (!body.applicantId || !body.interviewTime) {
      return NextResponse.json(
        { error: 'applicantId and interviewTime are required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/api/update-interview`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    })

    let data
    try {
      data = await response.json()
    } catch {
      data = { error: 'Backend returned non-JSON response', details: `Status ${response.status}` }
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to update interview', details: data.details || '' },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Update interview API error:', error)
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json({ error: 'Cannot connect to backend server' }, { status: 503 })
    }
    return NextResponse.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}
