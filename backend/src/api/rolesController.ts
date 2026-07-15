import { Request, Response } from 'express'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'
import { SKILL_TAXONOMY } from '../lib/skillTaxonomy.js'

async function ensureJobRolesTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS job_roles (
      role_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug           TEXT UNIQUE NOT NULL,
      title          TEXT NOT NULL,
      group_name     TEXT,
      keywords       TEXT[] NOT NULL DEFAULT '{}',
      related_skills TEXT[] NOT NULL DEFAULT '{}',
      is_active      BOOLEAN NOT NULL DEFAULT TRUE,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    )`)
}

async function bootstrapTaxonomyIfEmpty() {
  const { rows } = await query<{ n: string }>(`SELECT COUNT(*)::text AS n FROM job_roles`)
  if (Number(rows[0]?.n || 0) > 0) return
  for (const cat of SKILL_TAXONOMY) {
    const keywords = Array.from(new Set([...(cat.keywords || []), cat.label, ...cat.skills.slice(0, 5)]))
    await query(
      `INSERT INTO job_roles (slug, title, group_name, keywords, related_skills)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (slug) DO NOTHING`,
      [cat.id, cat.label, cat.group, keywords, cat.skills]
    )
  }
}

/**
 * GET /api/roles?q=&limit=&group=
 * Searchable catalog of professional roles (taxonomy + seeded titles).
 */
export async function searchRoles(req: Request, res: Response) {
  try {
    await ensureJobRolesTable()
    await bootstrapTaxonomyIfEmpty()

    const q = String(req.query.q || '').trim()
    const group = String(req.query.group || '').trim()
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 30)))

    const conditions = ['is_active = true']
    const params: any[] = []
    let idx = 1

    if (q) {
      conditions.push(`(
        title ILIKE $${idx}
        OR slug ILIKE $${idx}
        OR COALESCE(group_name,'') ILIKE $${idx}
        OR EXISTS (SELECT 1 FROM unnest(keywords) k WHERE k ILIKE $${idx})
        OR EXISTS (SELECT 1 FROM unnest(related_skills) s WHERE s ILIKE $${idx})
      )`)
      params.push(`%${q}%`)
      idx++
    }
    if (group) {
      conditions.push(`group_name ILIKE $${idx}`)
      params.push(`%${group}%`)
      idx++
    }

    params.push(limit)
    const orderSql = q
      ? `CASE WHEN lower(title) = lower(trim(both '%' from $1::text)) THEN 0 WHEN title ILIKE $1 THEN 1 ELSE 2 END ASC, title ASC`
      : `group_name NULLS LAST, title ASC`

    const { rows } = await query(
      `SELECT role_id, slug, title, group_name, keywords, related_skills
       FROM job_roles
       WHERE ${conditions.join(' AND ')}
       ORDER BY ${orderSql}
       LIMIT $${idx}`,
      params
    )

    const { rows: groups } = await query(
      `SELECT DISTINCT group_name FROM job_roles WHERE is_active AND group_name IS NOT NULL ORDER BY 1`
    )

    return res.json({
      roles: rows.map((r: any) => ({
        id: r.slug,
        roleId: r.role_id,
        title: r.title,
        group: r.group_name,
        keywords: r.keywords,
        relatedSkills: r.related_skills,
      })),
      groups: groups.map((g: any) => g.group_name),
      total: rows.length,
    })
  } catch (err) {
    logger.error('searchRoles error', { err })
    return res.status(500).json({ error: 'Failed to search roles' })
  }
}
