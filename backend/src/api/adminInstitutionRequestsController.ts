import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'

type LiveRequest = {
  id: string
  type: 'support' | 'onboarding_session'
  institution_id: string
  institution_name: string
  subject: string
  message: string
  status: string
  department?: string | null
  scheduled_at?: string | null
  expected_count?: number | null
  created_at: string
  contact_email?: string | null
}

async function fetchSupportRequests(since?: string): Promise<LiveRequest[]> {
  try {
    const params: unknown[] = []
    let sinceClause = ''
    if (since) {
      params.push(since)
      sinceClause = ` AND t.created_at >= $${params.length}::timestamptz`
    }
    const { rows } = await query(
      `SELECT t.id, t.institution_id, t.subject, t.message, t.status, t.created_at,
              i.name AS institution_name, i.contact_email
       FROM institution_support_tickets t
       JOIN institutions i ON i.id = t.institution_id
       WHERE 1=1 ${sinceClause}
       ORDER BY t.created_at DESC
       LIMIT 100`,
      params
    )
    return rows.map((r: any) => ({
      id: r.id,
      type: 'support' as const,
      institution_id: r.institution_id,
      institution_name: r.institution_name,
      subject: r.subject,
      message: r.message,
      status: r.status || 'open',
      created_at: r.created_at,
      contact_email: r.contact_email,
    }))
  } catch {
    return []
  }
}

async function fetchOnboardingSessionRequests(since?: string): Promise<LiveRequest[]> {
  try {
    const params: unknown[] = []
    let sinceClause = ''
    if (since) {
      params.push(since)
      sinceClause = ` AND s.created_at >= $${params.length}::timestamptz`
    }
    const { rows } = await query(
      `SELECT s.id, s.institution_id, s.department, s.scheduled_at, s.expected_count,
              s.status, s.notes, s.facilitator, s.created_at,
              i.name AS institution_name, i.contact_email
       FROM institution_onboarding_sessions s
       JOIN institutions i ON i.id = s.institution_id
       WHERE s.status IN ('scheduled', 'requested', 'pending')
         ${sinceClause}
       ORDER BY s.created_at DESC
       LIMIT 100`,
      params
    )
    return rows.map((r: any) => ({
      id: r.id,
      type: 'onboarding_session' as const,
      institution_id: r.institution_id,
      institution_name: r.institution_name,
      subject: `Onboarding session - ${r.department || 'All departments'}`,
      message: [
        `Preferred: ${r.scheduled_at ? new Date(r.scheduled_at).toLocaleString() : 'TBD'}`,
        `Expected students: ${r.expected_count ?? 0}`,
        r.notes ? `Notes: ${r.notes}` : '',
        r.facilitator ? `Facilitator: ${r.facilitator}` : '',
      ].filter(Boolean).join('\n'),
      status: r.status || 'scheduled',
      department: r.department,
      scheduled_at: r.scheduled_at,
      expected_count: r.expected_count,
      created_at: r.created_at || r.scheduled_at,
      contact_email: r.contact_email,
    }))
  } catch {
    return []
  }
}

/**
 * GET /api/admin/institutions/requests
 * Live feed for institution support tickets + onboarding session requests.
 * Poll every ~10s from admin UI. Optional ?since=ISO8601 for incremental fetch.
 */
export async function getInstitutionLiveRequests(req: AuthRequest, res: Response) {
  try {
    const since = typeof req.query.since === 'string' ? req.query.since : undefined

    const [support, sessions] = await Promise.all([
      fetchSupportRequests(since),
      fetchOnboardingSessionRequests(since),
    ])

    const requests = [...support, ...sessions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    const openStatuses = new Set(['open', 'scheduled', 'requested', 'pending'])
    const open_count = [...support, ...sessions].filter((r) => openStatuses.has(String(r.status).toLowerCase())).length

    return res.json({
      requests,
      open_count,
      server_time: new Date().toISOString(),
      poll_interval_ms: 10000,
    })
  } catch (err) {
    logger.error('getInstitutionLiveRequests error', { err })
    return res.status(500).json({ error: 'Failed to load institution requests' })
  }
}

/**
 * PUT /api/admin/institutions/requests/:type/:id/seen
 * type = support | onboarding_session
 */
export async function markInstitutionRequestSeen(req: AuthRequest, res: Response) {
  try {
    const { type, id } = req.params
    if (type === 'support') {
      const { rows } = await query(
        `UPDATE institution_support_tickets SET status = 'seen' WHERE id = $1 RETURNING *`,
        [id]
      )
      if (!rows.length) return res.status(404).json({ error: 'Ticket not found' })
      await query(
        `UPDATE support_tickets SET status = 'seen'
         WHERE context_data->>'reference_id' = $1 AND context_data->>'source' = 'institution'`,
        [id]
      )
      return res.json({ ok: true, item: rows[0] })
    }

    if (type === 'onboarding_session') {
      const { rows } = await query(
        `UPDATE institution_onboarding_sessions SET status = 'acknowledged' WHERE id = $1 RETURNING *`,
        [id]
      )
      if (!rows.length) return res.status(404).json({ error: 'Session request not found' })
      await query(
        `UPDATE support_tickets SET status = 'seen'
         WHERE context_data->>'reference_id' = $1 AND context_data->>'request_type' = 'onboarding_session'`,
        [id]
      )
      return res.json({ ok: true, item: rows[0] })
    }

    return res.status(400).json({ error: 'Invalid request type' })
  } catch (err) {
    logger.error('markInstitutionRequestSeen error', { err })
    return res.status(500).json({ error: 'Failed to update request' })
  }
}
