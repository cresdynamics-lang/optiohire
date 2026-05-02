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
  max: isProduction ? 100 : 10_000,
  message: {
    error: 'Too many requests',
    details: 'Please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json({
      error: 'Too many requests',
      details: 'Please try again later.'
    })
  }
})

/**
 * Strict rate limiter for authentication endpoints
 * Limits: 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    details: 'Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json({
      error: 'Too many authentication attempts',
      details: 'Please try again after 15 minutes.'
    })
  }
})

/**
 * Strict limiter for requesting a reset code.
 * Keeps anti-abuse protection on the expensive/email-sending endpoint.
 */
export const passwordResetRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Allow legitimate retries but still throttle abuse
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
  max: 30,
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
  max: 20, // Limit each IP to 20 requests per minute
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
