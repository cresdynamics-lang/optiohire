import { Router } from 'express'
import { uploadCompanyLogo, upload } from '../api/uploadController.js'
import { authenticate } from '../middleware/auth.js'

export const router = Router()

// Upload company logo (requires authentication)
router.post('/company-logo', authenticate, upload.single('image'), uploadCompanyLogo)
