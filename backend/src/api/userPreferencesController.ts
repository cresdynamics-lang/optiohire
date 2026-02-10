import type { Request, Response } from 'express'
import { query } from '../db/index.js'

import type { AuthRequest } from '../middleware/auth.js'

// Get user preferences
export async function getUserPreferences(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { rows } = await query<{
      preference_id: string
      user_id: string
      email_notifications: boolean
      report_notifications: boolean
      application_notifications: boolean
      interview_reminders: boolean
      weekly_summary: boolean
      auto_generate_reports: boolean
      notification_frequency: string
    }>(
      `SELECT * FROM user_preferences WHERE user_id = $1`,
      [userId]
    )

    if (rows.length === 0) {
      // Return default preferences if none exist
      return res.json({
        email_notifications: true,
        report_notifications: true,
        application_notifications: true,
        interview_reminders: true,
        weekly_summary: true,
        auto_generate_reports: true,
        notification_frequency: 'realtime'
      })
    }

    return res.json(rows[0])
  } catch (err) {
    console.error('Error getting user preferences:', err)
    return res.status(500).json({ error: 'Failed to get preferences' })
  }
}

// Update user preferences
export async function updateUserPreferences(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const {
      email_notifications,
      report_notifications,
      application_notifications,
      interview_reminders,
      weekly_summary,
      auto_generate_reports,
      notification_frequency
    } = req.body

    // Check if preferences exist
    const { rows: existing } = await query<{ preference_id: string }>(
      `SELECT preference_id FROM user_preferences WHERE user_id = $1`,
      [userId]
    )

    if (existing.length === 0) {
      // Insert new preferences
      const { rows } = await query<{ preference_id: string }>(
        `INSERT INTO user_preferences (
          user_id, email_notifications, report_notifications, application_notifications,
          interview_reminders, weekly_summary, auto_generate_reports, notification_frequency
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING preference_id`,
        [
          userId,
          email_notifications ?? true,
          report_notifications ?? true,
          application_notifications ?? true,
          interview_reminders ?? true,
          weekly_summary ?? true,
          auto_generate_reports ?? true,
          notification_frequency ?? 'realtime'
        ]
      )
      return res.json({ success: true, preference_id: rows[0].preference_id })
    } else {
      // Update existing preferences
      await query(
        `UPDATE user_preferences SET
          email_notifications = COALESCE($2, email_notifications),
          report_notifications = COALESCE($3, report_notifications),
          application_notifications = COALESCE($4, application_notifications),
          interview_reminders = COALESCE($5, interview_reminders),
          weekly_summary = COALESCE($6, weekly_summary),
          auto_generate_reports = COALESCE($7, auto_generate_reports),
          notification_frequency = COALESCE($8, notification_frequency),
          updated_at = now()
        WHERE user_id = $1`,
        [
          userId,
          email_notifications,
          report_notifications,
          application_notifications,
          interview_reminders,
          weekly_summary,
          auto_generate_reports,
          notification_frequency
        ]
      )
      return res.json({ success: true })
    }
  } catch (err) {
    console.error('Error updating user preferences:', err)
    return res.status(500).json({ error: 'Failed to update preferences' })
  }
}

