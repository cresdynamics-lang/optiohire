import type { Request, Response } from 'express'
import { query, pool } from '../db/index.js'
import { logger } from '../utils/logger.js'
import type { AuthRequest } from '../middleware/auth.js'

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

async function getInstitutionForAdmin(userId: string): Promise<{ id: string; name: string } | null> {
    const { rows } = await query<{ id: string; name: string }>(
        `SELECT i.id, i.name
     FROM institutions i
     JOIN institution_admins ia ON ia.institution_id = i.id
     WHERE ia.user_id = $1
     LIMIT 1`,
        [userId]
    )
    return rows[0] || null
}

async function ensureAdminAccess(userId: string, institutionId: string, allowedRoles = ['owner', 'roster_manager', 'viewer']) {
    const { rows } = await query<{ role: string }>(
        `SELECT role FROM institution_admins
     WHERE user_id = $1 AND institution_id = $2`,
        [userId, institutionId]
    )
    if (rows.length === 0) return null
    if (!allowedRoles.includes(rows[0].role)) return null
    return rows[0].role
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────

export async function getInstitutionDashboard(req: AuthRequest, res: Response) {
    try {
        let institutionId = req.params.id
        if (!institutionId && req.userId) {
            const inst = await getInstitutionForAdmin(req.userId)
            if (!inst) return res.status(404).json({ error: 'No institution found for this user' })
            institutionId = inst.id
        }

        const role = await ensureAdminAccess(req.userId!, institutionId)
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })

        // Aggregate cohort funnel stats for the "current" (most recent active) cohort
        const { rows: cohortRows } = await query<{ id: string; name: string }>(
            `SELECT id, name FROM cohorts
       WHERE institution_id = $1 AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
            [institutionId]
        )
        const cohort = cohortRows[0]

        let stats = {
            enrolled: 0, activated: 0, shortlisted: 0, interviewing: 0, placed: 0, interning: 0, requires_review: 0, pool: 0
        }
        let topEmployers: any[] = []
        let recentActivity: any[] = []

        if (cohort) {
            const { rows: statRows } = await query<{ row_status: string; count: string }>(
                `SELECT row_status, COUNT(*) as count
         FROM cohort_candidates
         WHERE cohort_id = $1
         GROUP BY row_status`,
                [cohort.id]
            )
            statRows.forEach(r => {
                const key = r.row_status as keyof typeof stats
                if (key in stats) stats[key] = parseInt(r.count)
            })
        }

        // Institution metadata
        const { rows: instRows } = await query<{ id: string; name: string; slug: string; contact_email: string; brand_accent_hex: string; country: string }>(
            `SELECT id, name, slug, contact_email, brand_accent_hex, country FROM institutions WHERE id = $1`,
            [institutionId]
        )
        const institution = instRows[0]

        // Recent cohorts
        const { rows: cohorts } = await query(
            `SELECT c.id, c.name, c.programme, c.academic_level, c.status, c.created_at,
              COUNT(cc.id) AS total_candidates,
              COUNT(cc.id) FILTER (WHERE cc.row_status = 'activated') AS activated,
              COUNT(cc.id) FILTER (WHERE cc.row_status IN ('placed','interning')) AS placed
       FROM cohorts c
       LEFT JOIN cohort_candidates cc ON cc.cohort_id = c.id
       WHERE c.institution_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT 5`,
            [institutionId]
        )

        return res.json({
            institution,
            current_cohort: cohort || null,
            stats,
            cohorts,
            top_employers: topEmployers,
            recent_activity: recentActivity
        })
    } catch (err) {
        logger.error('getInstitutionDashboard error', { err })
        return res.status(500).json({ error: 'Failed to fetch dashboard' })
    }
}

// ─────────────────────────────────────────────
// INSTITUTION LOOKUP  (for the current user)
// ─────────────────────────────────────────────

export async function getMyInstitution(req: AuthRequest, res: Response) {
    try {
        const inst = await getInstitutionForAdmin(req.userId!)
        if (!inst) return res.status(404).json({ error: 'No institution linked to this account' })

        const { rows } = await query(
            `SELECT i.*, 
              ia.role as my_role
       FROM institutions i
       JOIN institution_admins ia ON ia.institution_id = i.id
       WHERE ia.user_id = $1`,
            [req.userId]
        )
        return res.json(rows[0])
    } catch (err) {
        logger.error('getMyInstitution error', { err })
        return res.status(500).json({ error: 'Failed to fetch institution' })
    }
}

// ─────────────────────────────────────────────
// COHORTS
// ─────────────────────────────────────────────

export async function listCohorts(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId)
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })

        const { rows } = await query(
            `SELECT c.*,
              COUNT(cc.id) AS total_candidates,
              COUNT(cc.id) FILTER (WHERE cc.row_status = 'invited')      AS invited,
              COUNT(cc.id) FILTER (WHERE cc.row_status = 'activated')    AS activated,
              COUNT(cc.id) FILTER (WHERE cc.row_status = 'shortlisted')  AS shortlisted,
              COUNT(cc.id) FILTER (WHERE cc.row_status = 'interviewing') AS interviewing,
              COUNT(cc.id) FILTER (WHERE cc.row_status IN ('placed','interning')) AS placed
       FROM cohorts c
       LEFT JOIN cohort_candidates cc ON cc.cohort_id = c.id
       WHERE c.institution_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
            [institutionId]
        )
        return res.json({ cohorts: rows })
    } catch (err) {
        logger.error('listCohorts error', { err })
        return res.status(500).json({ error: 'Failed to list cohorts' })
    }
}

export async function createCohort(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId, ['owner', 'roster_manager'])
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })

        const { name, programme, academic_level, placement_tracks, expected_completion } = req.body
        if (!name) return res.status(400).json({ error: 'Cohort name is required' })

        // Get admin id
        const { rows: admRows } = await query<{ id: string }>(
            `SELECT id FROM institution_admins WHERE user_id = $1 AND institution_id = $2`,
            [req.userId, institutionId]
        )
        const adminId = admRows[0]?.id || null

        const { rows } = await query(
            `INSERT INTO cohorts (institution_id, name, programme, academic_level, placement_tracks, expected_completion, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [institutionId, name, programme || null, academic_level || null, placement_tracks || [], expected_completion || null, adminId]
        )
        return res.status(201).json(rows[0])
    } catch (err) {
        logger.error('createCohort error', { err })
        return res.status(500).json({ error: 'Failed to create cohort' })
    }
}

// ─────────────────────────────────────────────
// ROSTER
// ─────────────────────────────────────────────

export async function getRoster(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId, cohortId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId)
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })

        const page = Math.max(1, parseInt(req.query.page as string) || 1)
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50))
        const offset = (page - 1) * limit
        const status = req.query.status as string | undefined
        const search = req.query.search as string | undefined

        let whereClause = 'cc.cohort_id = $1'
        const params: any[] = [cohortId]

        if (status && status !== 'all') {
            params.push(status)
            whereClause += ` AND cc.row_status = $${params.length}`
        }
        if (search) {
            params.push(`%${search}%`)
            whereClause += ` AND (cc.candidate_name ILIKE $${params.length} OR cc.email ILIKE $${params.length} OR cc.student_id ILIKE $${params.length})`
        }

        const { rows: candidates } = await query(
            `SELECT cc.*
       FROM cohort_candidates cc
       WHERE ${whereClause}
       ORDER BY cc.last_activity DESC NULLS LAST, cc.candidate_name ASC
       LIMIT $${params.push(limit)} OFFSET $${params.push(offset)}`,
            params
        )

        const { rows: countRows } = await query<{ total: string }>(
            `SELECT COUNT(*) as total FROM cohort_candidates cc WHERE ${whereClause.split('LIMIT')[0]}`,
            params.slice(0, params.length - 2)
        )

        return res.json({
            candidates,
            pagination: {
                page,
                limit,
                total: parseInt(countRows[0]?.total || '0'),
                pages: Math.ceil(parseInt(countRows[0]?.total || '0') / limit)
            }
        })
    } catch (err) {
        logger.error('getRoster error', { err })
        return res.status(500).json({ error: 'Failed to fetch roster' })
    }
}

// ─────────────────────────────────────────────
// BULK UPLOAD – Parse & Preview
// ─────────────────────────────────────────────

export async function uploadRoster(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId, cohortId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId, ['owner', 'roster_manager'])
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })

        const { rows: csvData, filename, column_mapping } = req.body
        if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
            return res.status(400).json({ error: 'No rows provided' })
        }

        const valid: any[] = []
        const flagged: any[] = []
        const duplicates: string[] = []

        const seenEmails = new Set<string>()
        const { rows: existingEmails } = await query<{ email: string }>(
            `SELECT email FROM cohort_candidates WHERE cohort_id = $1`,
            [cohortId]
        )
        existingEmails.forEach(r => seenEmails.add(r.email.toLowerCase()))

        for (const row of csvData) {
            const email = (row[column_mapping?.email || 'email'] || '').toLowerCase().trim()
            const name = (row[column_mapping?.name || 'full_name'] || '').trim()

            if (!email || !email.includes('@')) {
                flagged.push({ ...row, _reason: 'Missing or invalid email' })
                continue
            }
            if (!name) {
                flagged.push({ ...row, _reason: 'Missing name' })
                continue
            }
            if (seenEmails.has(email)) {
                duplicates.push(email)
                continue
            }
            seenEmails.add(email)
            valid.push({
                candidate_name: name,
                email,
                student_id: row[column_mapping?.student_id || 'student_id'] || null,
                department: row[column_mapping?.department || 'department'] || null,
                phone: row[column_mapping?.phone || 'phone'] || null,
                raw_row: row
            })
        }

        // Save upload record
        const { rows: uploadRows } = await query(
            `INSERT INTO cohort_uploads (cohort_id, original_filename, row_count, valid_rows, duplicate_rows, flagged_rows, column_mapping, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'mapped')
       RETURNING *`,
            [cohortId, filename || 'roster.csv', csvData.length, valid.length, duplicates.length, flagged.length, JSON.stringify(column_mapping || {})]
        )

        return res.json({
            upload_id: uploadRows[0].id,
            row_count: csvData.length,
            valid_rows: valid.length,
            duplicate_rows: duplicates.length,
            flagged_rows: flagged.length,
            preview: valid.slice(0, 5),
            flagged: flagged.slice(0, 10),
            valid
        })
    } catch (err) {
        logger.error('uploadRoster error', { err })
        return res.status(500).json({ error: 'Failed to process upload' })
    }
}

// ─────────────────────────────────────────────
// COMMIT UPLOAD → create candidates + send invites
// ─────────────────────────────────────────────

export async function commitUpload(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId, cohortId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId, ['owner', 'roster_manager'])
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })

        const { valid, upload_id } = req.body
        if (!valid || !Array.isArray(valid)) return res.status(400).json({ error: 'No validated rows provided' })

        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            let inserted = 0

            for (const candidate of valid) {
                await client.query(
                    `INSERT INTO cohort_candidates (cohort_id, candidate_name, email, student_id, department, phone, row_status, invited_at, raw_row)
           VALUES ($1, $2, $3, $4, $5, $6, 'invited', now(), $7)
           ON CONFLICT (cohort_id, email) DO UPDATE SET
             candidate_name = EXCLUDED.candidate_name,
             student_id     = COALESCE(EXCLUDED.student_id, cohort_candidates.student_id),
             department     = COALESCE(EXCLUDED.department, cohort_candidates.department),
             phone          = COALESCE(EXCLUDED.phone, cohort_candidates.phone),
             raw_row        = EXCLUDED.raw_row`,
                    [cohortId, candidate.candidate_name, candidate.email, candidate.student_id, candidate.department, candidate.phone, JSON.stringify(candidate.raw_row || {})]
                )
                inserted++
            }

            if (upload_id) {
                await client.query(`UPDATE cohort_uploads SET status = 'sent' WHERE id = $1`, [upload_id])
            }

            // Log notification
            await client.query(
                `INSERT INTO institution_notifications (institution_id, cohort_id, type, recipients, sent_at)
         VALUES ($1, $2, 'onboarding_invite', $3, now())`,
                [institutionId, cohortId, inserted]
            )

            await client.query('COMMIT')
            return res.json({ inserted, message: `${inserted} candidates added to cohort. Invitations queued.` })
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    } catch (err) {
        logger.error('commitUpload error', { err })
        return res.status(500).json({ error: 'Failed to commit upload' })
    }
}

// ─────────────────────────────────────────────
// NOTIFICATIONS LOG
// ─────────────────────────────────────────────

export async function getNotifications(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId)
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })

        const { rows } = await query(
            `SELECT n.*, c.name as cohort_name
       FROM institution_notifications n
       LEFT JOIN cohorts c ON c.id = n.cohort_id
       WHERE n.institution_id = $1
       ORDER BY n.sent_at DESC
       LIMIT 50`,
            [institutionId]
        )
        return res.json({ notifications: rows })
    } catch (err) {
        logger.error('getNotifications error', { err })
        return res.status(500).json({ error: 'Failed to fetch notifications' })
    }
}

// ─────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────

export async function updateSettings(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId, ['owner'])
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })

        const { name, contact_email, brand_accent_hex, email_signature } = req.body
        const { rows } = await query(
            `UPDATE institutions
       SET name              = COALESCE($1, name),
           contact_email     = COALESCE($2, contact_email),
           brand_accent_hex  = COALESCE($3, brand_accent_hex),
           email_signature   = COALESCE($4, email_signature)
       WHERE id = $5
       RETURNING *`,
            [name, contact_email, brand_accent_hex, email_signature, institutionId]
        )
        return res.json(rows[0])
    } catch (err) {
        logger.error('updateSettings error', { err })
        return res.status(500).json({ error: 'Failed to update settings' })
    }
}

// ─────────────────────────────────────────────
// INSTITUTION ADMINS
// ─────────────────────────────────────────────

export async function listAdmins(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId, ['owner'])
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })

        const { rows } = await query(
            `SELECT ia.id, ia.role, ia.created_at, u.name, u.email
       FROM institution_admins ia
       JOIN users u ON u.user_id = ia.user_id
       WHERE ia.institution_id = $1
       ORDER BY ia.created_at ASC`,
            [institutionId]
        )
        return res.json({ admins: rows })
    } catch (err) {
        logger.error('listAdmins error', { err })
        return res.status(500).json({ error: 'Failed to list admins' })
    }
}

// ─────────────────────────────────────────────
// AUTH: Institution sign-in (portal = 'institution')
// ─────────────────────────────────────────────

export async function institutionSignin(req: Request, res: Response) {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    try {
        const bcrypt = await import('bcrypt')
        const jwt = await import('jsonwebtoken')
        const JWT_SECRET = process.env.JWT_SECRET!

        const { rows } = await query<{ user_id: string; password_hash: string; role: string; is_active: boolean; name: string | null; company_role: string | null }>(
            `SELECT * FROM users WHERE email = $1`, [email.toLowerCase().trim()]
        )
        if (rows.length === 0 || !(await bcrypt.default.compare(password, rows[0].password_hash))) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }
        const user = rows[0]
        if (!user.is_active) return res.status(401).json({ error: 'Account inactive' })

        // Verify the user is an institution admin
        const { rows: instRows } = await query<{ id: string; name: string; slug: string; role: string }>(
            `SELECT i.id, i.name, i.slug, ia.role
       FROM institutions i
       JOIN institution_admins ia ON ia.institution_id = i.id
       WHERE ia.user_id = $1
       LIMIT 1`,
            [user.user_id]
        )
        if (instRows.length === 0) return res.status(403).json({ error: 'You are not an institution administrator' })

        const inst = instRows[0]
        const token = jwt.default.sign(
            { sub: user.user_id, email, role: user.role, portal: 'institution', institution_id: inst.id },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        return res.json({
            token,
            user: { id: user.user_id, email, name: user.name, role: user.role },
            institution: { id: inst.id, name: inst.name, slug: inst.slug, my_role: inst.role }
        })
    } catch (err) {
        logger.error('institutionSignin error', { err })
        return res.status(500).json({ error: 'Sign-in failed' })
    }
}

// ─────────────────────────────────────────────
// ADMIN: create institution + first admin
// ─────────────────────────────────────────────

export async function createInstitution(req: AuthRequest, res: Response) {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const { name, slug, contact_email, country, admin_email, admin_name, admin_password } = req.body
    if (!name || !slug || !contact_email || !admin_email || !admin_password) {
        return res.status(400).json({ error: 'name, slug, contact_email, admin_email, admin_password required' })
    }

    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const bcrypt = await import('bcrypt')
        const hash = await bcrypt.default.hash(admin_password, 10)

        // Upsert user
        const { rows: userRows } = await client.query(
            `INSERT INTO users (email, password_hash, name, role, is_active, company_role)
       VALUES ($1, $2, $3, 'user', true, 'institution')
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING user_id`,
            [admin_email.toLowerCase().trim(), hash, admin_name || admin_email]
        )
        const userId = userRows[0].user_id

        // Create institution
        const { rows: instRows } = await client.query(
            `INSERT INTO institutions (name, slug, contact_email, country)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [name, slug.toLowerCase().replace(/\s+/g, '-'), contact_email, country || 'KE']
        )
        const institution = instRows[0]

        // Create admin link
        const { rows: adminRows } = await client.query(
            `INSERT INTO institution_admins (institution_id, user_id, role)
       VALUES ($1, $2, 'owner')
       RETURNING id`,
            [institution.id, userId]
        )

        await client.query('COMMIT')
        return res.status(201).json({ institution, admin_id: adminRows[0].id })
    } catch (err) {
        await client.query('ROLLBACK')
        logger.error('createInstitution error', { err })
        return res.status(500).json({ error: 'Failed to create institution' })
    } finally {
        client.release()
    }
}
