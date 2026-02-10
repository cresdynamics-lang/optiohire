import type { Request, Response, NextFunction } from 'express'
import { trackActivity } from '../utils/adminLogger.js'
import type { AuthRequest } from './auth.js'

/**
 * Middleware to track API calls and user activity
 */
export function trackApiActivity(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now()
  const userId = (req as AuthRequest).userId || null
  const endpoint = req.path
  const method = req.method

  // Override res.json to track response time
  const originalJson = res.json.bind(res)
  res.json = function (body: any) {
    const responseTime = Date.now() - startTime
    const statusCode = res.statusCode

    // Track activity asynchronously (don't block response)
    trackActivity(
      userId,
      'api_call',
      endpoint,
      method,
      responseTime,
      statusCode,
      {
        query: req.query,
        params: req.params,
        bodyKeys: req.body ? Object.keys(req.body) : []
      }
    ).catch((err) => {
      console.error('Failed to track activity:', err)
    })

    return originalJson(body)
  }

  next()
}

