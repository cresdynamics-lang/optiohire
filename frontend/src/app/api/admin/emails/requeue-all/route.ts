import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const backendUrl = 'https://api.optiohire.com'
    const response = await fetch(`${backendUrl}/api/admin/emails/requeue-all`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to re-queue all dead-letter emails' }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error re-queuing all dead-letter emails:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to re-queue all dead-letter emails' },
      { status: 500 }
    )
  }
}
