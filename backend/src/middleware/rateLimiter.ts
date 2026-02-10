import rateLimit from 'express-rate-limit'
import { logger } from '../utils/logger.js'

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
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
 * Strict rate limiter for password reset endpoints
 * Limits: 3 requests per hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: {
    error: 'Too many password reset attempts',
    details: 'Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json({
      error: 'Too many password reset attempts',
      details: 'Please try again after 1 hour.'
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
