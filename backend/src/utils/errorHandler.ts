import type { Request, Response, NextFunction } from 'express'
import { logger } from './logger.js'

export interface AppError extends Error {
  statusCode?: number
  code?: string
  details?: any
}

/**
 * Standardized error handling middleware
 */
export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction) {
  // Log error with context
  logger.error('Request error:', {
    error: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent')
  })

  // Determine status code
  const statusCode = err.statusCode || 500

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development'
  const message = statusCode === 500 && !isDevelopment
    ? 'Internal server error'
    : err.message

  // Send error response
  res.status(statusCode).json({
    error: message,
    ...(err.details && { details: err.details }),
    ...(isDevelopment && { stack: err.stack })
  })
}

/**
 * Create standardized error
 */
export function createError(message: string, statusCode: number = 500, details?: any): AppError {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  error.details = details
  return error
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Validation error helper
 */
export function validationError(message: string, details?: any): AppError {
  return createError(message, 400, details)
}

/**
 * Not found error helper
 */
export function notFoundError(resource: string = 'Resource'): AppError {
  return createError(`${resource} not found`, 404)
}

/**
 * Unauthorized error helper
 */
export function unauthorizedError(message: string = 'Unauthorized'): AppError {
  return createError(message, 401)
}

/**
 * Forbidden error helper
 */
export function forbiddenError(message: string = 'Forbidden'): AppError {
  return createError(message, 403)
}
