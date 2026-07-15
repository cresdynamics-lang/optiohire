import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { getMyReferral, redeemPerk } from '../api/referralController.js'

export const router = Router()

router.get('/me', authenticate, getMyReferral)
router.post('/redeem', authenticate, redeemPerk)
