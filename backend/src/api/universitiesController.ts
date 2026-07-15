import type { Request, Response } from 'express'
import { query } from '../db/index.js'

export async function listUniversities(req: Request, res: Response) {
  try {
    const country = String(req.query.country || 'KE').toUpperCase()
    const search = String(req.query.search || '').trim()
    const type = String(req.query.type || '').trim()

    const conditions = ['is_active = true', `country = $1`]
    const params: unknown[] = [country]
    let idx = 2

    if (search) {
      conditions.push(`(name ILIKE $${idx} OR short_name ILIKE $${idx})`)
      params.push(`%${search}%`)
      idx++
    }
    if (type && ['public', 'private', 'specialized', 'constituent'].includes(type)) {
      conditions.push(`type = $${idx}`)
      params.push(type)
      idx++
    }

    const { rows } = await query<{
      university_id: string
      name: string
      short_name: string | null
      type: string
      country: string
      slug: string
    }>(
      `SELECT university_id, name, short_name, type, country, slug
       FROM universities
       WHERE ${conditions.join(' AND ')}
       ORDER BY
         CASE type
           WHEN 'public' THEN 1
           WHEN 'private' THEN 2
           WHEN 'specialized' THEN 3
           WHEN 'constituent' THEN 4
           ELSE 5
         END,
         name ASC`,
      params
    )

    const { rows: countRows } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM universities WHERE country = $1 AND is_active = true`,
      [country]
    )

    return res.json({
      universities: rows,
      total: Number(countRows[0]?.count || rows.length),
      country,
    })
  } catch (err) {
    console.error('listUniversities error:', err)
    return res.status(500).json({ error: 'Failed to load universities' })
  }
}
