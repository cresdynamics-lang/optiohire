import { Router } from 'express'
import { authenticate, requireHR } from '../middleware/auth.js'
import { 
  createJobPosting, 
  getJobPostings, 
  sendJobPostingCreatedNotification,
  getJobPostingById,
  updateJobPosting,
  deleteJobPosting,
  getPublicJobPostings,
  getPublicJobPostingById,
  getPublicCompanyJobPostings,
  generateQuestions
} from '../api/jobPostingsController.js'

export const router = Router()

// Public routes (must be before authenticated routes or have specific paths)
router.get('/public', getPublicJobPostings)
router.get('/public/:id', getPublicJobPostingById)
router.get('/public/company/:companyId', getPublicCompanyJobPostings)

// Authenticated routes
router.post('/generate-questions', authenticate, requireHR, generateQuestions)
router.get('/', authenticate, requireHR, getJobPostings)
router.post('/', authenticate, requireHR, createJobPosting)
router.get('/:id', authenticate, requireHR, getJobPostingById)
router.patch('/:id', authenticate, requireHR, updateJobPosting)
router.delete('/:id', authenticate, requireHR, deleteJobPosting)
router.post('/send-created-notification', authenticate, requireHR, sendJobPostingCreatedNotification)


