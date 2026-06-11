import { Router } from 'express'
import { getCandidatesByJob, getCandidateById, updateCandidateStatus } from '../api/hrCandidatesController.js'
import { sendCandidateMessages, generateMessageWithAI } from '../api/hrMessagesController.js'
import { hrChat } from '../api/hrChatController.js'
import { createSupportTicket } from '../api/supportController.js'
import { authenticate, requireHR } from '../middleware/auth.js'
import { hrSignin, hrSignup } from '../api/authController.js'
import rateLimit from 'express-rate-limit'

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes (Claude style)
  max: 50, // Limit each IP to 50 requests per window
  message: { error: 'Chat rate limit exceeded. Please try again later.' }
})

const supportLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per window
  message: { error: 'Too many support tickets created. Please try again later.' }
})

export const router = Router()

// Public submission endpoints for HR authentication
router.post('/submit', hrSignin)
router.post('/submission', hrSignin)
router.post('/signup', hrSignup)

router.use(authenticate)
router.use(requireHR)

router.get('/candidates', getCandidatesByJob)
router.get('/candidates/:id', getCandidateById)
router.patch('/candidates/:id/status', updateCandidateStatus)
router.post('/chat', chatLimiter, hrChat)
router.post('/messages', sendCandidateMessages)
router.post('/messages/generate', generateMessageWithAI)
router.post('/support', supportLimiter, createSupportTicket)
