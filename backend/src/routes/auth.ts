import { Router } from 'express'
import { signup, signin, forgotPassword, verifyResetToken, verifyResetCode, resetPassword } from '../api/authController.js'
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js'

export const router = Router()

// Apply rate limiting to auth routes
router.post('/signup', authLimiter, signup)
router.post('/signin', authLimiter, signin)
router.post('/forgot-password', passwordResetLimiter, forgotPassword)
router.post('/verify-reset-token', passwordResetLimiter, verifyResetToken)
router.post('/verify-reset-code', passwordResetLimiter, verifyResetCode)
router.post('/reset-password', passwordResetLimiter, resetPassword)
router.get('/health', (_req, res) => res.json({ ok: true }))


