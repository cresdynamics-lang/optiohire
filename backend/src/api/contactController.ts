import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import { EmailService } from '../services/emailService.js'


export async function createContact(req: Request, res: Response) {
  try {
    const { fullName, email, company, role, topic, message, captchaToken } = req.body || {}
    
    if (!fullName || !email || !company || !role || !topic || !message) {
      return res.status(422).json({ message: 'Invalid contact submission.' })
    }
    await query(
      `insert into audit_logs (action, metadata)
       values ('CONTACT_REQUEST', $1::jsonb)`,
      [JSON.stringify({ fullName, email, company, role, topic, message })]
    )

    const inbox = (process.env.CONTACT_RECEIVER_EMAIL || process.env.APPLICATION_INBOX_EMAIL || process.env.IMAP_USER || 'jobs@optiohire.com')
      .toLowerCase()
      .trim()
    const emailService = new EmailService()
    const safeTopic = String(topic)
    const safeName = String(fullName)
    const safeEmail = String(email)
    const safeCompany = String(company)
    const safeRole = String(role)
    const safeMessage = String(message)
    await emailService.sendEmail({
      to: inbox,
      subject: `[Demo/Contact] ${safeTopic} - ${safeCompany}`,
      replyTo: safeEmail,
      emailType: 'notification',
      useSecondaryKey: true,
      html: `
        <h2>New Contact Request</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Company:</strong> ${safeCompany}</p>
        <p><strong>Role:</strong> ${safeRole}</p>
        <p><strong>Topic:</strong> ${safeTopic}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage.replace(/\n/g, '<br/>')}</p>
      `,
      text: `New Contact Request
Name: ${safeName}
Email: ${safeEmail}
Company: ${safeCompany}
Role: ${safeRole}
Topic: ${safeTopic}

Message:
${safeMessage}`,
    })

    return res.status(201).json({ message: 'Contact request received.' })
  } catch (err) {
    return res.status(500).json({ message: 'Unexpected server error.' })
  }
}


