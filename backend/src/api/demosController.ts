import { Request, Response } from 'express'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'
import { GoogleCalendarService } from '../services/googleCalendarService.js'
import { EmailService } from '../services/emailService.js'

const googleCalendarService = new GoogleCalendarService()
const emailService = new EmailService()

export async function scheduleDemo(req: Request, res: Response) {
  try {
    const authReq = req as any
    const userRole = authReq.userRole
    const userEmail = authReq.userEmail
    const userCompanyName = authReq.companyName // Might be undefined depending on middleware

    if (!userRole || userRole === 'admin') {
      return res.status(403).json({ error: 'Only HR/Employers can schedule demos' })
    }

    const { demo_time } = req.body
    if (!demo_time) {
      return res.status(400).json({ error: 'demo_time is required' })
    }

    const demoDate = new Date(demo_time)
    if (isNaN(demoDate.getTime())) {
      return res.status(400).json({ error: 'Invalid demo_time format' })
    }

    // Try to schedule via Google Calendar
    let meetingLink = ''
    try {
      if (googleCalendarService.isEnabled()) {
        const event = await googleCalendarService.createMeetEvent({
          summary: `OptioHire Demo with ${userCompanyName || userEmail}`,
          description: `Product demo scheduled by ${userEmail} from ${userCompanyName || 'Unknown Company'}`,
          start: demoDate.toISOString(),
          end: new Date(demoDate.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
          attendees: [userEmail, process.env.ADMIN_EMAIL || 'admin@optiohire.com']
        })
        meetingLink = event.meetingLink
      } else {
        logger.warn('Google Calendar Service is not enabled. Proceeding without meeting link.')
      }
    } catch (gcError) {
      logger.error('Failed to create Google Calendar event for demo:', gcError)
      // Continue anyway, we can follow up manually
    }

    // Save to DB
    const result = await query(
      `INSERT INTO demos (hr_email, company_name, demo_time, meeting_link, status) 
       VALUES ($1, $2, $3, $4, 'open') 
       RETURNING *`,
      [userEmail, userCompanyName || null, demoDate.toISOString(), meetingLink || null]
    )

    // Notify admins
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@optiohire.com'
    try {
      await emailService.sendDemoScheduledAdminAlert(
        adminEmail, 
        { email: userEmail, companyName: userCompanyName }, 
        demoDate.toISOString(), 
        meetingLink
      )
    } catch (emailErr) {
      logger.error('Failed to send admin alert email for new demo:', emailErr)
    }

    return res.status(201).json({
      message: 'Demo scheduled successfully',
      demo: result.rows[0]
    })
  } catch (error) {
    logger.error('Error scheduling demo:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getAdminDemos(req: Request, res: Response) {
  try {
    const userRole = (req as any).userRole
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view all demos' })
    }

    const result = await query('SELECT * FROM demos ORDER BY created_at DESC')
    return res.json({ demos: result.rows })
  } catch (error) {
    logger.error('Error fetching admin demos:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function markDemoSeen(req: Request, res: Response) {
  try {
    const userRole = (req as any).userRole
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update demos' })
    }

    const { id } = req.params
    
    const result = await query(
      `UPDATE demos SET status = 'seen' WHERE id = $1 RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Demo not found' })
    }

    const demo = result.rows[0]

    // Send confirmation email to HR
    try {
      await emailService.sendDemoSeen(demo.hr_email, demo.demo_time)
    } catch (emailErr) {
      logger.error('Failed to send demo seen confirmation email:', emailErr)
    }

    return res.json({ message: 'Demo marked as seen', demo })
  } catch (error) {
    logger.error('Error marking demo as seen:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
