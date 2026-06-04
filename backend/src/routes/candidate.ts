import { Router } from 'express'
import { authenticate, requireCandidate } from '../middleware/auth.js'
import { getCandidateDashboard, getLearningRoadmap, uploadCertificate } from '../api/candidateController.js'
import { uploadCandidateDocumentMiddleware } from '../api/uploadController.js'

const router = Router()

router.use(authenticate) // Ensure user is logged in
router.use(requireCandidate) // Ensure user is a candidate

router.get('/dashboard', getCandidateDashboard)
router.get('/roadmap', getLearningRoadmap)
router.post('/certificate', uploadCandidateDocumentMiddleware.single('certificate'), uploadCertificate)

export default router
