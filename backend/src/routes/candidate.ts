import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { getCandidateDashboard, getLearningRoadmap, uploadCertificate } from '../api/candidateController.js'

const router = Router()

router.use(authenticate) // Ensure user is logged in

router.get('/dashboard', getCandidateDashboard)
router.get('/roadmap', getLearningRoadmap)
router.post('/certificate', uploadCertificate)

export default router
