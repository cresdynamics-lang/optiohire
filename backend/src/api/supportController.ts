import { Request, Response } from 'express'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'

export const createSupportTicket = async (req: Request, res: Response) => {
  try {
    const { subject, message, contextData } = req.body
    
    // In a real app, this comes from the authenticated user token (req.user.userId)
    // For now we'll accept email directly or use a mock user ID if not authenticated properly yet
    const userEmail = req.body.email || 'hr@optiohire.com'
    const userId = req.body.userId || null

    if (!message) {
      return res.status(400).json({ error: 'Message is required to create a support ticket.' })
    }

    const result = await query(
      `INSERT INTO support_tickets 
       (user_id, user_email, subject, message, context_data) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING ticket_id, status, created_at`,
      [userId, userEmail, subject || 'HR Support Request', message, contextData || {}]
    )

    logger.info(`New support ticket created: ${result.rows[0].ticket_id}`, { userEmail })
    
    res.status(201).json({
      success: true,
      ticket: result.rows[0],
      message: 'Support ticket successfully submitted.'
    })
  } catch (error) {
    logger.error('Error creating support ticket:', error)
    res.status(500).json({ error: 'Failed to create support ticket. Please try again later.' })
  }
}

export const getSupportTickets = async (req: Request, res: Response) => {
  try {
    const { status } = req.query
    
    let sqlQuery = `
      SELECT ticket_id, user_id, user_email, subject, message, status, priority, context_data, created_at 
      FROM support_tickets 
    `
    const params: any[] = []

    if (status) {
      sqlQuery += ` WHERE status = $1`
      params.push(status)
    }

    sqlQuery += ` ORDER BY created_at DESC LIMIT 100`

    const result = await query(sqlQuery, params)
    
    res.json({
      success: true,
      tickets: result.rows
    })
  } catch (error) {
    logger.error('Error fetching support tickets:', error)
    res.status(500).json({ error: 'Failed to fetch support tickets.' })
  }
}
