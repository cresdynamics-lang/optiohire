import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { scheduleDemo, getAdminDemos, markDemoSeen } from '../api/demosController.js'

const router = express.Router()

router.post('/', authenticate, scheduleDemo)
router.get('/admin', authenticate, getAdminDemos)
router.put('/admin/:id/seen', authenticate, markDemoSeen)

export default router
