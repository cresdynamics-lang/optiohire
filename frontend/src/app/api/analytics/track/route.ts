import { NextResponse } from 'next/server'

export async function POST() {
  // Dummy endpoint to prevent 404s for frontend analytics tracking
  return NextResponse.json({ success: true }, { status: 200 })
}
