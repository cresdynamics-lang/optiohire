import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const token = req.headers.get('Authorization')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const BACKEND_URL = process.env.BACKEND_URL || 'https://api.optiohire.com'

    const response = await fetch(`${BACKEND_URL}/api/hr/messages/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend returned an error:', response.status, errorText)
      return NextResponse.json({ error: 'Failed to generate AI message' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error proxying AI message generation:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
