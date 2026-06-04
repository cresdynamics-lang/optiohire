import { Router } from 'express'
import { getTemplates, saveTemplate } from '../api/templatesController.js'
import { authenticate, requireHR } from '../middleware/auth.js'

export const router = Router()

router.get('/', authenticate, requireHR, getTemplates)
router.put('/', authenticate, requireHR, saveTemplate)
