import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { getPendingCertificates, approveCertificate } from '../api/adminCertificateController.js'

export const router = Router()

router.get('/pending', authenticate, requireAdmin, getPendingCertificates)
router.post('/approve', authenticate, requireAdmin, approveCertificate)
