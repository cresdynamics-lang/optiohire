import type { Request, Response } from 'express'
import { query, pool } from '../db/index.js'
import { logger } from '../utils/logger.js'
import type { AuthRequest } from '../middleware/auth.js'
import { EmailService } from '../services/emailService.js'

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

        // Get cohortId from query param if available, otherwise get the most recent active cohort
        const reqCohortId = req.query.cohortId as string | undefined
        let cohort = null

        if (reqCohortId) {
            const { rows: cohortRows } = await query<{ id: string; name: string }>(
                `SELECT id, name FROM cohorts
                 WHERE institution_id = $1 AND id = $2`,
                [institutionId, reqCohortId]
            )
            cohort = cohortRows[0]
        } else {
            const { rows: cohortRows } = await query<{ id: string; name: string }>(
                `SELECT id, name FROM cohorts
                 WHERE institution_id = $1 AND status = 'active'
                 ORDER BY created_at DESC LIMIT 1`,
                [institutionId]
            )
            cohort = cohortRows[0]
        }

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

            // Aggregate placements/internships by employer from matched_to
            const { rows: employerRows } = await query<{ matched_to: string; count: string; avg_score: string }>(
                `SELECT matched_to, COUNT(*) as count, AVG(match_score) as avg_score
                 FROM cohort_candidates
                 WHERE cohort_id = $1 AND row_status IN ('placed', 'interning') AND matched_to IS NOT NULL AND matched_to != ''
                 GROUP BY matched_to
                 ORDER BY count DESC, avg_score DESC
                 LIMIT 5`,
                [cohort.id]
            )
            topEmployers = employerRows.map(r => {
                const parts = r.matched_to.split(/—|-/);
                const employer = parts[0]?.trim() || r.matched_to;
                const roleType = parts[1]?.trim() || 'General';
                return {
                    employer,
                    role_type: roleType,
                    placed: parseInt(r.count),
                    avg_score: r.avg_score ? Math.round(parseFloat(r.avg_score)) : 0
                };
            })

            // Get recent activity timeline for this cohort
            const { rows: activityRows } = await query<{ candidate_name: string; row_status: string; matched_to: string | null; last_activity: Date }>(
                `SELECT candidate_name, row_status, matched_to, last_activity
                 FROM cohort_candidates
                 WHERE cohort_id = $1 AND last_activity IS NOT NULL
                 ORDER BY last_activity DESC
                 LIMIT 10`,
                [cohort.id]
            )
            recentActivity = activityRows.map(r => {
                let title = '';
                let desc = '';
                const name = r.candidate_name || 'Candidate';

                switch (r.row_status) {
                    case 'placed':
                        title = `${name} placed`;
                        desc = `Placed at ${r.matched_to || 'Employer'}`;
                        break;
                    case 'interning':
                        title = `${name} started internship`;
                        desc = `Interning at ${r.matched_to || 'Employer'}`;
                        break;
                    case 'interviewing':
                        title = `${name} interviewing`;
                        desc = `Interviewing for ${r.matched_to || 'Role'}`;
                        break;
                    case 'shortlisted':
                        title = `${name} shortlisted`;
                        desc = `Shortlisted for ${r.matched_to || 'Role'}`;
                        break;
                    case 'activated':
                        title = `${name} activated account`;
                        desc = `Completed profile setup`;
                        break;
                    case 'invited':
                        title = `Invitation sent to ${name}`;
                        desc = `Awaiting account activation`;
                        break;
                    case 'requires_review':
                        title = `Review required for ${name}`;
                        desc = `Low-confidence CV extraction flagged`;
                        break;
                    default:
                        title = `${name} status updated to ${r.row_status}`;
                        desc = r.matched_to || '';
                }

                return {
                    title,
                    desc,
                    time: r.last_activity
                };
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

        const all = req.query.all === 'true'
        const page = Math.max(1, parseInt(req.query.page as string) || 1)
        const limit = all ? 100000 : Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50))
        const offset = all ? 0 : (page - 1) * limit
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

            const { rows: instRows } = await client.query(
                `SELECT name FROM institutions WHERE id = $1`,
                [institutionId]
            )
            const instName = instRows[0]?.name || 'Your Institution'

            await client.query('COMMIT')

            // Send invite emails in background asynchronously
            const emailService = new EmailService()
            valid.forEach(candidate => {
                sendCohortInviteEmail(emailService, instName, candidate.candidate_name, candidate.email, candidate.student_id, candidate.department)
                    .catch(err => logger.error('Failed to send onboarding invite', { email: candidate.email, err }));
            });

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
// AUTH: Institution self-service sign-up
// ─────────────────────────────────────────────

export async function institutionSignup(req: Request, res: Response) {
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
        
        // Generate JWT token so they log in immediately upon signup
        const jwt = await import('jsonwebtoken')
        const JWT_SECRET = process.env.JWT_SECRET!
        const token = jwt.default.sign(
            { sub: userId, email: admin_email, role: 'user', portal: 'institution', institution_id: institution.id },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        return res.status(201).json({
            token,
            user: { id: userId, email: admin_email, name: admin_name || admin_email, role: 'user' },
            institution: { id: institution.id, name: institution.name, slug: institution.slug, my_role: 'owner' }
        })
    } catch (err) {
        await client.query('ROLLBACK')
        logger.error('institutionSignup error', { err })
        return res.status(500).json({ error: 'Failed to register institution' })
    } finally {
        client.release()
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

// ─────────────────────────────────────────────
// HELPERS & NEW ACTIONS (Resends & Invites)
// ─────────────────────────────────────────────

async function sendCohortInviteEmail(
    emailService: any,
    institutionName: string,
    candidateName: string,
    candidateEmail: string,
    studentId?: string | null,
    department?: string | null
) {
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '')
    const activationUrl = `${appUrl}/auth/signup?email=${encodeURIComponent(candidateEmail)}`
    
    const html = `
<div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #152A22; background-color: #F3F5EF;">
  <div style="background-color: #1F4D3D; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-family: Georgia, serif; font-size: 24px;">Your Career Profile is Ready</h1>
  </div>
  <div style="background-color: #ffffff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #DCE1D5; border-top: none;">
    <p>Hello ${candidateName},</p>
    <p>Your profile for the <strong>${institutionName}</strong> graduating cohort has been created on OptioHire.</p>
    <p>Activate your account to complete your profile, upload your CV, and start matching with top employers.</p>
    <div style="background-color: #FAFBF7; padding: 16px; border-radius: 6px; border: 1px solid #DCE1D5; margin: 20px 0;">
      <div style="margin-bottom: 8px;"><strong>Student ID:</strong> ${studentId || '—'}</div>
      <div><strong>Department:</strong> ${department || '—'}</div>
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${activationUrl}" style="background-color: #B98A2E; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Activate Profile</a>
    </div>
    <hr style="border: none; border-top: 1px solid #DCE1D5; margin: 24px 0;" />
    <p style="font-size: 12px; color: #3E5449;">If the button above does not work, copy and paste this link into your browser: <br />${activationUrl}</p>
  </div>
</div>
    `
    const text = `Hello ${candidateName},\n\nYour profile for the ${institutionName} graduating cohort has been created on OptioHire.\n\nActivate your account to complete your profile, upload your CV, and start matching with top employers.\n\nStudent ID: ${studentId || '—'}\nDepartment: ${department || '—'}\n\nActivate here: ${activationUrl}`

    await emailService.sendEmail({
        to: candidateEmail,
        subject: `Your ${institutionName} Career Profile is ready — activate on OptioHire`,
        html,
        text,
        emailType: 'onboarding_invite',
        recipientName: candidateName,
        useSecondaryKey: true
    })
}

export async function resendCohortInvites(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId, cohortId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId, ['owner', 'roster_manager'])
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })

        const { rows: instRows } = await query<{ name: string }>(
            `SELECT name FROM institutions WHERE id = $1`,
            [institutionId]
        )
        const instName = instRows[0]?.name || 'Your Institution'

        const { rows: candidates } = await query<{ candidate_name: string; email: string; student_id: string; department: string }>(
            `SELECT candidate_name, email, student_id, department 
             FROM cohort_candidates 
             WHERE cohort_id = $1 AND row_status = 'invited'`,
            [cohortId]
        )

        if (candidates.length === 0) {
            return res.json({ message: 'No inactive candidates to invite.' })
        }

        const emailService = new EmailService()
        candidates.forEach(c => {
            sendCohortInviteEmail(emailService, instName, c.candidate_name, c.email, c.student_id, c.department)
                .catch(err => logger.error('Failed to resend onboarding invite', { email: c.email, err }))
        })

        // Log a notification
        await query(
            `INSERT INTO institution_notifications (institution_id, cohort_id, type, recipients, sent_at)
             VALUES ($1, $2, 'reminder', $3, now())`,
            [institutionId, cohortId, candidates.length]
        )

        return res.json({ message: `Queued resending ${candidates.length} invitations.` })
    } catch (err) {
        logger.error('resendCohortInvites error', { err })
        return res.status(500).json({ error: 'Failed to resend invites' })
    }
}

export async function resendCandidateInvite(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId, cohortId, candidateId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId, ['owner', 'roster_manager'])
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })

        const { rows: instRows } = await query<{ name: string }>(
            `SELECT name FROM institutions WHERE id = $1`,
            [institutionId]
        )
        const instName = instRows[0]?.name || 'Your Institution'

        const { rows: candidates } = await query<{ candidate_name: string; email: string; student_id: string; department: string; row_status: string }>(
            `SELECT candidate_name, email, student_id, department, row_status
             FROM cohort_candidates 
             WHERE cohort_id = $1 AND id = $2`,
            [cohortId, candidateId]
        )

        if (candidates.length === 0) {
            return res.status(404).json({ error: 'Candidate not found in this cohort.' })
        }

        const candidate = candidates[0]
        const emailService = new EmailService()
        await sendCohortInviteEmail(emailService, instName, candidate.candidate_name, candidate.email, candidate.student_id, candidate.department)

        // Update last activity
        await query(
            `UPDATE cohort_candidates SET last_activity = now() WHERE id = $1`,
            [candidateId]
        )

        return res.json({ message: `Invitation resent to ${candidate.email}.` })
    } catch (err) {
        logger.error('resendCandidateInvite error', { err })
        return res.status(500).json({ error: 'Failed to resend invite' })
    }
}
// ---------------------------------------------
// PUBLIC ENDPOINTS
// ---------------------------------------------

export async function getPublicInstitutionByToken(req: Request, res: Response) {
    try {
        const { token } = req.params;
        
        // First try to look up in onboarding invites
        const { rows: inviteRows } = await query(
            `SELECT id, token, institution_name as name, sent_to as contact_email, status
             FROM institution_onboarding_invites
             WHERE token = $1 LIMIT 1`,
            [token]
        );

        if (inviteRows.length > 0) {
            const invite = inviteRows[0];
            
            // Mark as opened if it was not opened
            if (invite.status === 'not_opened') {
                await query(
                    `UPDATE institution_onboarding_invites 
                     SET status = 'opened', opened_at = now() 
                     WHERE token = $1`,
                    [token]
                );
            }
            
            // Return shape expected by frontend
            return res.json({
                isInvite: true,
                token: invite.token,
                name: invite.name,
                contact_email: invite.contact_email,
                status: invite.status
            });
        }

        // Fallback for older tokens or IDs
        const { rows } = await query(
            `SELECT id, name, slug, contact_email, brand_accent_hex, country 
             FROM institutions 
             WHERE id = $1 OR slug = $1 LIMIT 1`,
            [token]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Institution not found' });
        }
        return res.json(rows[0]);
    } catch (err) {
        try {
            const { rows } = await query(
                `SELECT id, name, slug, contact_email, brand_accent_hex, country 
                 FROM institutions 
                 WHERE slug = $1 LIMIT 1`,
                [req.params.token]
            );
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Institution not found' });
            }
            return res.json(rows[0]);
        } catch (fallbackErr) {
            return res.status(500).json({ error: 'Failed to fetch public institution data' });
        }
    }
}

export async function activateInstitution(req: Request, res: Response) {
    try {
        const { token } = req.params;
        const { 
            contactName, 
            contactTitle, 
            contactPhone, 
            password,
            brandColor,
            website,
            address,
            country
        } = req.body;

        // Verify token
        const { rows: inviteRows } = await query(
            `SELECT * FROM institution_onboarding_invites WHERE token = $1`,
            [token]
        );

        if (inviteRows.length === 0) {
            return res.status(404).json({ error: 'Invalid or expired token' });
        }

        const invite = inviteRows[0];
        if (invite.status === 'completed') {
            return res.status(400).json({ error: 'This invite has already been used' });
        }

        const slug = invite.institution_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        // Generate password hash
        const bcrypt = await import('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await query('BEGIN');

        try {
            // Create User
            const { rows: userRows } = await query(
                `INSERT INTO users (full_name, email, password_hash, role)
                 VALUES ($1, $2, $3, 'institution_admin')
                 RETURNING user_id`,
                [contactName, invite.sent_to, hashedPassword]
            );
            const userId = userRows[0].user_id;

            // Create Institution
            const { rows: instRows } = await query(
                `INSERT INTO institutions (name, slug, country, contact_email, brand_accent_hex)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id`,
                [invite.institution_name, country || 'KE', invite.sent_to, brandColor || '#1F4D3D']
            );
            const instId = instRows[0].id;

            // Link Admin
            await query(
                `INSERT INTO institution_admins (institution_id, user_id, role)
                 VALUES ($1, $2, 'owner')`,
                [instId, userId]
            );

            // Update Invite
            await query(
                `UPDATE institution_onboarding_invites 
                 SET status = 'completed', completed_at = now() 
                 WHERE token = $1`,
                [token]
            );

            await query('COMMIT');

            // Send Welcome Email
            const emailService = new EmailService();
            await emailService.sendInstitutionWelcome({
                institutionName: invite.institution_name,
                contactEmail: invite.sent_to,
                contactName: contactName
            });

            return res.json({ message: 'Institution activated successfully' });
        } catch (txErr: any) {
            await query('ROLLBACK');
            logger.error('Error activating institution transaction:', txErr);
            // Handle duplicate slug or email
            if (txErr.code === '23505') {
                 return res.status(400).json({ error: 'An account or institution with this email/name already exists.' });
            }
            throw txErr;
        }

    } catch (err) {
        logger.error('Error activating institution:', err);
        return res.status(500).json({ error: 'Failed to activate institution' });
    }
}
