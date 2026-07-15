import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'
import { EmailService } from '../services/emailService.js'

type TicketSource = 'hr' | 'candidate' | 'institution' | 'admin' | 'user'

function resolveSource(req: AuthRequest, bodySource?: string): TicketSource {
  const explicit = String(bodySource || '').toLowerCase()
  if (explicit === 'hr' || explicit === 'employer') return 'hr'
  if (explicit === 'candidate' || explicit === 'job_seeker') return 'candidate'
  if (explicit === 'institution') return 'institution'
  if (explicit === 'admin') return 'admin'

  const role = String(req.userRole || '').toLowerCase()
  if (role === 'admin') return 'admin'
  if (role === 'candidate' || role === 'job_seeker' || role === 'jobseeker') return 'candidate'
  if (role === 'institution_admin' || role === 'institution') return 'institution'
  return 'hr'
}

function defaultSubject(source: TicketSource): string {
  if (source === 'candidate') return 'Candidate Support Request'
  if (source === 'institution') return 'Institution Support Request'
  if (source === 'admin') return 'Admin Internal Note'
  return 'HR Support Request'
}

/**
 * Create a support ticket that always lands in admin `/admin/support`.
 * Used by HR (`POST /api/hr/support`) and candidates (`POST /api/candidate/support`).
 * Institution tickets use institutionController + fanOutInstitutionRequestToAdmin.
 */
export const createSupportTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { subject, message, contextData, context, email, userId: bodyUserId } = req.body || {}

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message is required to create a support ticket.' })
    }

    const source = resolveSource(req, req.body?.source)
    const userEmail = req.userEmail || email || null
    const userId = req.userId || bodyUserId || null

    if (!userEmail) {
      return res.status(400).json({ error: 'Authenticated user email required.' })
    }

    const contextPayload = {
      source,
      role: req.userRole || source,
      page_context: context || null,
      ...(contextData && typeof contextData === 'object' ? contextData : {}),
    }

    const ticketSubject = subject || defaultSubject(source)

    const result = await query(
      `INSERT INTO support_tickets
         (user_id, user_email, subject, message, status, priority, context_data)
       VALUES ($1, $2, $3, $4, 'open', $5, $6::jsonb)
       RETURNING ticket_id, status, priority, created_at, subject, user_email, context_data`,
      [
        userId,
        userEmail,
        ticketSubject,
        String(message).trim(),
        source === 'candidate' || source === 'institution' ? 'high' : 'normal',
        JSON.stringify(contextPayload),
      ]
    )

    const ticket = result.rows[0]
    logger.info(`New support ticket created: ${ticket.ticket_id}`, { userEmail, source })

    // Non-blocking admin alert email
    const adminEmail = process.env.ADMIN_EMAIL || process.env.ADMIN_ALERT_EMAIL || 'admin@optiohire.com'
    try {
      const emailService = new EmailService()
      await emailService.sendEmail({
        to: adminEmail,
        subject: `[OptioHire Admin] New ${source} support ticket — ${ticketSubject}`,
        html: `
          <p><strong>${userEmail}</strong> (${source}) submitted a support ticket.</p>
          <p><strong>Subject:</strong> ${ticketSubject}</p>
          <p style="white-space:pre-wrap">${String(message).trim()}</p>
          <p>Open <strong>Admin → Support Tickets</strong> to respond.</p>
        `,
        text: `${userEmail} (${source}) — ${ticketSubject}\n\n${String(message).trim()}`,
      })
    } catch (emailErr) {
      logger.warn('Support ticket admin alert email failed (ticket still saved)', { emailErr })
    }

    return res.status(201).json({
      success: true,
      ticket,
      message: 'Support ticket successfully submitted.',
    })
  } catch (error) {
    logger.error('Error creating support ticket:', error)
    return res.status(500).json({ error: 'Failed to create support ticket. Please try again later.' })
  }
}

export const getSupportTickets = async (req: AuthRequest, res: Response) => {
  try {
    const { status, source } = req.query

    let sqlQuery = `
      SELECT ticket_id, user_id, user_email, subject, message, status, priority, context_data, created_at
      FROM support_tickets
      WHERE 1=1
    `
    const params: unknown[] = []

    if (status) {
      params.push(status)
      sqlQuery += ` AND status = $${params.length}`
    }

    if (source) {
      params.push(String(source))
      sqlQuery += ` AND context_data->>'source' = $${params.length}`
    }

    sqlQuery += ` ORDER BY created_at DESC LIMIT 200`

    const result = await query(sqlQuery, params)

    return res.json({
      success: true,
      tickets: result.rows,
    })
  } catch (error) {
    logger.error('Error fetching support tickets:', error)
    return res.status(500).json({ error: 'Failed to fetch support tickets.' })
  }
}
