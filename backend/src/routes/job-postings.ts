import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { 
  createJobPosting, 
  getJobPostings, 
  sendJobPostingCreatedNotification,
  getPublicJobPostings,
  getPublicJobPostingById,
  getPublicCompanyJobPostings
} from '../api/jobPostingsController.js'

export const router = Router()

// Public routes (must be before authenticated routes or have specific paths)
router.get('/public', getPublicJobPostings)
router.get('/public/:id', getPublicJobPostingById)
router.get('/public/company/:companyId', getPublicCompanyJobPostings)

// Authenticated routes
router.get('/', authenticate, getJobPostings)
router.post('/', authenticate, createJobPosting)
router.post('/send-created-notification', authenticate, sendJobPostingCreatedNotification)


