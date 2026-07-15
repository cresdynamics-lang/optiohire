import { Router } from 'express'
import {
  uploadCompanyLogo,
  uploadProfileImage,
  upload,
  uploadCandidateDocument,
  uploadCandidateDocumentMiddleware,
  uploadPublicCandidateDocument,
  uploadJobPoster,
} from '../api/uploadController.js'
import { authenticate, requireHR, requireCandidate } from '../middleware/auth.js'

export const router = Router()

// Upload company logo (requires HR)
router.post('/company-logo', authenticate, requireHR, upload.single('image'), uploadCompanyLogo)
// Generic brand/avatar upload for any authenticated portal user
router.post('/profile-image', authenticate, upload.single('image'), uploadProfileImage)
router.post(
  '/candidate-document',
  authenticate,
  requireCandidate,
  uploadCandidateDocumentMiddleware.single('document'),
  uploadCandidateDocument
)
router.post('/job-poster', authenticate, upload.single('poster'), uploadJobPoster)
router.post(
  '/public-candidate-document',
  uploadCandidateDocumentMiddleware.single('document'),
  uploadPublicCandidateDocument
)

