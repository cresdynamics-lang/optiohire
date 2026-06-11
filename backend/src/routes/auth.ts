import { Router } from 'express'
import { 
  signup,
  signin,
  hrSignup, 
  hrSignin, 
  candidateSignup, 
  candidateSignin, 
  adminSignin, 
  forgotPassword, 
  verifyResetToken, 
  verifyResetCode, 
  resetPassword, 
  sendSignupVerificationEmail, 
  verifyEmail, 
  googleSignIn 
} from '../api/authController.js'
import { authLimiter, passwordResetRequestLimiter, passwordResetFlowLimiter } from '../middleware/rateLimiter.js'

export const router = Router()

// Generic Auth Endpoints (used by frontend proxies)
router.post('/signup', authLimiter, signup)
router.post('/signin', authLimiter, signin)
router.post('/admin-signin', adminSignin)

// Role-specific Auth Endpoints
router.post('/hr/signup', authLimiter, hrSignup)
router.post('/hr/signin', authLimiter, hrSignin)
router.post('/candidate/signup', authLimiter, candidateSignup)
router.post('/candidate/signin', authLimiter, candidateSignin)
router.post('/admin/signin', adminSignin)

// Submission Aliases (requested by user)
router.post('/hr/submit', authLimiter, hrSignin)
router.post('/hr/submission', authLimiter, hrSignin)
router.post('/candidate/submit', authLimiter, candidateSignin)
router.post('/candidate/submission', authLimiter, candidateSignin)
router.post('/admin/submit', adminSignin)
router.post('/admin/submission', adminSignin)

// OAuth & Reset Flow
router.post('/google', authLimiter, googleSignIn)
router.post('/forgot-password', passwordResetRequestLimiter, forgotPassword)
router.post('/verify-reset-token', passwordResetFlowLimiter, verifyResetToken)
router.post('/verify-reset-code', passwordResetFlowLimiter, verifyResetCode)
router.post('/reset-password', passwordResetFlowLimiter, resetPassword)
router.post('/send-signup-verification-email', authLimiter, sendSignupVerificationEmail)
router.post('/verify-email', authLimiter, verifyEmail)

router.get('/health', (_req, res) => res.json({ ok: true }))


