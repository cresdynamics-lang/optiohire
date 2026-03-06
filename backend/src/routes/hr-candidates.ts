import { Router } from 'express'
import { getCandidatesByJob, getCandidateById } from '../api/hrCandidatesController.js'
import { hrChat } from '../api/hrChatController.js'
import { authenticate } from '../middleware/auth.js'

export const router = Router()

router.get('/candidates', authenticate, getCandidatesByJob)
router.get('/candidates/:id', authenticate, getCandidateById)
router.post('/chat', authenticate, hrChat)

