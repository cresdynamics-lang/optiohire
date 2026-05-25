import { Router } from 'express'
import {
  uploadCompanyLogo,
  upload,
  uploadCandidateDocument,
  uploadCandidateDocumentMiddleware,
  uploadPublicResume,
} from '../api/uploadController.js'
import { authenticate } from '../middleware/auth.js'

export const router = Router()

// Public routes
router.post(
  '/public-resume',
  uploadCandidateDocumentMiddleware.single('resume'),
  uploadPublicResume
)

// Upload company logo (requires authentication)
router.post('/company-logo', authenticate, upload.single('image'), uploadCompanyLogo)
router.post(
  '/candidate-document',
  authenticate,
  uploadCandidateDocumentMiddleware.single('document'),
  uploadCandidateDocument
)
