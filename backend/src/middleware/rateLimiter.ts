import rateLimit from 'express-rate-limit'
import { logger } from '../utils/logger.js'

const isProduction = process.env.NODE_ENV === 'production'

/**
 * General API rate limiter
 * Production: 100 requests per 15 minutes per IP.
 * Development: much higher — Next.js HMR, prefetch, and dashboard polling burn through 100 quickly and cause 429 spam that feels like the app is “reloading” or breaking.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000,
  message: {
    error: 'Too many requests',
    details: 'Please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`)
    const resetTime = (req as any).rateLimit?.resetTime
    const now = new Date()
    const diffSeconds = resetTime ? Math.max(0, Math.ceil((resetTime.getTime() - now.getTime()) / 1000)) : 15 * 60
    const minutes = Math.floor(diffSeconds / 60)
    const seconds = diffSeconds % 60
    
    let timeStr = ''
    if (minutes > 0) timeStr += `${minutes}m `
    if (seconds > 0) timeStr += `${seconds}s`
    if (!timeStr) timeStr = 'a moment'
    else timeStr = timeStr.trim()

    res.status(429).json({
      error: 'Rate Limit Exceeded',
      details: `You have made too many requests. Please try again in ${timeStr}.`,
      retryAfter: diffSeconds
    })
  }
})

/**
 * Strict rate limiter for authentication endpoints
 * Limits: 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    details: 'Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`)
    const resetTime = (req as any).rateLimit?.resetTime
    const now = new Date()
    const diffSeconds = resetTime ? Math.max(0, Math.ceil((resetTime.getTime() - now.getTime()) / 1000)) : 15 * 60
    const minutes = Math.floor(diffSeconds / 60)
    const seconds = diffSeconds % 60
    
    let timeStr = ''
    if (minutes > 0) timeStr += `${minutes}m `
    if (seconds > 0) timeStr += `${seconds}s`
    if (!timeStr) timeStr = 'a moment'
    else timeStr = timeStr.trim()

    res.status(429).json({
      error: 'Authentication Rate Limit Exceeded',
      details: `Too many authentication attempts. Please try again in ${timeStr}.`,
      retryAfter: diffSeconds
    })
  }
})

/**
 * Strict limiter for requesting a reset code.
 * Keeps anti-abuse protection on the expensive/email-sending endpoint.
 */
export const passwordResetRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000, // Allow legitimate retries but still throttle abuse
  message: {
    error: 'Too many password reset attempts',
    details: 'Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Password reset request rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json({
      error: 'Too many password reset attempts',
      details: 'Please try again after 15 minutes.'
    })
  }
})

/**
 * Separate limiter for reset-flow verification/update endpoints.
 * The reset UX can call these multiple times (verify code, verify token, submit),
 * so this is intentionally less strict than reset-code requests.
 */
export const passwordResetFlowLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000,
  message: {
    error: 'Too many password reset attempts',
    details: 'Please wait a few minutes and try again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Password reset flow rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json({
      error: 'Too many password reset attempts',
      details: 'Please wait a few minutes and try again.'
    })
  }
})

/**
 * Rate limiter for AI/expensive operations
 * Limits: 20 requests per minute per IP
 */
export const aiOperationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100000, // Limit each IP to 20 requests per minute
  message: {
    error: 'Too many AI operations',
    details: 'Please wait a moment before making another request.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`AI operation rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json({
      error: 'Too many AI operations',
      details: 'Please wait a moment before making another request.'
    })
  }
})
