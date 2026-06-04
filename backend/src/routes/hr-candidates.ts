import { Router } from 'express'
import { getCandidatesByJob, getCandidateById, updateCandidateStatus } from '../api/hrCandidatesController.js'
import { sendCandidateMessages, generateMessageWithAI } from '../api/hrMessagesController.js'
import { hrChat } from '../api/hrChatController.js'
import { createSupportTicket } from '../api/supportController.js'
import { authenticate, requireHR } from '../middleware/auth.js'

export const router = Router()

router.use(authenticate)
router.use(requireHR)

router.get('/candidates', getCandidatesByJob)
router.get('/candidates/:id', getCandidateById)
router.patch('/candidates/:id/status', updateCandidateStatus)
router.post('/chat', hrChat)
router.post('/messages', sendCandidateMessages)
router.post('/messages/generate', generateMessageWithAI)
router.post('/support', createSupportTicket)
