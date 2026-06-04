import express from 'express'
import cors from 'cors'
import { router as companiesRouter } from '../../routes/companies.js'
import { router as jobsRouter } from '../../routes/jobs.js'
import { router as jobRouter } from '../../routes/job.js'
import { router as jobPostingsRouter } from '../../routes/job-postings.js'
import { router as inboundApplicationsRouter } from '../../routes/inbound-applications.js'
import { router as applicationsRouter } from '../../routes/applications.js'
import { router as reportsRouter } from '../../routes/reports.js'
import { router as contactRouter } from '../../routes/contact.js'
import { router as authRouter } from '../../routes/auth.js'
import { router as hrReportsRouter } from '../../routes/hr-reports.js'
import { router as hrCandidatesRouter } from '../../routes/hr-candidates.js'
import { router as scheduleRouter } from '../../routes/schedule.js'
import { router as adminRouter } from '../../routes/admin.js'
import { router as userPreferencesRouter } from '../../routes/user-preferences.js'
import { router as userRouter } from '../../routes/user.js'
import { router as analyticsRouter } from '../../routes/analytics.js'
import { router as resendRouter } from '../../routes/resend.js'
import { router as uploadRouter } from '../../routes/upload.js'
import { router as webhooksRouter } from '../../routes/webhooks.js'
import { router as templatesRouter } from '../../routes/templates.js'
import { errorHandler } from '../../utils/errorHandler.js'

export function createTestApp() {
  const app = express()
  
  app.use(cors())
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true }))

  app.use('/companies', companiesRouter)
  app.use('/jobs', jobsRouter)
  app.use('/api/job', jobRouter)
  app.use('/api/job-postings', jobPostingsRouter)
  app.use('/inbound/applications', inboundApplicationsRouter)
  app.use('/applications', applicationsRouter)
  app.use('/companies', reportsRouter)
  app.use('/api/hr/reports', hrReportsRouter)
  app.use('/api/hr', hrCandidatesRouter)
  app.use('/api/webhooks', webhooksRouter)
  app.use('/api/system/reports', reportsRouter)
  app.use('/api', scheduleRouter)
  app.use('/contact', contactRouter)
  app.use('/auth', authRouter)
  app.use('/api/admin', adminRouter)
  app.use('/api/user', userRouter)
  app.use('/api/user/preferences', userPreferencesRouter)
  app.use('/api/upload', uploadRouter)
  app.use('/api/templates', templatesRouter)
  app.use('/api/analytics', analyticsRouter)
  app.use('/api/resend', resendRouter)
  
  app.use(errorHandler)
  
  return app
}
