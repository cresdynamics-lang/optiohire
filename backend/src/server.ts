// IMPORTANT (ESM): load env before importing modules that read env at import-time.
import './utils/env.js'

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import compression from 'compression'
import { router as companiesRouter } from './routes/companies.js'
import { router as jobsRouter } from './routes/jobs.js'
import { router as jobRouter } from './routes/job.js'
import { router as jobPostingsRouter } from './routes/job-postings.js'
import { router as inboundApplicationsRouter } from './routes/inbound-applications.js'
import { router as applicationsRouter } from './routes/applications.js'
import { router as reportsRouter } from './routes/reports.js'
import { router as contactRouter } from './routes/contact.js'
import { router as authRouter } from './routes/auth.js'
import { router as hrReportsRouter } from './routes/hr-reports.js'
import { router as hrCandidatesRouter } from './routes/hr-candidates.js'
import { router as scheduleRouter } from './routes/schedule.js'
import { router as adminRouter } from './routes/admin.js'
import { router as userPreferencesRouter } from './routes/user-preferences.js'
import { router as userRouter } from './routes/user.js'
import { router as analyticsRouter } from './routes/analytics.js'
import { router as resendRouter } from './routes/resend.js'
import { ensureStorageDir } from './utils/storage.js'
import { logger } from './utils/logger.js'
import { startReportScheduler } from './cron/reportScheduler.js'
import { startDeadlineStatusScheduler } from './cron/scheduler.js'
// Email reader enabled - monitors inbox for job applications
import { emailReaderStatus } from './server/email-reader.js'
import { apiLimiter, authLimiter, passwordResetLimiter, aiOperationLimiter } from './middleware/rateLimiter.js'
import { initRedis } from './utils/redis.js'
import { errorHandler } from './utils/errorHandler.js'
import { performanceMonitor } from './middleware/performance.js'

const app = express()
const port = Number(process.env.PORT || 3001)

// Performance optimizations
app.use(compression({
  level: 6, // Good balance between compression and speed
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  }
}))

app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// Performance monitoring
app.use(performanceMonitor)

// Apply rate limiting globally (can be overridden per route)
app.use('/api', apiLimiter)

// Enhanced Health Checks
app.get('/health', async (_req, res) => {
  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  }

  // Check database
  try {
    const { query } = await import('./db/index.js')
    const startTime = Date.now()
    await query('SELECT 1')
    const dbLatency = Date.now() - startTime
    health.database = {
      status: 'connected',
      latency: `${dbLatency}ms`
    }
  } catch (error: any) {
    health.database = {
      status: 'disconnected',
      error: error.message
    }
    health.status = 'degraded'
  }

  // Check Redis cache
  try {
    const { getRedis } = await import('./utils/redis.js')
    const redis = getRedis()
    if (redis) {
      const startTime = Date.now()
      await redis.ping()
      const redisLatency = Date.now() - startTime
      health.cache = {
        status: 'connected',
        latency: `${redisLatency}ms`
      }
    } else {
      health.cache = {
        status: 'not_configured'
      }
    }
  } catch (error: any) {
    health.cache = {
      status: 'disconnected',
      error: error.message
    }
  }

  // Check email reader
  health.emailReader = emailReaderStatus

  const statusCode = health.status === 'ok' ? 200 : 503
  res.status(statusCode).json(health)
})

// Email reader health check (IMAP ingestion + applicant analysis)
app.get('/health/email-reader', (_req, res) => {
  res.json({
    status: emailReaderStatus.enabled && emailReaderStatus.running ? 'ok' : 'disabled',
    emailReader: emailReaderStatus,
    timestamp: new Date().toISOString()
  })
})

// Database health check
app.get('/health/db', async (_req, res) => {
  try {
    const { query } = await import('./db/index.js')
    const startTime = Date.now()
    const result = await query('SELECT NOW() as time, version() as version')
    const latency = Date.now() - startTime
    
    res.json({ 
      status: 'ok', 
      database: 'connected',
      latency: `${latency}ms`,
      time: result.rows[0]?.time,
      version: result.rows[0]?.version?.split(' ')[0] + ' ' + result.rows[0]?.version?.split(' ')[1]
    })
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message 
    })
  }
})

// Routes
app.use('/companies', companiesRouter)
app.use('/jobs', jobsRouter)
app.use('/api/job', jobRouter) // POST /api/job/create
app.use('/api/job-postings', jobPostingsRouter)
app.use('/inbound/applications', inboundApplicationsRouter)
app.use('/applications', applicationsRouter)
app.use('/companies', reportsRouter) // GET /companies/:id/report
app.use('/api/hr/reports', hrReportsRouter) // HR report endpoints
app.use('/api/hr', hrCandidatesRouter) // HR candidate endpoints
app.use('/api/system/reports', reportsRouter) // System/cron endpoints
app.use('/api', scheduleRouter) // POST /api/schedule-interview
app.use('/contact', contactRouter)
app.use('/auth', authRouter)
app.use('/api/admin', adminRouter) // Admin endpoints
app.use('/api/user', userRouter) // User profile endpoints
app.use('/api/user/preferences', userPreferencesRouter) // User preferences endpoints
app.use('/api/analytics', analyticsRouter) // Analytics tracking endpoints
app.use('/api/resend', resendRouter) // Resend email API endpoints

// Error handling middleware (must be last)
app.use(errorHandler)

// Start
async function start() {
  await ensureStorageDir()
  
  // Initialize Redis cache (optional - falls back gracefully if unavailable)
  if (process.env.REDIS_URL || process.env.REDIS_HOST) {
    initRedis()
  } else {
    logger.info('Redis not configured - caching disabled')
  }
  
  // Start deadline status scheduler
  startDeadlineStatusScheduler().catch((err) => {
    logger.error('Failed to start deadline status scheduler:', err)
  })
  
  // Start report scheduler (for automatic report generation)
  if (process.env.NODE_ENV !== 'test' && !process.env.DISABLE_REPORT_SCHEDULER) {
    startReportScheduler().catch((err) => {
      logger.error('Failed to start report scheduler:', err)
    })
  } else {
    logger.info('Report scheduler disabled (NODE_ENV=test or DISABLE_REPORT_SCHEDULER is set)')
  }
  
  app.listen(port, () => {
    logger.info(`Backend listening on http://localhost:${port}`)
  })
}

start().catch((err) => {
  logger.error('Failed to start server', { err })
  process.exit(1)
})


