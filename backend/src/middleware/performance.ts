import type { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.js'

interface PerformanceMetrics {
  startTime: number
  method: string
  path: string
}

/**
 * Performance monitoring middleware
 * Tracks response times and logs slow requests
 */
export function performanceMonitor(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now()
  const metrics: PerformanceMetrics = {
    startTime,
    method: req.method,
    path: req.path
  }

  // Store metrics in request object
  ;(req as any).performanceMetrics = metrics

  // Override res.end to capture response time
  const originalEnd = res.end.bind(res)
  ;(res as any).end = function(chunk?: any, encoding?: any): any {
    const duration = Date.now() - startTime
    const statusCode = res.statusCode

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: metrics.method,
        path: metrics.path,
        duration: `${duration}ms`,
        statusCode,
        ip: req.ip
      })
    }

    // Log all requests in debug mode
    logger.debug('Request completed', {
      method: metrics.method,
      path: metrics.path,
      duration: `${duration}ms`,
      statusCode
    })

    // Store metrics for potential aggregation
    ;(res as any).performanceMetrics = {
      duration,
      statusCode
    }

    originalEnd(chunk, encoding)
  }

  next()
}
