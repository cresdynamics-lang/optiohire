import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1] || ''
    
    // We expect FormData from the frontend because of file uploads
    const formData = await request.formData()

    const targetUrl = `${BACKEND_URL}/api/candidate/certificate`
    
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        // Do NOT set Content-Type header manually when passing FormData to fetch.
        // Fetch will automatically set the Content-Type boundary.
      },
      body: formData,
    })
    
    const data = await res.json().catch(() => ({}))
    
    return NextResponse.json(data, {
      status: res.status,
    })
  } catch (error: any) {
    console.error('Candidate certificate proxy error:', error)
    return NextResponse.json({ error: error.message || 'Failed to proxy certificate request' }, { status: 500 })
  }
}
