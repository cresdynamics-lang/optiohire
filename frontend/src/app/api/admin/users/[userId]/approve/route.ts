import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:3001'
    const resolvedParams = await params
    const { userId } = resolvedParams
    
    const response = await fetch(`${backendUrl}/api/admin/users/${userId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to approve signup' }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error approving signup:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to approve signup' },
      { status: 500 }
    )
  }
}
