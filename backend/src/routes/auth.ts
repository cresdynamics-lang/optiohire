import { Router } from 'express'
import { hrSignup, hrSignin, candidateSignup, candidateSignin, adminSignin, forgotPassword, verifyResetToken, verifyResetCode, resetPassword, sendSignupVerificationEmail, verifyEmail, googleSignIn } from '../api/authController.js'
import { authLimiter, passwordResetRequestLimiter, passwordResetFlowLimiter } from '../middleware/rateLimiter.js'

export const router = Router()

// Apply rate limiting to auth routes
router.post('/hr/signup', authLimiter, hrSignup)
router.post('/hr/signin', authLimiter, hrSignin)
router.post('/candidate/signup', authLimiter, candidateSignup)
router.post('/candidate/signin', authLimiter, candidateSignin)
router.post('/admin/signin', adminSignin) // Admin login without rate limiting
router.post('/google', authLimiter, googleSignIn)
router.post('/forgot-password', passwordResetRequestLimiter, forgotPassword)
router.post('/verify-reset-token', passwordResetFlowLimiter, verifyResetToken)
router.post('/verify-reset-code', passwordResetFlowLimiter, verifyResetCode)
router.post('/reset-password', passwordResetFlowLimiter, resetPassword)
router.post('/send-signup-verification-email', authLimiter, sendSignupVerificationEmail)
router.post('/verify-email', authLimiter, verifyEmail)
router.get('/health', (_req, res) => res.json({ ok: true }))


