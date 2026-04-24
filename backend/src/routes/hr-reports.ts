import { Router } from 'express'
import { generateReport, getReport } from '../api/reportsController.js'
import { authenticate } from '../middleware/auth.js'

export const router = Router()

// Manual report generation (HR/admin only)
router.post('/generate', authenticate, generateReport)

// Get report for a job
router.get('/:jobId', authenticate, getReport)

