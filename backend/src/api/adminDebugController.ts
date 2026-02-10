import type { Request, Response } from 'express'
import { query, pool } from '../db/index.js'
import type { AuthRequest } from '../middleware/auth.js'
import { logger } from '../utils/logger.js'
import { getRedis } from '../utils/redis.js'

/**
 * Admin Debugging Tools Controller
 * Provides debugging and diagnostic endpoints for admins
 */

// Store query logs in memory (in production, use Redis or database)
const queryLogs: Array<{
  timestamp: string
  query: string
  duration: number
  error?: string
}> = []

const MAX_LOG_ENTRIES = 1000

/**
 * Log query for debugging
 */
export function logQuery(query: string, duration: number, error?: string) {
  queryLogs.push({
    timestamp: new Date().toISOString(),
    query: query.substring(0, 500), // Limit query length
    duration,
    error
  })
  
  // Keep only last MAX_LOG_ENTRIES
  if (queryLogs.length > MAX_LOG_ENTRIES) {
    queryLogs.shift()
  }
}

/**
 * Get query logs
 */
export async function getQueryLogs(req: AuthRequest, res: Response) {
  try {
    const { limit = '100', errorOnly = 'false' } = req.query
    const limitNum = parseInt(limit as string, 10)
    
    let logs = [...queryLogs]
    
    if (errorOnly === 'true') {
      logs = logs.filter(log => log.error)
    }
    
    logs = logs.slice(-limitNum).reverse()
    
    return res.json({
      logs,
      total: queryLogs.length,
      filtered: logs.length
    })
  } catch (error: any) {
    logger.error('Error fetching query logs:', error)
    return res.status(500).json({ error: 'Failed to fetch query logs', details: error.message })
  }
}

/**
 * Get system diagnostics
 */
export async function getSystemDiagnostics(req: AuthRequest, res: Response) {
  try {
    // Database diagnostics
    const dbDiagnostics = await Promise.all([
      query('SELECT version() as version'),
      query('SELECT pg_database_size(current_database()) as size'),
      query('SELECT count(*) as connections FROM pg_stat_activity'),
      query('SELECT count(*) as idle FROM pg_stat_activity WHERE state = \'idle\''),
      query(`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 10
      `)
    ])
    
    // Redis diagnostics
    let redisDiagnostics = null
    try {
      const redis = getRedis()
      if (redis) {
        const info = await redis.info('stats')
        const memory = await redis.info('memory')
        redisDiagnostics = {
          connected: true,
          info: info.substring(0, 500),
          memory: memory.substring(0, 500)
        }
      } else {
        redisDiagnostics = { connected: false }
      }
    } catch (error: any) {
      redisDiagnostics = { connected: false, error: error.message }
    }
    
    // System info
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }
    
    return res.json({
      database: {
        version: dbDiagnostics[0].rows[0]?.version,
        size: dbDiagnostics[1].rows[0]?.size,
        connections: {
          total: dbDiagnostics[2].rows[0]?.connections,
          idle: dbDiagnostics[3].rows[0]?.idle
        },
        largestTables: dbDiagnostics[4].rows
      },
      redis: redisDiagnostics,
      system: systemInfo,
      generatedAt: new Date().toISOString()
    })
  } catch (error: any) {
    logger.error('Error fetching system diagnostics:', error)
    return res.status(500).json({ error: 'Failed to fetch diagnostics', details: error.message })
  }
}

/**
 * Get error logs
 */
export async function getErrorLogs(req: AuthRequest, res: Response) {
  try {
    // Get recent errors from audit_logs if available
    const { limit = '100' } = req.query
    
    try {
      const errors = await query(
        `SELECT * FROM audit_logs 
         WHERE action LIKE '%error%' OR action LIKE '%fail%'
         ORDER BY created_at DESC 
         LIMIT $1`,
        [parseInt(limit as string, 10)]
      )
      
      return res.json({
        errors: errors.rows,
        total: errors.rows.length
      })
    } catch (dbError: any) {
      // If audit_logs doesn't exist or query fails, return empty
      return res.json({
        errors: [],
        total: 0,
        note: 'Error logs table not available'
      })
    }
  } catch (error: any) {
    logger.error('Error fetching error logs:', error)
    return res.status(500).json({ error: 'Failed to fetch error logs', details: error.message })
  }
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(req: AuthRequest, res: Response) {
  try {
    const startTime = Date.now()
    await query('SELECT 1')
    const duration = Date.now() - startTime
    
    return res.json({
      success: true,
      duration: `${duration}ms`,
      message: 'Database connection successful'
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Database connection failed'
    })
  }
}

/**
 * Test Redis connection
 */
export async function testRedisConnection(req: AuthRequest, res: Response) {
  try {
    const redis = getRedis()
    if (!redis) {
      return res.json({
        success: false,
        message: 'Redis not configured'
      })
    }
    
    const startTime = Date.now()
    await redis.ping()
    const duration = Date.now() - startTime
    
    return res.json({
      success: true,
      duration: `${duration}ms`,
      message: 'Redis connection successful'
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Redis connection failed'
    })
  }
}

/**
 * Clear cache
 */
export async function clearCache(req: AuthRequest, res: Response) {
  try {
    const { pattern = '*' } = req.query
    const redis = getRedis()
    
    if (!redis) {
      return res.json({
        success: false,
        message: 'Redis not configured'
      })
    }
    
    const keys = await redis.keys(pattern as string)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
    
    return res.json({
      success: true,
      cleared: keys.length,
      pattern,
      message: `Cleared ${keys.length} cache entries`
    })
  } catch (error: any) {
    logger.error('Error clearing cache:', error)
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to clear cache'
    })
  }
}
