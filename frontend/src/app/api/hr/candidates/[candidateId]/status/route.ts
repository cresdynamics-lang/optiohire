import { NextResponse, NextRequest } from 'next/server'

export async function PATCH(req: NextRequest, context: any) {
  try {
    const { candidateId } = await context.params
    const body = await req.json()
    const token = req.headers.get('Authorization')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const BACKEND_URL = 'https://api.optiohire.com'

    const response = await fetch(`${BACKEND_URL}/api/hr/candidates/${candidateId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend returned an error:', response.status, errorText)
      return NextResponse.json({ error: 'Failed to update candidate status' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error proxying candidate status update:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
