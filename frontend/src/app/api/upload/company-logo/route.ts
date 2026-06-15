import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.optiohire.com'
    const formData = await request.formData()

    const response = await fetch(`${backendUrl}/api/upload/company-logo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const contentType = response.headers.get('content-type') || 'application/json'
    const data = await response.text()
    return new NextResponse(data, {
      status: response.status,
      headers: { 'Content-Type': contentType },
    })
  } catch (error: any) {
    console.error('Error proxying company logo upload:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload company logo' },
      { status: 500 }
    )
  }
}
