import { Router } from 'express'
import {
  uploadCompanyLogo,
  upload,
  uploadCandidateDocument,
  uploadCandidateDocumentMiddleware,
  uploadPublicCandidateDocument,
} from '../api/uploadController.js'
import { authenticate, requireHR, requireCandidate } from '../middleware/auth.js'

export const router = Router()

// Upload company logo (requires HR)
router.post('/company-logo', authenticate, requireHR, upload.single('image'), uploadCompanyLogo)
router.post(
  '/candidate-document',
  authenticate,
  requireCandidate,
  uploadCandidateDocumentMiddleware.single('document'),
  uploadCandidateDocument
)
router.post(
  '/public-candidate-document',
  uploadCandidateDocumentMiddleware.single('document'),
  uploadPublicCandidateDocument
)

