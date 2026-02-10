import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { ResendService } from '../services/resendService.js'
import { logger } from '../utils/logger.js'

export const router = Router()

// Initialize Resend service
const resendService = new ResendService()

/**
 * GET /api/resend/domains
 * List all verified domains
 */
router.get('/domains', authenticate, async (req, res) => {
  try {
    const domains = await resendService.listDomains()
    res.json({ domains })
  } catch (error: any) {
    logger.error('Failed to list domains:', error)
    res.status(500).json({ error: 'Failed to list domains', details: error.message })
  }
})

/**
 * GET /api/resend/domains/:domain
 * Get domain verification status
 */
router.get('/domains/:domain', authenticate, async (req, res) => {
  try {
    const { domain } = req.params
    const domainInfo = await resendService.getDomainStatus(domain)
    res.json({ domain: domainInfo })
  } catch (error: any) {
    logger.error('Failed to get domain status:', error)
    res.status(500).json({ error: 'Failed to get domain status', details: error.message })
  }
})

/**
 * GET /api/resend/verify
 * Verify Resend API connection and domain status
 */
router.get('/verify', authenticate, async (req, res) => {
  try {
    const isConnected = await resendService.verifyConnection()
    const domains = await resendService.listDomains()
    
    res.json({
      connected: isConnected,
      domains: domains.map((d: any) => ({
        name: d.name,
        status: d.status,
        region: d.region,
        createdAt: d.created_at
      }))
    })
  } catch (error: any) {
    logger.error('Failed to verify Resend:', error)
    res.status(500).json({ error: 'Failed to verify Resend', details: error.message })
  }
})

