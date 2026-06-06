import { Router } from 'express'
import { parseEmailApplications, scoreApplication, submitPublicApplication, getApplicationAudit } from '../api/applicationsController.js'
import { authenticate, requireHR } from '../middleware/auth.js'
import rateLimit from 'express-rate-limit'

const applyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 requests per 5 minutes
  message: { error: 'Too many applications submitted. Please try again later.' }
})

export const router = Router()

router.post('/parse-email', parseEmailApplications)
router.post('/score', authenticate, requireHR, scoreApplication)
router.post('/public-submit', applyLimiter, submitPublicApplication)
router.get('/:id/audit', authenticate, requireHR, getApplicationAudit)


