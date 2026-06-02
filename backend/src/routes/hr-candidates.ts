import { Router } from 'express'
import { getCandidatesByJob, getCandidateById, updateCandidateStatus } from '../api/hrCandidatesController.js'
import { sendCandidateMessages, generateMessageWithAI } from '../api/hrMessagesController.js'
import { hrChat } from '../api/hrChatController.js'
import { createSupportTicket } from '../api/supportController.js'
import { authenticate } from '../middleware/auth.js'

export const router = Router()

router.get('/candidates', authenticate, getCandidatesByJob)
router.get('/candidates/:id', authenticate, getCandidateById)
router.patch('/candidates/:id/status', authenticate, updateCandidateStatus)
router.post('/chat', authenticate, hrChat)
router.post('/messages', authenticate, sendCandidateMessages)
router.post('/messages/generate', authenticate, generateMessageWithAI)
router.post('/support', authenticate, createSupportTicket)
