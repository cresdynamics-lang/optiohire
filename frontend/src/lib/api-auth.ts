import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'a6869b3fb2a7b56cb33c58d07cf69548ee1ccbe9f6ec2aa54ce13d1a1bafeedae2d88ee36ed7d92f0e29d573d68c2335fe187eb7cf3890be9b7d4bf216cfd568'

export interface AuthUser {
  user_id: string
  email: string
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; email: string }
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

