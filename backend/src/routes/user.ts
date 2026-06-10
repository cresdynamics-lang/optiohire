import { Router } from 'express'
import { getCurrentUser, updateUserCompany, deleteSelf } from '../api/userController.js'
import { authenticate, optionalAuthenticate } from '../middleware/auth.js'

export const router = Router()

router.get('/me', optionalAuthenticate, getCurrentUser)
router.put('/company', authenticate, updateUserCompany)
router.delete('/delete-account', authenticate, deleteSelf)

