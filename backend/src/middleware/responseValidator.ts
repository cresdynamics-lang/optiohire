import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { logger } from '../utils/logger.js'

/**
 * Response validation middleware
 * Validates API responses against Zod schemas
 */
export function validateResponse(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res)
    
    res.json = function(data: any) {
      try {
        // Validate response data
        const validated = schema.parse(data)
        return originalJson(validated)
      } catch (error) {
        if (error instanceof z.ZodError) {
          logger.error('Response validation failed', {
            path: req.path,
            method: req.method,
            errors: error.errors
          })
          
          // In development, return validation errors
          if (process.env.NODE_ENV === 'development') {
            return originalJson({
              error: 'Response validation failed',
              details: error.errors,
              originalData: data
            })
          }
          
          // In production, log but return original data
          return originalJson(data)
        }
        
        // Other errors - return original data
        return originalJson(data)
      }
    }
    
    next()
  }
}
