import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import { EmailService } from '../services/emailService.js'
import { logger } from '../utils/logger.js'

const ALLOWED_TYPES = new Set(['enterprise', 'institution', 'university', 'other'])

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function createInstitutionApplication(req: Request, res: Response) {
  try {
    const {
      organizationName,
      organizationType,
      contactName,
      contactEmail,
      contactPhone,
      country,
      teamSize,
      message,
    } = req.body || {}

    if (!organizationName || !contactName || !contactEmail) {
      return res.status(422).json({ message: 'Organization name, contact name and email are required.' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(String(contactEmail))) {
      return res.status(422).json({ message: 'Please provide a valid email address.' })
    }

    const type = ALLOWED_TYPES.has(String(organizationType)) ? String(organizationType) : 'enterprise'

    const result = await query(
      `INSERT INTO institution_applications
        (organization_name, organization_type, contact_name, contact_email, contact_phone, country, team_size, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, created_at`,
      [
        String(organizationName).trim(),
        type,
        String(contactName).trim(),
        String(contactEmail).toLowerCase().trim(),
        contactPhone ? String(contactPhone).trim() : null,
        country ? String(country).trim() : null,
        teamSize ? String(teamSize).trim() : null,
        message ? String(message).trim() : null,
      ]
    )

    const applicationId = result.rows?.[0]?.id

    // Fire-and-forget notifications — never block the applicant on email delivery.
    const inbox = (process.env.SALES_RECEIVER_EMAIL || process.env.CONTACT_RECEIVER_EMAIL || process.env.APPLICATION_INBOX_EMAIL || process.env.IMAP_USER || 'jobs@optiohire.com')
      .toLowerCase()
      .trim()

    const safe = {
      org: escapeHtml(String(organizationName)),
      type: escapeHtml(type),
      name: escapeHtml(String(contactName)),
      email: escapeHtml(String(contactEmail)),
      phone: escapeHtml(contactPhone ? String(contactPhone) : '—'),
      country: escapeHtml(country ? String(country) : '—'),
      teamSize: escapeHtml(teamSize ? String(teamSize) : '—'),
      message: escapeHtml(message ? String(message) : '—').replace(/\n/g, '<br/>'),
    }

    try {
      const emailService = new EmailService()

      // 1) Notify the OptioHire team so they can start onboarding/coordination.
      await emailService.sendEmail({
        to: inbox,
        subject: `[Enterprise Application] ${String(organizationName)} (${type})`,
        replyTo: String(contactEmail),
        emailType: 'notification',
        useSecondaryKey: true,
        html: `
          <h2>New Enterprise / Institution Application</h2>
          <p><strong>Organization:</strong> ${safe.org}</p>
          <p><strong>Type:</strong> ${safe.type}</p>
          <p><strong>Contact:</strong> ${safe.name}</p>
          <p><strong>Email:</strong> ${safe.email}</p>
          <p><strong>Phone:</strong> ${safe.phone}</p>
          <p><strong>Country:</strong> ${safe.country}</p>
          <p><strong>Team size:</strong> ${safe.teamSize}</p>
          <p><strong>Message:</strong></p>
          <p>${safe.message}</p>
          <hr/>
          <p style="color:#64748b;font-size:12px">Application ID: ${applicationId || 'n/a'}</p>
        `,
        text: `New Enterprise / Institution Application
Organization: ${organizationName}
Type: ${type}
Contact: ${contactName}
Email: ${contactEmail}
Phone: ${contactPhone || '—'}
Country: ${country || '—'}
Team size: ${teamSize || '—'}

Message:
${message || '—'}

Application ID: ${applicationId || 'n/a'}`,
      })

      // 2) Confirmation to the applicant.
      await emailService.sendEmail({
        to: String(contactEmail),
        subject: 'We received your OptioHire application',
        emailType: 'notification',
        html: `
          <h2>Thanks, ${safe.name} 👋</h2>
          <p>We've received ${safe.org}'s request to get started with OptioHire.</p>
          <p>Our team will reach out shortly to onboard you and coordinate next steps — including setup, a walkthrough, and tailoring the platform to your hiring workflow.</p>
          <p>In the meantime, feel free to reply to this email with anything you'd like us to know.</p>
          <p>— The OptioHire Team</p>
        `,
        text: `Thanks, ${contactName}.

We've received ${organizationName}'s request to get started with OptioHire. Our team will reach out shortly to onboard you and coordinate next steps.

— The OptioHire Team`,
      })
    } catch (emailErr) {
      logger.error('Failed to send institution application emails', { error: (emailErr as Error)?.message })
      // Application is already stored — don't fail the request over email.
    }

    return res.status(201).json({ message: 'Application received.', id: applicationId })
  } catch (err) {
    logger.error('createInstitutionApplication failed', { error: (err as Error)?.message })
    return res.status(500).json({ message: 'Unexpected server error.' })
  }
}
