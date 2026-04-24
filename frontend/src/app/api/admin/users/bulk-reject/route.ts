import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const body = await request.json()
    
    const response = await fetch(`${backendUrl}/api/admin/users/bulk-reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to bulk reject signups' }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error bulk rejecting signups:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to bulk reject signups' },
      { status: 500 }
    )
  }
}
