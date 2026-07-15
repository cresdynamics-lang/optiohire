import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'

export type AnnouncementAudience = 'candidate' | 'employer' | 'institution' | 'admin' | 'all'

function resolveAudience(req: AuthRequest): AnnouncementAudience {
  const role = String(req.userRole || '').toLowerCase()
  if (role === 'admin') return 'admin'
  if (role === 'institution_admin' || role === 'institution') return 'institution'
  if (role === 'candidate' || role === 'job_seeker' || role === 'jobseeker') return 'candidate'
  return 'employer'
}

async function ensureAnnouncementsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS platform_announcements (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title           TEXT NOT NULL,
      body            TEXT NOT NULL,
      category        TEXT NOT NULL DEFAULT 'platform',
      audiences       TEXT[] NOT NULL DEFAULT ARRAY['all'],
      institution_id  UUID,
      is_active       BOOLEAN NOT NULL DEFAULT true,
      published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at      TIMESTAMPTZ,
      created_by      UUID,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )`)
}

/**
 * GET /api/announcements
 * Optional ?audience=candidate|employer|institution|admin
 * Optional ?institution_id= for institution-scoped items
 */
export async function listPlatformAnnouncements(req: AuthRequest, res: Response) {
  try {
    await ensureAnnouncementsTable()

    const audienceParam = typeof req.query.audience === 'string' ? req.query.audience : undefined
    const audience = (audienceParam || resolveAudience(req)) as AnnouncementAudience
    const institutionId =
      typeof req.query.institution_id === 'string'
        ? req.query.institution_id
        : typeof req.params.institutionId === 'string'
          ? req.params.institutionId
          : null

    const params: unknown[] = [audience]
    let institutionClause = 'AND institution_id IS NULL'
    if (audience === 'institution' && institutionId) {
      params.push(institutionId)
      institutionClause = `AND (institution_id IS NULL OR institution_id = $${params.length})`
    }

    const { rows } = await query(
      `SELECT id, title, body, category, audiences, institution_id, published_at, created_at
       FROM platform_announcements
       WHERE is_active = true
         AND published_at <= now()
         AND (expires_at IS NULL OR expires_at > now())
         AND ('all' = ANY(audiences) OR $1 = ANY(audiences))
         ${institutionClause}
       ORDER BY published_at DESC, created_at DESC
       LIMIT 50`,
      params
    )

    if (rows.length) {
      return res.json({ announcements: rows, audience })
    }

    return res.json({
      announcements: getDefaultAnnouncements(audience),
      audience,
      defaults: true,
    })
  } catch (err) {
    logger.error('listPlatformAnnouncements error', { err })
    return res.status(500).json({ error: 'Failed to load announcements' })
  }
}

function getDefaultAnnouncements(audience: AnnouncementAudience) {
  const all = [
    {
      id: 'default-all',
      title: 'Platform-wide notice',
      body: 'OptioHire is expanding employer partnerships across Kenya. Check Announcements in your sidebar for the latest updates.',
      category: 'partnership',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
  ]
  const byAudience: Record<AnnouncementAudience, typeof all> = {
    all,
    candidate: [
      {
        id: 'default-candidate',
        title: 'Welcome to OptioHire',
        body: 'Complete your talent profile, set target roles, and explore matched job opportunities.',
        category: 'platform',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      ...all,
    ],
    employer: [
      {
        id: 'default-employer',
        title: 'Hiring workspace updates',
        body: 'Post roles, review AI-ranked applicants, and schedule interviews from your dashboard.',
        category: 'platform',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      ...all,
    ],
    institution: [
      {
        id: 'default-institution',
        title: 'Institution partner updates',
        body: 'Track students, employer activity, and placements. Request onboarding sessions when ready.',
        category: 'platform',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      ...all,
    ],
    admin: all,
  }
  return byAudience[audience] || all
}
