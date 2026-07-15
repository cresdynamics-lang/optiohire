import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { listPlatformAnnouncements } from '../api/announcementsController.js'

export const router = Router()

router.get('/', authenticate, listPlatformAnnouncements)
