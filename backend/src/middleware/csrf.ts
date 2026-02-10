import type { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.js'

/**
 * CSRF Protection Middleware
 * For API routes using JWT tokens, CSRF is less critical but we add it for form submissions
 * This implements a simple token-based CSRF protection
 */

// Store CSRF tokens in memory (in production, use Redis)
const csrfTokens = new Map<string, { token: string; expires: number }>()

// Clean up expired tokens every hour
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expires < now) {
      csrfTokens.delete(key)
    }
  }
}, 60 * 60 * 1000)

/**
 * Generate CSRF token for session
 */
export function generateCsrfToken(sessionId: string): string {
  const token = require('crypto').randomBytes(32).toString('hex')
  csrfTokens.set(sessionId, {
    token,
    expires: Date.now() + 60 * 60 * 1000 // 1 hour
  })
  return token
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId)
  if (!stored) {
    return false
  }
  if (stored.expires < Date.now()) {
    csrfTokens.delete(sessionId)
    return false
  }
  return stored.token === token
}

/**
 * CSRF protection middleware
 * Only applies to state-changing operations (POST, PUT, DELETE, PATCH)
 * Skips for API routes using JWT (they're already protected)
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for API routes using JWT authentication
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return next()
  }

  // Only protect state-changing methods
  const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH']
  if (!stateChangingMethods.includes(req.method)) {
    return next()
  }

  // Get session ID from cookie or header
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id'] as string
  const csrfToken = req.headers['x-csrf-token'] as string || req.body?.csrfToken

  if (!sessionId || !csrfToken) {
    logger.warn(`CSRF protection failed: missing token for ${req.method} ${req.path}`)
    return res.status(403).json({
      error: 'CSRF token required',
      details: 'Please include a valid CSRF token in your request.'
    })
  }

  if (!verifyCsrfToken(sessionId, csrfToken)) {
    logger.warn(`CSRF protection failed: invalid token for ${req.method} ${req.path}`)
    return res.status(403).json({
      error: 'Invalid CSRF token',
      details: 'The CSRF token is invalid or expired.'
    })
  }

  next()
}

/**
 * Get CSRF token endpoint (for frontend to fetch)
 */
export function getCsrfToken(req: Request, res: Response) {
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id'] as string || require('crypto').randomBytes(16).toString('hex')
  const token = generateCsrfToken(sessionId)
  
  // Set session cookie if not present
  if (!req.cookies?.sessionId) {
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    })
  }

  res.json({ csrfToken: token })
}
