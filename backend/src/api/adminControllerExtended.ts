import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import type { AuthRequest } from '../middleware/auth.js'
import { logAdminAction } from '../utils/adminLogger.js'
import { EmailService } from '../services/emailService.js'

// ============================================================================
// SIGNUP QUEUE MANAGEMENT
// ============================================================================

export async function getPendingSignups(req: Request, res: Response) {
  try {
    const { page = '1', limit = '50', status = 'pending' } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    // Check if signup_queue table exists
    const { rows: tableCheck } = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'signup_queue'
      )`
    )

    if (!tableCheck[0]?.exists) {
      // Return empty result if table doesn't exist
      return res.json({
        signups: [],
        total: 0,
        page: Number(page),
        limit: Number(limit)
      })
    }

    // Handle empty status (show all)
    const statusFilter = status && status !== 'all' && status !== '' ? String(status) : null
    let whereClause = ''
    let queryParams: any[] = []
    
    if (statusFilter) {
      whereClause = 'WHERE sq.status = $1'
      queryParams = [statusFilter, Number(limit), offset]
    } else {
      whereClause = ''
      queryParams = [Number(limit), offset]
    }

    const queryText = `
      SELECT sq.*, 
             COALESCE(u.email, sq.email) as email, 
             COALESCE(u.name, sq.name) as name, 
             COALESCE(u.created_at, sq.created_at) as user_created_at,
             c.company_name, c.company_email
      FROM signup_queue sq
      LEFT JOIN users u ON u.user_id = sq.user_id
      LEFT JOIN companies c ON (c.user_id = sq.user_id OR c.user_id = u.user_id)
      ${whereClause}
      ORDER BY sq.created_at DESC
      LIMIT $${whereClause ? '3' : '1'} OFFSET $${whereClause ? '2' : '2'}
    `

    const { rows } = await query(queryText, queryParams).catch((err: any) => {
      console.error('Error querying signup_queue:', err)
      // Log the full error for debugging
      console.error('Query error details:', {
        message: err.message,
        code: err.code,
        detail: err.detail,
        hint: err.hint
      })
      // Return empty result instead of throwing
      return { rows: [] }
    })

    // Build count query
    let countWhereClause = ''
    let countParams: any[] = []
    
    if (statusFilter) {
      countWhereClause = 'WHERE status = $1'
      countParams = [statusFilter]
    } else {
      countWhereClause = ''
      countParams = []
    }

    const { rows: countRows } = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM signup_queue ${countWhereClause}`,
      countParams
    ).catch((err) => {
      console.error('Error counting signup_queue:', err)
      // Return count of 0 if count query fails
      return { rows: [{ count: '0' }] }
    })

    return res.json({
      signups: rows || [],
      total: Number(countRows[0]?.count || 0),
      page: Number(page),
      limit: Number(limit)
    })
  } catch (err: any) {
    console.error('Get pending signups error:', err)
    // Log full error details for debugging
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint,
      stack: err.stack
    })
    // Return empty result instead of error to prevent UI breakage
    return res.json({
      signups: [],
      total: 0,
      page: Number(req.query.page || '1'),
      limit: Number(req.query.limit || '50'),
      error: err.message || 'Failed to fetch pending signups'
    })
  }
}

export async function approveSignup(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params
    const { reason } = req.body || {}

    // Update user to active
    await query(
      `UPDATE users SET is_active = true WHERE user_id = $1`,
      [userId]
    )

    const { rows: signupQueueTable } = await query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1
         FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'signup_queue'
       ) AS exists`
    )
    if (signupQueueTable[0]?.exists) {
      await query(
        `UPDATE signup_queue 
         SET status = 'approved', reviewed_by = $1, reviewed_at = now()
         WHERE user_id = $2`,
        [req.userId, userId]
      )
    }

    await logAdminAction(req, 'approve_signup', 'user', userId, { reason })

    return res.json({ success: true, message: 'Signup approved successfully' })
  } catch (err) {
    console.error('Approve signup error:', err)
    return res.status(500).json({ error: 'Failed to approve signup' })
  }
}

export async function rejectSignup(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params
    const { reason } = req.body || {}

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' })
    }

    // Deactivate user
    await query(
      `UPDATE users SET is_active = false WHERE user_id = $1`,
      [userId]
    )

    const { rows: signupQueueTable } = await query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1
         FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'signup_queue'
       ) AS exists`
    )
    if (signupQueueTable[0]?.exists) {
      await query(
        `UPDATE signup_queue 
         SET status = 'rejected', rejection_reason = $1, reviewed_by = $2, reviewed_at = now()
         WHERE user_id = $3`,
        [reason, req.userId, userId]
      )
    }

    await logAdminAction(req, 'reject_signup', 'user', userId, { reason })

    return res.json({ success: true, message: 'Signup rejected successfully' })
  } catch (err) {
    console.error('Reject signup error:', err)
    return res.status(500).json({ error: 'Failed to reject signup' })
  }
}

export async function bulkApproveSignups(req: AuthRequest, res: Response) {
  try {
    const { userIds } = req.body || {}
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' })
    }

    await query(
      `UPDATE users SET is_active = true WHERE user_id = ANY($1)`,
      [userIds]
    )

    const { rows: signupQueueTable } = await query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1
         FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'signup_queue'
       ) AS exists`
    )
    if (signupQueueTable[0]?.exists) {
      await query(
        `UPDATE signup_queue 
         SET status = 'approved', reviewed_by = $1, reviewed_at = now()
         WHERE user_id = ANY($2)`,
        [req.userId, userIds]
      )
    }

    await logAdminAction(req, 'bulk_approve_signups', 'user', undefined, { count: userIds.length })

    return res.json({ success: true, message: `${userIds.length} signups approved` })
  } catch (err) {
    console.error('Bulk approve signups error:', err)
    return res.status(500).json({ error: 'Failed to bulk approve signups' })
  }
}

export async function bulkRejectSignups(req: AuthRequest, res: Response) {
  try {
    const { userIds, reason } = req.body || {}
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' })
    }
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' })
    }

    await query(
      `UPDATE users SET is_active = false WHERE user_id = ANY($1)`,
      [userIds]
    )

    const { rows: signupQueueTable } = await query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1
         FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'signup_queue'
       ) AS exists`
    )
    if (signupQueueTable[0]?.exists) {
      await query(
        `UPDATE signup_queue 
         SET status = 'rejected', rejection_reason = $1, reviewed_by = $2, reviewed_at = now()
         WHERE user_id = ANY($3)`,
        [reason, req.userId, userIds]
      )
    }

    await logAdminAction(req, 'bulk_reject_signups', 'user', undefined, { count: userIds.length, reason })

    return res.json({ success: true, message: `${userIds.length} signups rejected` })
  } catch (err) {
    console.error('Bulk reject signups error:', err)
    return res.status(500).json({ error: 'Failed to bulk reject signups' })
  }
}

// ============================================================================
// EMAIL MANAGEMENT
// ============================================================================

export async function getEmailLogs(req: Request, res: Response) {
  try {
    const { page = '1', limit = '50', status, emailType, recipient, startDate, endDate } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let whereClause = 'WHERE 1=1'
    const params: any[] = [Number(limit), offset]
    let paramIndex = 3

    if (status) {
      whereClause += ` AND status = $${paramIndex++}`
      params.push(status)
    }
    if (emailType) {
      whereClause += ` AND email_type = $${paramIndex++}`
      params.push(emailType)
    }
    if (recipient) {
      whereClause += ` AND recipient_email ILIKE $${paramIndex++}`
      params.push(`%${recipient}%`)
    }
    if (startDate) {
      whereClause += ` AND created_at >= $${paramIndex++}`
      params.push(startDate)
    }
    if (endDate) {
      whereClause += ` AND created_at <= $${paramIndex++}`
      params.push(endDate)
    }

    const { rows } = await query(
      `SELECT * FROM email_logs 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    )

    const { rows: countRows } = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM email_logs ${whereClause}`,
      params.slice(2)
    )

    return res.json({
      emails: rows,
      total: Number(countRows[0].count),
      page: Number(page),
      limit: Number(limit)
    })
  } catch (err) {
    console.error('Get email logs error:', err)
    return res.status(500).json({ error: 'Failed to fetch email logs' })
  }
}

export async function getEmailStats(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query
    let whereClause = ''
    const params: any[] = []

    if (startDate && endDate) {
      whereClause = 'WHERE created_at BETWEEN $1 AND $2'
      params.push(startDate, endDate)
    }

    const { rows } = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'sent') as sent,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
        COUNT(*) FILTER (WHERE status = 'pending') as pending
       FROM email_logs ${whereClause}`,
      params
    )

    return res.json({ stats: rows[0] })
  } catch (err) {
    console.error('Get email stats error:', err)
    return res.status(500).json({ error: 'Failed to fetch email statistics' })
  }
}

export async function resendEmail(req: AuthRequest, res: Response) {
  try {
    const { emailId } = req.params

    const { rows } = await query(
      `SELECT * FROM email_logs WHERE email_id = $1`,
      [emailId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Email log not found' })
    }

    const emailLog = rows[0]

    // Resend email using EmailService
    const emailService = new EmailService()
    await emailService.sendEmail({
      to: emailLog.recipient_email,
      subject: emailLog.subject,
      html: emailLog.metadata?.html || '',
      text: emailLog.metadata?.text || ''
    })

    await logAdminAction(req, 'resend_email', 'email', emailId, { recipient: emailLog.recipient_email })

    return res.json({ success: true, message: 'Email resent successfully' })
  } catch (err) {
    console.error('Resend email error:', err)
    return res.status(500).json({ error: 'Failed to resend email' })
  }
}

/**
 * Dead-letter style view: failed emails that exhausted retries or were marked non-retryable.
 */
export async function getDeadLetterEmails(req: Request, res: Response) {
  try {
    const { page = '1', limit = '50', emailType, showPending = 'false' } = req.query
    const offset = (Number(page) - 1) * Number(limit)
    const maxAttempts = Number(process.env.EMAIL_RETRY_MAX_ATTEMPTS || 8)

    // Ensure table exists before querying
    const { rows: tableCheck } = await query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.tables 
         WHERE table_schema = 'public' AND table_name = 'email_logs'
       ) as exists`
    )
    if (!tableCheck[0]?.exists) {
      console.warn('[getDeadLetterEmails] email_logs table not found — returning empty list')
      return res.json({
        emails: [],
        total: 0,
        page: Number(page),
        limit: Number(limit),
        maxRetryAttempts: maxAttempts
      })
    }

    let whereClause = ''
    if (showPending === 'true') {
      whereClause = `WHERE status IN ('pending', 'processing') OR (status = 'failed' AND COALESCE((metadata->>'is_retry_eligible')::boolean, true) = true AND COALESCE((metadata->>'retry_count')::int, 0) < $3)`
    } else {
      whereClause = `WHERE status = 'failed'
      AND (
        COALESCE((metadata->>'is_retry_eligible')::boolean, true) = false
        OR COALESCE((metadata->>'retry_count')::int, 0) >= $3
      )`
    }

    const params: any[] = [Number(limit), offset, maxAttempts]
    let paramIndex = 4

    if (emailType) {
      whereClause += ` AND email_type = $${paramIndex++}`
      params.push(String(emailType))
    }

    const { rows } = await query(
      `SELECT *
       FROM email_logs
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    )

    const countParams: any[] = [maxAttempts]
    let countWhereClause = ''
    if (showPending === 'true') {
      countWhereClause = `WHERE status IN ('pending', 'processing') OR (status = 'failed' AND COALESCE((metadata->>'is_retry_eligible')::boolean, true) = true AND COALESCE((metadata->>'retry_count')::int, 0) < $1)`
    } else {
      countWhereClause = `WHERE status = 'failed'
      AND (
        COALESCE((metadata->>'is_retry_eligible')::boolean, true) = false
        OR COALESCE((metadata->>'retry_count')::int, 0) >= $1
      )`
    }
    
    if (emailType) {
      countWhereClause += ` AND email_type = $2`
      countParams.push(String(emailType))
    }

    const { rows: countRows } = await query<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM email_logs
       ${countWhereClause}`,
      countParams
    )

    return res.json({
      emails: rows,
      total: Number(countRows[0]?.count || 0),
      page: Number(page),
      limit: Number(limit),
      maxRetryAttempts: maxAttempts
    })
  } catch (err) {
    console.error('Get dead-letter emails error:', err)
    return res.status(500).json({ error: 'Failed to fetch dead-letter emails' })
  }
}

/**
 * Manual admin re-queue for a failed email log.
 */
export async function requeueDeadLetterEmail(req: AuthRequest, res: Response) {
  try {
    const { emailId } = req.params

    const { rows } = await query(
      `SELECT * FROM email_logs WHERE email_id = $1`,
      [emailId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Email log not found' })
    }

    const emailLog = rows[0]

    await query(
      `UPDATE email_logs
       SET status = 'failed',
           error_message = NULL,
           metadata = jsonb_set(
             jsonb_set(
               jsonb_set(
                 jsonb_set(COALESCE(metadata, '{}'::jsonb), '{is_retry_eligible}', 'true'::jsonb, true),
                 '{retry_count}',
                 '0'::jsonb,
                 true
               ),
               '{next_retry_at}',
               to_jsonb($2::text),
               true
             ),
             '{manually_requeued_at}',
             to_jsonb($3::text),
             true
           )
       WHERE email_id = $1`,
      [emailId, new Date().toISOString(), new Date().toISOString()]
    )

    await logAdminAction(req, 'requeue_dead_letter_email', 'email', emailId, {
      recipient: emailLog.recipient_email,
      emailType: emailLog.email_type
    })

    return res.json({ success: true, message: 'Email re-queued successfully' })
  } catch (err) {
    console.error('Requeue dead-letter email error:', err)
    return res.status(500).json({ error: 'Failed to re-queue email' })
  }
}

/**
 * Manual admin bulk re-queue for failed email logs.
 */
export async function bulkRequeueDeadLetterEmails(req: AuthRequest, res: Response) {
  try {
    const { emailIds } = req.body || {}
    if (!Array.isArray(emailIds) || emailIds.length === 0) {
      return res.status(400).json({ error: 'emailIds array is required' })
    }

    const cleanIds = emailIds
      .map((id: unknown) => (typeof id === 'string' ? id.trim() : ''))
      .filter(Boolean)

    if (cleanIds.length === 0) {
      return res.status(400).json({ error: 'No valid email IDs provided' })
    }

    const nowIso = new Date().toISOString()
    const { rowCount } = await query(
      `UPDATE email_logs
       SET status = 'failed',
           error_message = NULL,
           metadata = jsonb_set(
             jsonb_set(
               jsonb_set(
                 jsonb_set(COALESCE(metadata, '{}'::jsonb), '{is_retry_eligible}', 'true'::jsonb, true),
                 '{retry_count}',
                 '0'::jsonb,
                 true
               ),
               '{next_retry_at}',
               to_jsonb($2::text),
               true
             ),
             '{manually_requeued_at}',
             to_jsonb($3::text),
             true
           )
       WHERE email_id = ANY($1::uuid[])`,
      [cleanIds, nowIso, nowIso]
    )

    await logAdminAction(req, 'bulk_requeue_dead_letter_email', 'email', undefined, {
      requested: cleanIds.length,
      updated: rowCount || 0
    })

    return res.json({
      success: true,
      message: `${rowCount || 0} email(s) re-queued successfully`,
      requested: cleanIds.length,
      updated: rowCount || 0
    })
  } catch (err) {
    console.error('Bulk requeue dead-letter emails error:', err)
    return res.status(500).json({ error: 'Failed to bulk re-queue emails' })
  }
}

/**
 * Guarded admin action: re-queue all dead-letter emails (capped).
 */
export async function requeueAllDeadLetterEmails(req: AuthRequest, res: Response) {
  try {
    const requestedLimit = Number(req.body?.limit || 200)
    const hardCap = Number(process.env.ADMIN_REQUEUE_ALL_HARD_CAP || 500)
    const limit = Math.max(1, Math.min(requestedLimit, hardCap))
    const maxAttempts = Number(process.env.EMAIL_RETRY_MAX_ATTEMPTS || 8)

    const { rows } = await query<{ email_id: string }>(
      `SELECT email_id
       FROM email_logs
       WHERE status = 'failed'
         AND (
           COALESCE((metadata->>'is_retry_eligible')::boolean, true) = false
           OR COALESCE((metadata->>'retry_count')::int, 0) >= $1
         )
       ORDER BY created_at ASC
       LIMIT $2`,
      [maxAttempts, limit]
    )

    const ids = rows.map((r) => r.email_id)
    if (ids.length === 0) {
      return res.json({ success: true, message: 'No dead-letter emails to re-queue', requested: limit, updated: 0 })
    }

    const nowIso = new Date().toISOString()
    const { rowCount } = await query(
      `UPDATE email_logs
       SET status = 'failed',
           error_message = NULL,
           metadata = jsonb_set(
             jsonb_set(
               jsonb_set(
                 jsonb_set(COALESCE(metadata, '{}'::jsonb), '{is_retry_eligible}', 'true'::jsonb, true),
                 '{retry_count}',
                 '0'::jsonb,
                 true
               ),
               '{next_retry_at}',
               to_jsonb($2::text),
               true
             ),
             '{manually_requeued_at}',
             to_jsonb($3::text),
             true
           )
       WHERE email_id = ANY($1::uuid[])`,
      [ids, nowIso, nowIso]
    )

    await logAdminAction(req, 'requeue_all_dead_letter_email', 'email', undefined, {
      requested: limit,
      selected: ids.length,
      updated: rowCount || 0,
      hardCap
    })

    return res.json({
      success: true,
      message: `${rowCount || 0} dead-letter email(s) re-queued`,
      requested: limit,
      selected: ids.length,
      updated: rowCount || 0,
      hardCap
    })
  } catch (err) {
    console.error('Requeue all dead-letter emails error:', err)
    return res.status(500).json({ error: 'Failed to re-queue all dead-letter emails' })
  }
}

// ============================================================================
// SYSTEM SETTINGS MANAGEMENT
// ============================================================================

export async function getSystemSettings(req: Request, res: Response) {
  try {
    const { category } = req.query

    let whereClause = ''
    const params: any[] = []
    if (category) {
      whereClause = 'WHERE category = $1'
      params.push(category)
    }

    const { rows } = await query(
      `SELECT * FROM system_settings ${whereClause} ORDER BY category, setting_key`,
      params
    )

    return res.json({ settings: rows })
  } catch (err) {
    console.error('Get system settings error:', err)
    return res.status(500).json({ error: 'Failed to fetch system settings' })
  }
}

export async function updateSystemSetting(req: AuthRequest, res: Response) {
  try {
    const { settingKey } = req.params
    const { settingValue, description } = req.body || {}

    if (settingValue === undefined) {
      return res.status(400).json({ error: 'settingValue is required' })
    }

    await query(
      `UPDATE system_settings 
       SET setting_value = $1, description = COALESCE($2, description), updated_by = $3, updated_at = now()
       WHERE setting_key = $4`,
      [JSON.stringify(settingValue), description, req.userId, settingKey]
    )

    await logAdminAction(req, 'update_setting', 'system_setting', settingKey, { value: settingValue })

    return res.json({ success: true, message: 'Setting updated successfully' })
  } catch (err) {
    console.error('Update system setting error:', err)
    return res.status(500).json({ error: 'Failed to update system setting' })
  }
}

export async function getFeatureFlags(req: Request, res: Response) {
  try {
    const { rows } = await query(
      `SELECT setting_key, setting_value, description 
       FROM system_settings 
       WHERE category = 'features'`
    )

    const flags: Record<string, boolean> = {}
    rows.forEach((row: any) => {
      flags[row.setting_key] = JSON.parse(row.setting_value)
    })

    return res.json({ featureFlags: flags })
  } catch (err) {
    console.error('Get feature flags error:', err)
    return res.status(500).json({ error: 'Failed to fetch feature flags' })
  }
}

export async function updateFeatureFlag(req: AuthRequest, res: Response) {
  try {
    const { flagKey } = req.params
    const { value } = req.body || {}

    if (typeof value !== 'boolean') {
      return res.status(400).json({ error: 'value must be a boolean' })
    }

    await query(
      `UPDATE system_settings 
       SET setting_value = $1, updated_by = $2, updated_at = now()
       WHERE setting_key = $3 AND category = 'features'`,
      [JSON.stringify(value), req.userId, flagKey]
    )

    await logAdminAction(req, 'update_feature_flag', 'system_setting', flagKey, { value })

    return res.json({ success: true, message: 'Feature flag updated successfully' })
  } catch (err) {
    console.error('Update feature flag error:', err)
    return res.status(500).json({ error: 'Failed to update feature flag' })
  }
}

// ============================================================================
// TIME TRACKING & ACTIVITY
// ============================================================================

export async function getActivityLogs(req: Request, res: Response) {
  try {
    const { page = '1', limit = '50', userId, actionType, startDate, endDate, search } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    // Check if time_tracking table exists
    const { rows: tableCheck } = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'time_tracking'
      )`
    )

    if (!tableCheck[0]?.exists) {
      // Return empty result if table doesn't exist
      return res.json({
        activities: [],
        total: 0,
        page: Number(page),
        limit: Number(limit)
      })
    }

    let whereClause = 'WHERE 1=1'
    const params: any[] = [Number(limit), offset]
    let paramIndex = 3

    if (userId) {
      whereClause += ` AND tt.user_id = $${paramIndex++}`
      params.push(userId)
    }
    if (actionType) {
      whereClause += ` AND tt.action_type = $${paramIndex++}`
      params.push(actionType)
    }
    if (startDate) {
      whereClause += ` AND tt.created_at >= $${paramIndex++}`
      params.push(startDate)
    }
    if (endDate) {
      whereClause += ` AND tt.created_at <= $${paramIndex++}`
      params.push(endDate)
    }
    if (search) {
      // Use COALESCE to handle null ip_address safely
      whereClause += ` AND (u.email ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex} OR COALESCE(tt.ip_address::text, '') ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    const { rows } = await query(
      `SELECT tt.*, u.email as user_email, u.name as user_name
       FROM time_tracking tt
       LEFT JOIN users u ON u.user_id = tt.user_id
       ${whereClause}
       ORDER BY tt.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    ).catch((err) => {
      console.error('Error querying time_tracking:', err)
      throw err
    })

    // Build count query with same conditions (need to adjust param indices)
    const countParams: any[] = []
    let countParamIndex = 1
    let countWhereClause = 'WHERE 1=1'
    
    if (userId) {
      countWhereClause += ` AND tt.user_id = $${countParamIndex++}`
      countParams.push(userId)
    }
    if (actionType) {
      countWhereClause += ` AND tt.action_type = $${countParamIndex++}`
      countParams.push(actionType)
    }
    if (startDate) {
      countWhereClause += ` AND tt.created_at >= $${countParamIndex++}`
      countParams.push(startDate)
    }
    if (endDate) {
      countWhereClause += ` AND tt.created_at <= $${countParamIndex++}`
      countParams.push(endDate)
    }
    if (search) {
      countWhereClause += ` AND (u.email ILIKE $${countParamIndex} OR u.name ILIKE $${countParamIndex} OR COALESCE(tt.ip_address::text, '') ILIKE $${countParamIndex})`
      countParams.push(`%${search}%`)
    }
    
    const { rows: countRows } = await query<{ count: string }>(
      `SELECT COUNT(*) as count 
       FROM time_tracking tt
       LEFT JOIN users u ON u.user_id = tt.user_id
       ${countWhereClause}`,
      countParams
    ).catch((err) => {
      console.error('Error counting time_tracking:', err)
      // Return count of 0 if count query fails
      return { rows: [{ count: '0' }] }
    })

    return res.json({
      activities: rows || [],
      total: Number(countRows[0]?.count || 0),
      page: Number(page),
      limit: Number(limit)
    })
  } catch (err: any) {
    console.error('Get activity logs error:', err)
    // Return empty result instead of error to prevent UI breakage
    return res.json({
      activities: [],
      total: 0,
      page: Number(req.query.page || '1'),
      limit: Number(req.query.limit || '50'),
      error: err.message || 'Failed to fetch activity logs'
    })
  }
}

export async function getPerformanceMetrics(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query
    let whereClause = ''
    const params: any[] = []

    if (startDate && endDate) {
      whereClause = 'WHERE created_at BETWEEN $1 AND $2'
      params.push(startDate, endDate)
    }

    const { rows } = await query(
      `SELECT 
        COUNT(*) as total_requests,
        AVG(response_time_ms) as avg_response_time,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_ms) as median_response_time,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time,
        COUNT(*) FILTER (WHERE status_code >= 200 AND status_code < 300) as success_count,
        COUNT(*) FILTER (WHERE status_code >= 400) as error_count
       FROM time_tracking
       WHERE response_time_ms IS NOT NULL ${whereClause}`,
      params
    )

    return res.json({ metrics: rows[0] })
  } catch (err) {
    console.error('Get performance metrics error:', err)
    return res.status(500).json({ error: 'Failed to fetch performance metrics' })
  }
}

export async function getUserActivity(req: Request, res: Response) {
  try {
    const { userId } = req.params
    const { limit = '100' } = req.query

    const { rows } = await query(
      `SELECT * FROM time_tracking
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, Number(limit)]
    )

    return res.json({ activities: rows })
  } catch (err) {
    console.error('Get user activity error:', err)
    return res.status(500).json({ error: 'Failed to fetch user activity' })
  }
}

// ============================================================================
// WORKFLOW MANAGEMENT
// ============================================================================

export async function getWorkflows(req: Request, res: Response) {
  try {
    const { workflowType } = req.query

    let whereClause = ''
    const params: any[] = []
    if (workflowType) {
      whereClause = 'WHERE workflow_type = $1'
      params.push(workflowType)
    }

    const { rows } = await query(
      `SELECT * FROM workflow_config ${whereClause} ORDER BY workflow_type, workflow_name`,
      params
    )

    return res.json({ workflows: rows })
  } catch (err) {
    console.error('Get workflows error:', err)
    return res.status(500).json({ error: 'Failed to fetch workflows' })
  }
}

export async function updateWorkflow(req: AuthRequest, res: Response) {
  try {
    const { workflowId } = req.params
    const { config, is_active, description } = req.body || {}

    const updates: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (config !== undefined) {
      updates.push(`config = $${paramIndex++}`)
      params.push(JSON.stringify(config))
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`)
      params.push(is_active)
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      params.push(description)
    }

    updates.push(`updated_by = $${paramIndex++}`)
    params.push(req.userId)
    params.push(workflowId)

    await query(
      `UPDATE workflow_config 
       SET ${updates.join(', ')}, updated_at = now()
       WHERE workflow_id = $${paramIndex}`,
      params
    )

    await logAdminAction(req, 'update_workflow', 'workflow', workflowId, { config, is_active })

    return res.json({ success: true, message: 'Workflow updated successfully' })
  } catch (err) {
    console.error('Update workflow error:', err)
    return res.status(500).json({ error: 'Failed to update workflow' })
  }
}

