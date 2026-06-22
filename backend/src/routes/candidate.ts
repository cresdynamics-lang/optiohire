import { Router } from 'express'
import multer from 'multer'
import { authenticate, requireCandidate } from '../middleware/auth.js'
import { candidateSignin, candidateSignup } from '../api/authController.js'
import {
  completeMission,
  getCandidateDashboard,
  getLearningRoadmap,
  getLeaderboard,
  uploadCertificate,
  onboardProfile,
  getCandidateJobs,
  getCandidateApplications,
  submitCandidateApplication,
} from '../api/candidateController.js'
import { uploadCandidateDocumentMiddleware } from '../api/uploadController.js'

const router = Router()

// Public submission endpoints for candidate authentication
router.post('/submit', candidateSignin)
router.post('/submission', candidateSignin)
router.post('/signup', candidateSignup)

router.use(authenticate) // Ensure user is logged in
router.get('/leaderboard', getLeaderboard)

router.use(requireCandidate) // Ensure user is a candidate

router.get('/dashboard', getCandidateDashboard)
router.get('/jobs', getCandidateJobs)
router.get('/applications', getCandidateApplications)
router.post('/applications', submitCandidateApplication)
router.get('/roadmap', getLearningRoadmap)

router.post('/profile/onboarding', (req, res, next) => {
  const uploadMiddleware = uploadCandidateDocumentMiddleware.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 },
    { name: 'recommendationLetter', maxCount: 1 }
  ])
  
  uploadMiddleware(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, error: 'File upload error', details: err.message })
    } else if (err) {
      return res.status(400).json({ success: false, error: 'Invalid file', details: err.message })
    }
    next()
  })
}, onboardProfile)
router.post('/certificate', uploadCandidateDocumentMiddleware.single('certificate'), uploadCertificate)
router.post('/missions/:missionId/complete', completeMission)

export default router
