import { Router } from 'express'
import { getTemplates, saveTemplate } from '../api/templatesController.js'
import { authenticate } from '../middleware/auth.js'

export const router = Router()

router.get('/', authenticate, getTemplates)
router.put('/', authenticate, saveTemplate)
