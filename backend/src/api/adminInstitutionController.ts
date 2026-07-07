import { Request, Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'
import { EmailService } from '../services/emailService.js'
import crypto from 'crypto'

export async function createOnboardingInvite(req: AuthRequest, res: Response) {
  try {
    const { institutionName, contactEmail } = req.body

    if (!institutionName || !contactEmail) {
      return res.status(400).json({ error: 'Institution name and contact email are required' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    
    // Save to DB
    const { rows } = await query(
      `INSERT INTO institution_onboarding_invites (token, institution_name, sent_to, status) 
       VALUES ($1, $2, $3, 'not_opened') RETURNING *`,
      [token, institutionName, contactEmail]
    )

    // Send email
    const emailService = new EmailService()
    await emailService.sendInstitutionOnboardingInvite({
      institutionName,
      contactEmail,
      token
    })

    return res.status(201).json(rows[0])
  } catch (error) {
    logger.error('Error creating onboarding invite:', error)
    return res.status(500).json({ error: 'Failed to create onboarding invite' })
  }
}

export async function getOnboardingInvites(req: AuthRequest, res: Response) {
  try {
    const { rows } = await query(
      `SELECT * FROM institution_onboarding_invites ORDER BY sent_at DESC`
    )
    return res.json(rows)
  } catch (error) {
    logger.error('Error fetching onboarding invites:', error)
    return res.status(500).json({ error: 'Failed to fetch onboarding invites' })
  }
}

export async function resendOnboardingInvite(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params

    const { rows } = await query(
      `SELECT * FROM institution_onboarding_invites WHERE id = $1`,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invite not found' })
    }

    const invite = rows[0]

    // Update sent_at timestamp
    await query(
      `UPDATE institution_onboarding_invites SET sent_at = now() WHERE id = $1`,
      [id]
    )

    // Send email
    const emailService = new EmailService()
    await emailService.sendInstitutionOnboardingInvite({
      institutionName: invite.institution_name,
      contactEmail: invite.sent_to,
      token: invite.token
    })

    return res.json({ message: 'Invite resent successfully' })
  } catch (error) {
    logger.error('Error resending onboarding invite:', error)
    return res.status(500).json({ error: 'Failed to resend onboarding invite' })
  }
}
