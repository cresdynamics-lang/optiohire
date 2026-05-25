import { Router } from 'express'
import {
  uploadCompanyLogo,
  upload,
  uploadCandidateDocument,
  uploadCandidateDocumentMiddleware,
  uploadPublicCandidateDocument,
} from '../api/uploadController.js'
import { authenticate } from '../middleware/auth.js'

export const router = Router()

// Upload company logo (requires authentication)
router.post('/company-logo', authenticate, upload.single('image'), uploadCompanyLogo)
router.post(
  '/candidate-document',
  authenticate,
  uploadCandidateDocumentMiddleware.single('document'),
  uploadCandidateDocument
)
router.post(
  '/public-candidate-document',
  uploadCandidateDocumentMiddleware.single('document'),
  uploadPublicCandidateDocument
)

