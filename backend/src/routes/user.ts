import { Router } from 'express'
import { getCurrentUser, updateUserCompany } from '../api/userController.js'
import { authenticate, optionalAuthenticate } from '../middleware/auth.js'

export const router = Router()

router.get('/me', optionalAuthenticate, getCurrentUser)
router.put('/company', authenticate, updateUserCompany)

