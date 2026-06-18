import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'https://api.optiohire.com'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'No token provided' },
        { status: 401 }
      )
    }

    let body
    try {
      body = await request.json()
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid request', details: 'Request body must be valid JSON' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/api/hr/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    })

    let data
    try {
      data = await response.json()
    } catch (err) {
      data = {
        error: 'Server error',
        details: `Backend returned non-JSON response (${response.status})`
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: data.error || 'Failed to send messages',
          details: data.details || data.message || `Server error (${response.status})`
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('HR messages API error:', error)
    
    if (error.message?.includes('fetch') || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Connection failed', details: 'Unable to connect to backend server.' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
