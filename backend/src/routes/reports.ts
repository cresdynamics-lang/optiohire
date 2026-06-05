import { Router } from 'express'
import { generateReport, getReport, autoGenerateReports } from '../api/reportsController.js'
import { authenticate, requireHR } from '../middleware/auth.js'

export const router = Router()

// Manual report generation (HR/admin only)
router.post('/generate', authenticate, requireHR, generateReport)

// Get report for a job
router.get('/:jobId', authenticate, requireHR, getReport)

// Auto-generate reports (cron endpoint)
router.post('/auto-generate', autoGenerateReports)
