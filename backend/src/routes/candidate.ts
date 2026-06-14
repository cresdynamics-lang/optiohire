import { Router } from 'express'
import { authenticate, requireCandidate } from '../middleware/auth.js'
import { candidateSignin, candidateSignup } from '../api/authController.js'
import {
  completeMission,
  getCandidateDashboard,
  getLearningRoadmap,
  getLeaderboard,
  uploadCertificate,
} from '../api/candidateController.js'
import { uploadCandidateDocumentMiddleware } from '../api/uploadController.js'

const router = Router()

// Public submission endpoints for candidate authentication
router.post('/submit', candidateSignin)
router.post('/submission', candidateSignin)
router.post('/signup', candidateSignup)

router.use(authenticate) // Ensure user is logged in
router.use(requireCandidate) // Ensure user is a candidate

router.get('/dashboard', getCandidateDashboard)
router.get('/jobs', getCandidateJobs)
router.get('/applications', getCandidateApplications)
router.post('/applications', submitCandidateApplication)
router.get('/roadmap', getLearningRoadmap)
router.post('/certificate', uploadCandidateDocumentMiddleware.single('certificate'), uploadCertificate)
router.post('/missions/:missionId/complete', completeMission)
router.get('/leaderboard', getLeaderboard)

export default router
