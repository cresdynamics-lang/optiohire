import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'
import { EmailService } from './emailService.js'

export type InstitutionRequestType = 'support' | 'onboarding_session'

/**
 * Push institution console requests into the central admin support queue
 * so /admin/support and /admin/institutions/requests see them immediately.
 */
export async function fanOutInstitutionRequestToAdmin(opts: {
  institutionId: string
  institutionName?: string
  userEmail?: string | null
  userId?: string | null
  requestType: InstitutionRequestType
  subject: string
  message: string
  referenceId: string
  meta?: Record<string, unknown>
}) {
  try {
    let institutionName = opts.institutionName
    let contactEmail = opts.userEmail || null

    if (!institutionName || !contactEmail) {
      const { rows } = await query<{ name: string; contact_email: string }>(
        `SELECT name, contact_email FROM institutions WHERE id = $1 LIMIT 1`,
        [opts.institutionId]
      )
      institutionName = institutionName || rows[0]?.name || 'Institution partner'
      contactEmail = contactEmail || rows[0]?.contact_email || 'institution@optiohire.com'
    }

    const context = {
      source: 'institution',
      request_type: opts.requestType,
      institution_id: opts.institutionId,
      institution_name: institutionName,
      reference_id: opts.referenceId,
      ...(opts.meta || {}),
    }

    await query(
      `INSERT INTO support_tickets (user_id, user_email, subject, message, status, priority, context_data)
       VALUES ($1, $2, $3, $4, 'open', 'high', $5::jsonb)`,
      [
        opts.userId || null,
        contactEmail,
        `[Institution] ${opts.subject}`,
        opts.message,
        JSON.stringify(context),
      ]
    )

    const adminEmail = process.env.ADMIN_EMAIL || process.env.ADMIN_ALERT_EMAIL || 'admin@optiohire.com'
    try {
      const emailService = new EmailService()
      await emailService.sendEmail({
        to: adminEmail,
        subject: `[OptioHire Admin] New institution ${opts.requestType.replace('_', ' ')} — ${institutionName}`,
        html: `
          <p><strong>${institutionName}</strong> submitted a new ${opts.requestType.replace('_', ' ')}.</p>
          <p><strong>Subject:</strong> ${opts.subject}</p>
          <p style="white-space:pre-wrap">${opts.message}</p>
          <p>Open the <strong>Admin → Institution Requests</strong> panel for live updates.</p>
        `,
        text: `${institutionName} — ${opts.subject}\n\n${opts.message}`,
      })
    } catch (emailErr) {
      logger.warn('Institution admin alert email failed (ticket still queued)', { emailErr })
    }

    logger.info('Institution request fanned out to admin', {
      institutionId: opts.institutionId,
      requestType: opts.requestType,
      referenceId: opts.referenceId,
    })
  } catch (err) {
    logger.error('fanOutInstitutionRequestToAdmin failed', { err, institutionId: opts.institutionId })
  }
}
