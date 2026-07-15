import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'

const VALID_AUDIENCES = new Set(['all', 'candidate', 'employer', 'institution', 'admin'])

/**
 * GET /api/admin/announcements
 */
export async function listAdminAnnouncements(_req: AuthRequest, res: Response) {
  try {
    const { rows } = await query(
      `SELECT * FROM platform_announcements ORDER BY created_at DESC LIMIT 200`
    )
    return res.json({ announcements: rows })
  } catch (err) {
    logger.error('listAdminAnnouncements error', { err })
    return res.status(500).json({ error: 'Failed to load announcements' })
  }
}

/**
 * POST /api/admin/announcements
 */
export async function createAdminAnnouncement(req: AuthRequest, res: Response) {
  try {
    const { title, body, category, audiences, institution_id, is_active, published_at, expires_at } =
      req.body || {}
    if (!title || !body) return res.status(400).json({ error: 'title and body required' })

    const audienceList = Array.isArray(audiences) && audiences.length
      ? audiences.filter((a: string) => VALID_AUDIENCES.has(a))
      : ['all']
    if (!audienceList.length) return res.status(400).json({ error: 'Invalid audiences' })

    const { rows } = await query(
      `INSERT INTO platform_announcements
         (title, body, category, audiences, institution_id, is_active, published_at, expires_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::timestamptz, now()), $8, $9)
       RETURNING *`,
      [
        title,
        body,
        category || 'platform',
        audienceList,
        institution_id || null,
        is_active !== false,
        published_at || null,
        expires_at || null,
        req.userId || null,
      ]
    )
    return res.status(201).json({ announcement: rows[0] })
  } catch (err) {
    logger.error('createAdminAnnouncement error', { err })
    return res.status(500).json({ error: 'Failed to create announcement' })
  }
}

/**
 * PATCH /api/admin/announcements/:id
 */
export async function updateAdminAnnouncement(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params
    const { title, body, category, audiences, institution_id, is_active, published_at, expires_at } =
      req.body || {}

    const audienceList =
      Array.isArray(audiences) && audiences.length
        ? audiences.filter((a: string) => VALID_AUDIENCES.has(a))
        : null

    const { rows } = await query(
      `UPDATE platform_announcements SET
         title = COALESCE($2, title),
         body = COALESCE($3, body),
         category = COALESCE($4, category),
         audiences = COALESCE($5, audiences),
         institution_id = COALESCE($6, institution_id),
         is_active = COALESCE($7, is_active),
         published_at = COALESCE($8::timestamptz, published_at),
         expires_at = $9,
         updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        title ?? null,
        body ?? null,
        category ?? null,
        audienceList,
        institution_id !== undefined ? institution_id : null,
        is_active !== undefined ? is_active : null,
        published_at ?? null,
        expires_at !== undefined ? expires_at : null,
      ]
    )
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    return res.json({ announcement: rows[0] })
  } catch (err) {
    logger.error('updateAdminAnnouncement error', { err })
    return res.status(500).json({ error: 'Failed to update announcement' })
  }
}

/**
 * DELETE /api/admin/announcements/:id
 */
export async function deleteAdminAnnouncement(req: AuthRequest, res: Response) {
  try {
    const { rows } = await query(
      `DELETE FROM platform_announcements WHERE id = $1 RETURNING id`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    return res.json({ ok: true })
  } catch (err) {
    logger.error('deleteAdminAnnouncement error', { err })
    return res.status(500).json({ error: 'Failed to delete announcement' })
  }
}
