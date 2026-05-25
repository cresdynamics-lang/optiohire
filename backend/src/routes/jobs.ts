import { Router } from 'express'
import { createJob, getApplicantsByJob, getPublicJobs, getPublicJobById } from '../api/jobsController.js'

export const router = Router()

router.get('/', getPublicJobs)
router.get('/:id', getPublicJobById)
router.post('/', createJob)
router.get('/:id/applicants', getApplicantsByJob)



