import Redis from 'ioredis'
import { logger } from './logger.js'

let redisClient: Redis | null = null

/**
 * Initialize Redis connection
 */
export function initRedis(): Redis | null {
  const redisUrl = process.env.REDIS_URL
  const redisHost = process.env.REDIS_HOST || 'localhost'
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10)
  const redisPassword = process.env.REDIS_PASSWORD

  try {
    if (redisUrl) {
      redisClient = new Redis(redisUrl, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000)
          return delay
        },
        maxRetriesPerRequest: 3
      })
    } else {
      redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000)
          return delay
        },
        maxRetriesPerRequest: 3
      })
    }

    redisClient.on('connect', () => {
      logger.info('✅ Redis connected successfully')
    })

    redisClient.on('error', (err) => {
      logger.error('Redis connection error:', err)
      redisClient = null // Set to null on error, cache will fallback to no-op
    })

    redisClient.on('close', () => {
      logger.warn('Redis connection closed')
      redisClient = null
    })

    return redisClient
  } catch (error) {
    logger.error('Failed to initialize Redis:', error)
    redisClient = null
    return null
  }
}

/**
 * Get Redis client (lazy initialization)
 */
export function getRedis(): Redis | null {
  if (!redisClient) {
    return initRedis()
  }
  return redisClient
}

/**
 * Cache helper functions with fallback to no-op if Redis unavailable
 */
export const cache = {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const client = getRedis()
    if (!client) return null

    try {
      const value = await client.get(key)
      return value ? JSON.parse(value) as T : null
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error)
      return null
    }
  },

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<boolean> {
    const client = getRedis()
    if (!client) return false

    try {
      await client.setex(key, ttlSeconds, JSON.stringify(value))
      return true
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error)
      return false
    }
  },

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<boolean> {
    const client = getRedis()
    if (!client) return false

    try {
      await client.del(key)
      return true
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error)
      return false
    }
  },

  /**
   * Delete keys matching pattern
   */
  async delPattern(pattern: string): Promise<number> {
    const client = getRedis()
    if (!client) return 0

    try {
      const keys = await client.keys(pattern)
      if (keys.length === 0) return 0
      return await client.del(...keys)
    } catch (error) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error)
      return 0
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const client = getRedis()
    if (!client) return false

    try {
      const result = await client.exists(key)
      return result === 1
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error)
      return false
    }
  }
}

/**
 * Cache key generators
 */
export const cacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userCompany: (userId: string) => `user:${userId}:company`,
  jobPosting: (jobId: string) => `job:${jobId}`,
  jobPostingsByCompany: (companyId: string) => `jobs:company:${companyId}`,
  applicationsByJob: (jobId: string) => `applications:job:${jobId}`,
  company: (companyId: string) => `company:${companyId}`,
  adminStats: () => 'admin:stats'
}
