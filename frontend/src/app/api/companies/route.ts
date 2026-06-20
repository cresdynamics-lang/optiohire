import { NextRequest, NextResponse } from 'next/server'

const getBackendUrl = () =>
    (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.optiohire.com')
        .trim()
        .replace(/\/$/, '')

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const backendUrl = getBackendUrl()

        const res = await fetch(`${backendUrl}/companies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': request.headers.get('authorization') || '',
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(15000),
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
            return NextResponse.json(
                { error: data?.error || 'Failed to create company' },
                { status: res.status }
            )
        }

        return NextResponse.json(data, { status: res.status })
    } catch (err) {
        console.error('[API] Company proxy error:', err)
        return NextResponse.json({ error: 'Cannot reach company service' }, { status: 502 })
    }
}
