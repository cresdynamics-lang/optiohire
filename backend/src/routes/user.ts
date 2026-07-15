import { Router } from 'express'
import { getCurrentUser, updateUserCompany, deleteSelf, updateUserProfile, changeUserPassword } from '../api/userController.js'
import { authenticate, optionalAuthenticate } from '../middleware/auth.js'

export const router = Router()

router.get('/me', optionalAuthenticate, getCurrentUser)
router.put('/company', authenticate, updateUserCompany)
router.patch('/profile', authenticate, updateUserProfile)
router.post('/password', authenticate, changeUserPassword)
router.delete('/delete-account', authenticate, deleteSelf)
router.delete('/me', authenticate, deleteSelf)

