import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy admin activity endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:3001'
    const queryString = searchParams.toString()
    
    const res = await fetch(`${backendUrl}/api/admin/activity?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await res.json().catch(() => ({ error: 'Failed to parse response' }))
    
    // Even if backend returns error, return the data structure expected by frontend
    if (!res.ok) {
      // Return empty activities array instead of error to prevent UI breakage
      return NextResponse.json({
        activities: [],
        total: 0,
        page: Number(searchParams.get('page') || '1'),
        limit: Number(searchParams.get('limit') || '50'),
        error: data.error || 'Failed to fetch activity logs'
      })
    }
    
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Error fetching activity logs:', err)
    // Return empty result instead of error to prevent UI breakage
    return NextResponse.json({
      activities: [],
      total: 0,
      page: 1,
      limit: 50,
      error: err.message || 'Failed to fetch activity logs'
    })
  }
}
