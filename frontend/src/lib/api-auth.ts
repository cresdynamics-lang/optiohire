import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
const BACKEND_URL = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '')

function createTimeoutSignal(ms: number): AbortSignal {
  if (
    typeof AbortSignal !== 'undefined' &&
    typeof (AbortSignal as { timeout?: (timeoutMs: number) => AbortSignal }).timeout === 'function'
  ) {
    return (AbortSignal as { timeout: (timeoutMs: number) => AbortSignal }).timeout(ms)
  }
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms)
  return controller.signal
}

function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is required but not configured')
  }
  return JWT_SECRET
}

export interface AuthUser {
  user_id: string
  email: string
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const secret = getJwtSecret()
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, secret) as { sub: string; email: string }
    return {
      user_id: decoded.sub,
      email: decoded.email.toLowerCase()
    }
  } catch {
    return null
  }
}

export function requireAuth(request: NextRequest): AuthUser {
  const user = getAuthUser(request)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireAuthWithFallback(request: NextRequest): Promise<AuthUser> {
  const user = getAuthUser(request)
  if (user) return user

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized')
  }

  try {
    const meResp = await fetch(`${BACKEND_URL}/api/user/me`, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      signal: createTimeoutSignal(8000),
    })

    if (!meResp.ok) {
      throw new Error('Unauthorized')
    }

    const me = await meResp.json().catch(() => null)
    const userId = me?.id || me?.user_id
    const email = me?.email
    if (!userId || !email) {
      throw new Error('Unauthorized')
    }

    return {
      user_id: String(userId),
      email: String(email).toLowerCase(),
    }
  } catch {
    throw new Error('Unauthorized')
  }
}

