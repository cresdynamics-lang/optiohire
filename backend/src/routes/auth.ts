import { Router } from 'express'
import { signup, signin, adminSignin, forgotPassword, verifyResetToken, verifyResetCode, resetPassword, sendSignupVerificationEmail, verifyEmail, googleSignIn } from '../api/authController.js'
import { authLimiter, passwordResetRequestLimiter, passwordResetFlowLimiter } from '../middleware/rateLimiter.js'

export const router = Router()

// Apply rate limiting to auth routes
router.post('/signup', authLimiter, signup)
router.post('/signin', authLimiter, signin)
router.post('/admin-signin', adminSignin) // Admin login without rate limiting
router.post('/google', authLimiter, googleSignIn)
router.post('/forgot-password', passwordResetRequestLimiter, forgotPassword)
router.post('/verify-reset-token', passwordResetFlowLimiter, verifyResetToken)
router.post('/verify-reset-code', passwordResetFlowLimiter, verifyResetCode)
router.post('/reset-password', passwordResetFlowLimiter, resetPassword)
router.post('/send-signup-verification-email', authLimiter, sendSignupVerificationEmail)
router.post('/verify-email', authLimiter, verifyEmail)
router.get('/health', (_req, res) => res.json({ ok: true }))


