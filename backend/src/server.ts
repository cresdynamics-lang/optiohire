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
import { router as uploadRouter } from './routes/upload.js'
import { ensureStorageDir } from './utils/storage.js'
import { logger } from './utils/logger.js'
import path from 'path'
import { startReportScheduler } from './cron/reportScheduler.js'
import { startDeadlineStatusScheduler } from './cron/scheduler.js'
// Email reader enabled - monitors inbox for job applications
import { emailReaderStatus } from './server/email-reader.js'
import { emailRetryChecker } from './server/email-retry-checker.js'
import { apiLimiter, authLimiter, passwordResetLimiter, aiOperationLimiter } from './middleware/rateLimiter.js'
import { initRedis } from './utils/redis.js'
import { errorHandler } from './utils/errorHandler.js'
import { performanceMonitor } from './middleware/performance.js'
import { ResendService } from './services/resendService.js'

const app = express()
const port = Number(process.env.PORT || 3001)

const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

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

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server calls and tools without Origin header.
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error(`CORS blocked origin: ${origin}`))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Email'],
}))
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
  if (emailReaderStatus.enabled && !emailReaderStatus.running) {
    health.status = 'degraded'
  }

  const statusCode = health.status === 'ok' ? 200 : 503
  res.status(statusCode).json(health)
})

// Email reader health check (IMAP ingestion + applicant analysis)
app.get('/health/email-reader', (_req, res) => {
  const status = !emailReaderStatus.enabled
    ? 'disabled'
    : emailReaderStatus.running
      ? 'ok'
      : 'degraded'

  res.json({
    status,
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
app.use('/api/user/preferences', userPreferencesRouter)
app.use('/api/upload', uploadRouter) // File upload endpoints

// Serve uploaded files statically
const storageDir = process.env.FILE_STORAGE_DIR || './storage'
app.use('/storage', express.static(path.resolve(storageDir), {
  maxAge: '1y', // Cache for 1 year
  etag: true,
  setHeaders: (res, filePath) => {
    // Prevent content-type sniffing and force download behavior for CV/document files.
    res.setHeader('X-Content-Type-Options', 'nosniff')

    const ext = path.extname(filePath).toLowerCase()
    const isDownloadableDocument = new Set([
      '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
    ]).has(ext)

    if (isDownloadableDocument) {
      const filename = path.basename(filePath)
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    }
  },
})) // User preferences endpoints
app.use('/api/analytics', analyticsRouter) // Analytics tracking endpoints
app.use('/api/resend', resendRouter) // Resend email API endpoints

// Error handling middleware (must be last)
app.use(errorHandler)

// Start
async function start() {
  await ensureStorageDir()

  if (process.env.USE_RESEND === 'true' || process.env.RESEND_API_KEY) {
    try {
      const resendService = new ResendService()
      const diagnostics = await resendService.getDiagnostics()
      if (diagnostics.atLeastOneWorking && !diagnostics.hasVerifiedDomain) {
        logger.warn('Resend is enabled but no verified domains were found. Outbound email may fail in production until a domain is verified at https://resend.com/domains')
      }
    } catch (err: any) {
      logger.warn(`Failed to run Resend startup diagnostics: ${err?.message || String(err)}`)
    }
  }
  
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
  
  // Start email retry checker (sends missing feedback emails immediately)
  if (process.env.NODE_ENV !== 'test' && process.env.ENABLE_EMAIL_READER !== 'false') {
    emailRetryChecker.start()
    logger.info('Email retry checker started - checking for unsent emails every 10 seconds')
  }
  
  app.listen(port, () => {
    logger.info(`Backend listening on http://localhost:${port}`)
  })
}

start().catch((err) => {
  logger.error('Failed to start server', { err })
  process.exit(1)
})


