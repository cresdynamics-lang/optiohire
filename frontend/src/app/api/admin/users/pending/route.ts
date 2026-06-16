import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const backendUrl = 'https://api.optiohire.com'
    const searchParams = request.nextUrl.searchParams
    
    const response = await fetch(`${backendUrl}/api/admin/users/pending?${searchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json().catch(() => ({
      signups: [],
      total: 0,
      error: 'Failed to parse response'
    }))
    
    // Always return signups array even if there's an error
    if (!response.ok) {
      return NextResponse.json({
        signups: data.signups || [],
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 50,
        error: data.error || 'Failed to fetch signups'
      })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching signups:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })
    return NextResponse.json({
      signups: [],
      total: 0,
      page: 1,
      limit: 50,
      error: error.message || 'Failed to fetch signups'
    })
  }
}
