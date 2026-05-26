import { Router } from 'express'
import { parseEmailApplications, scoreApplication, submitPublicApplication, getApplicationAudit } from '../api/applicationsController.js'

export const router = Router()

router.post('/parse-email', parseEmailApplications)
router.post('/score', scoreApplication)
router.post('/public-submit', submitPublicApplication)
router.get('/:id/audit', getApplicationAudit)


