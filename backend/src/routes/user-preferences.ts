import { Router } from 'express'
import { getUserPreferences, updateUserPreferences } from '../api/userPreferencesController.js'
import { authenticate } from '../middleware/auth.js'

export const router = Router()

router.get('/', authenticate, getUserPreferences)
router.put('/', authenticate, updateUserPreferences)

