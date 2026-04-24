import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

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

