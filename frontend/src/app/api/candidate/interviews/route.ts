import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'No token provided' },
        { status: 401 }
      )
    }

    // Forward request to backend with original authorization header
    const response = await fetch(`${BACKEND_URL}/api/candidate/interviews`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    })

    // Get response data
    let data
    try {
      data = await response.json()
    } catch (err) {
      data = {
        error: 'Server error',
        details: `Backend returned non-JSON response (${response.status})`
      }
    }

    // Forward the backend's response (including status code)
    if (!response.ok) {
      return NextResponse.json(
        { 
          error: data.error || 'Failed to fetch interviews',
          details: data.details || data.message || `Server error (${response.status})`
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Candidate interviews API error:', error)
    
    // Handle network errors
    if (error.message?.includes('fetch') || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          error: 'Connection failed',
          details: 'Unable to connect to backend server. Please ensure the backend is running.'
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error?.message || 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}
