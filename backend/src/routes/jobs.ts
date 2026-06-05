import { Router } from 'express'
import { createJob, getApplicantsByJob, getPublicJobs, getPublicJobById } from '../api/jobsController.js'
import { authenticate, requireHR } from '../middleware/auth.js'

export const router = Router()

router.get('/', getPublicJobs)
router.get('/:id', getPublicJobById)
router.post('/', authenticate, requireHR, createJob)
router.get('/:id/applicants', authenticate, requireHR, getApplicantsByJob)



