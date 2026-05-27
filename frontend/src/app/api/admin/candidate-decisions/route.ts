import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

    const response = await fetch(`${BACKEND_URL}/api/admin/candidate-decisions`, {
      method: 'GET',
      headers: {
        Authorization: token,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend returned an error:', response.status, errorText)
      return NextResponse.json({ error: 'Failed to fetch candidate decisions' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error proxying candidate decisions fetch:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
