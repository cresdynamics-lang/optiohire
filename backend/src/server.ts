// IMPORTANT (ESM): load env before importing modules that read env at import-time.
import './utils/env.js'

import express from 'express'
import 'newrelic'
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
import { router as institutionApplicationsRouter } from './routes/institution-applications.js'
import { router as authRouter } from './routes/auth.js'
import { router as hrReportsRouter } from './routes/hr-reports.js'
import candidateRouter from './routes/candidate.js'
import { router as hrCandidatesRouter } from './routes/hr-candidates.js'
import { router as scheduleRouter } from './routes/schedule.js'
import { router as adminRouter } from './routes/admin.js'
import { router as userPreferencesRouter } from './routes/user-preferences.js'
import { router as userRouter } from './routes/user.js'
import { router as analyticsRouter } from './routes/analytics.js'
import { router as resendRouter } from './routes/resend.js'
import { router as uploadRouter } from './routes/upload.js'
import { router as webhooksRouter } from './routes/webhooks.js'
import { router as templatesRouter } from './routes/templates.js'
import { router as demosRouter } from './routes/demos.js'
import { router as institutionsRouter } from './routes/institutions.js'
import { router as universitiesRouter } from './routes/universities.js'
import { router as rolesRouter } from './routes/roles.js'
import { router as announcementsRouter } from './routes/announcements.js'
import { router as referralsRouter } from './routes/referrals.js'
import { router as adminCertificatesRouter } from './routes/certificates.js'

import { ensureStorageDir } from './utils/storage.js'
import { logger } from './utils/logger.js'
import path from 'path'
import { APPLICATION_INBOX_EMAIL } from './config/applicationInbox.js'
import { apiLimiter } from './middleware/rateLimiter.js'
import { initRedis } from './utils/redis.js'
import { errorHandler } from './utils/errorHandler.js'
import { performanceMonitor } from './middleware/performance.js'
import { ResendService } from './services/resendService.js'
import { AIWorker } from './workers/aiWorker.js'
import { setupMaintenanceJobs } from './queues/maintenanceQueue.js'
import { MaintenanceWorker } from './workers/maintenanceWorker.js'
import { resendWebhookPoller } from './services/resendWebhookPoller.js'

const app = express()
const port = Number(process.env.PORT || 3001)
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 1)
app.set('trust proxy', true)

// Temporarily add to app.ts or any router — remove after testing
app.get('/debug/ip', (req, res) => {
  res.json({
    'req.ip': req.ip,
    'x-forwarded-for header': req.headers['x-forwarded-for'],
    'x-real-ip header': req.headers['x-real-ip'],
    'trust proxy setting': app.get('trust proxy'),
  });
});

const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false
    return compression.filter(req, res)
  }
}))

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)

    // Check if origin is in the explicitly allowed list
    if (allowedOrigins.includes(origin)) return callback(null, true)

    // Dynamic check for all subdomains of optiohire.com
    const isSubdomain = origin.endsWith('.optiohire.com') || origin === 'https://optiohire.com'
    if (isSubdomain) return callback(null, true)

    return callback(new Error(`CORS blocked origin: \${origin}`))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Email'],
}))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(performanceMonitor)
// app.use('/api', apiLimiter) // Completely disabled rate limiting

app.get('/health', async (_req, res) => {
  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  }

  try {
    const { query } = await import('./db/index.js')
    await query('SELECT 1')
    health.database = 'connected'
  } catch (error: any) {
    health.database = 'disconnected'
    health.status = 'degraded'
  }

  res.json(health)
})

app.use('/companies', companiesRouter)
app.use('/jobs', jobsRouter)
app.use('/api/job', jobRouter)
app.use('/api/job-postings', jobPostingsRouter)
app.use('/inbound/applications', inboundApplicationsRouter)
app.use('/applications', applicationsRouter)
app.use('/companies', reportsRouter)
app.use('/api/hr/reports', hrReportsRouter)
app.use('/api/candidate', candidateRouter)
app.use('/api/hr', hrCandidatesRouter)
app.use('/api/webhooks', webhooksRouter)
app.use('/api/system/reports', reportsRouter)
app.use('/api/demos', demosRouter)
app.use('/api/admin/certificates', adminCertificatesRouter)
app.use('/api', scheduleRouter)
app.use('/contact', contactRouter)
app.use('/institution-applications', institutionApplicationsRouter)
app.use('/auth', authRouter)
app.use('/api/admin', adminRouter)
app.use('/api/institutions', institutionsRouter)
app.use('/api/universities', universitiesRouter)
app.use('/api/roles', rolesRouter)
app.use('/api/announcements', announcementsRouter)
app.use('/api/referrals', referralsRouter)
app.use('/api/user', userRouter)

app.use('/api/user/preferences', userPreferencesRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/templates', templatesRouter)

const storageDir = process.env.FILE_STORAGE_DIR || './storage'
app.use('/storage', express.static(path.resolve(storageDir), {
  maxAge: '1y',
  etag: true,
  setHeaders: (res, filePath) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    const ext = path.extname(filePath).toLowerCase()
    if (new Set(['.pdf', '.doc', '.docx', '.txt']).has(ext)) {
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`)
    }
  },
}))
app.use('/api/analytics', analyticsRouter)
app.use('/api/resend', resendRouter)
app.use(errorHandler)

async function start() {
  await ensureStorageDir()

  if (process.env.USE_RESEND === 'true' || process.env.RESEND_API_KEY) {
    try {
      const resendService = new ResendService()
      await resendService.getDiagnostics()
    } catch (err) { }
  }

  const redisEnabled = String(process.env.REDIS_ENABLED || '').trim().toLowerCase() === 'true'
  if (redisEnabled) {
    initRedis()
    new AIWorker()
    logger.info('🤖 BullMQ AI Worker started')

    await setupMaintenanceJobs()
    new MaintenanceWorker()
    logger.info('⚙️ BullMQ Maintenance Worker started')
  } else {
    logger.info('⚠️ Redis is disabled. BullMQ workers will NOT be started.');
  }

  app.listen(port, '0.0.0.0', () => {
    logger.info(`Backend listening on http://0.0.0.0:${port}`)
  })
}

start().catch((err) => {
  logger.error('Failed to start server', { err })
  process.exit(1)
})
// cache test
