import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const backendUrl = 'https://api.optiohire.com'
    const body = await request.json()

    const response = await fetch(`${backendUrl}/api/admin/audit/bulk-rescore`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json().catch(() => ({}))
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Error proxying bulk audit rescore:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to bulk rescore applications' },
      { status: 500 }
    )
  }
}
