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

        const { syncInstitutionPlacementsFromApplications } = await import('../services/institutionPlacementSync.js')
        await syncInstitutionPlacementsFromApplications(institutionId)

        const { rows: instRows } = await query<{
            id: string; name: string; slug: string; contact_email: string;
            brand_accent_hex: string; country: string; email_signature: string | null
        }>(
            `SELECT id, name, slug, contact_email, brand_accent_hex, country, email_signature
             FROM institutions WHERE id = $1`,
            [institutionId]
        )
        const institution = instRows[0]
        if (!institution) return res.status(404).json({ error: 'Institution not found' })

        // ── Key KPI row (spec) ──────────────────────────────────────────────
        const { rows: kpiRows } = await query<{
            total_students: string
            matched_this_month: string
            contacted_this_week: string
            placements_total: string
        }>(
            `SELECT
               COUNT(*)::text AS total_students,
               COUNT(*) FILTER (
                 WHERE cc.row_status IN ('shortlisted','interviewing','placed','interning')
                   AND cc.last_activity >= date_trunc('month', NOW())
               )::text AS matched_this_month,
               COUNT(*) FILTER (
                 WHERE cc.row_status IN ('shortlisted','interviewing','placed','interning')
                   AND cc.last_activity >= NOW() - INTERVAL '7 days'
               )::text AS contacted_this_week,
               COUNT(*) FILTER (
                 WHERE cc.row_status IN ('placed','interning')
               )::text AS placements_total
             FROM cohort_candidates cc
             JOIN cohorts c ON c.id = cc.cohort_id
             WHERE c.institution_id = $1`,
            [institutionId]
        )
        const kpi = {
            total_students_onboarded: Number(kpiRows[0]?.total_students || 0),
            matched_this_month: Number(kpiRows[0]?.matched_this_month || 0),
            contacted_this_week: Number(kpiRows[0]?.contacted_this_week || 0),
            placements_confirmed: Number(kpiRows[0]?.placements_total || 0),
        }

        // Legacy pipeline stats (all cohorts)
        const { rows: statRows } = await query<{ row_status: string; count: string }>(
            `SELECT cc.row_status, COUNT(*)::text AS count
             FROM cohort_candidates cc
             JOIN cohorts c ON c.id = cc.cohort_id
             WHERE c.institution_id = $1
             GROUP BY cc.row_status`,
            [institutionId]
        )
        const stats = {
            enrolled: 0, activated: 0, shortlisted: 0, interviewing: 0,
            placed: 0, interning: 0, requires_review: 0, pool: 0, invited: 0,
        }
        for (const r of statRows) {
            const key = r.row_status as keyof typeof stats
            if (key in stats) stats[key] = Number(r.count)
        }

        // Activity feed
        const { rows: activityRows } = await query<{
            candidate_name: string; row_status: string; matched_to: string | null;
            department: string | null; last_activity: Date
        }>(
            `SELECT cc.candidate_name, cc.row_status, cc.matched_to, cc.department, cc.last_activity
             FROM cohort_candidates cc
             JOIN cohorts c ON c.id = cc.cohort_id
             WHERE c.institution_id = $1 AND cc.last_activity IS NOT NULL
             ORDER BY cc.last_activity DESC
             LIMIT 25`,
            [institutionId]
        )
        const recent_activity = activityRows.map((r) => {
            const name = r.candidate_name || 'Student'
            const employer = (r.matched_to || '').split(/-|-/).map((s) => s.trim())[0] || 'an employer'
            let message = `${name} updated status to ${r.row_status}`
            if (r.row_status === 'placed') message = `Student ${name} was placed at ${employer}`
            else if (r.row_status === 'interning') message = `Student ${name} started interning at ${employer}`
            else if (r.row_status === 'shortlisted') message = `Student ${name} was matched / shortlisted${r.matched_to ? ` for ${r.matched_to}` : ''}`
            else if (r.row_status === 'interviewing') message = `Employer contacted ${name} for an interview`
            else if (r.row_status === 'activated') message = `${name} created / activated their profile`
            else if (r.row_status === 'invited') message = `Invitation sent to ${name}`
            return {
                message,
                candidate_name: name,
                status: r.row_status,
                department: r.department,
                matched_to: r.matched_to,
                time: r.last_activity,
            }
        })

        // Employer engagement - week buckets last 30 days
        const { rows: engRows } = await query<{ week_start: string; engagements: string }>(
            `SELECT to_char(date_trunc('week', cc.last_activity), 'YYYY-MM-DD') AS week_start,
                    COUNT(*)::text AS engagements
             FROM cohort_candidates cc
             JOIN cohorts c ON c.id = cc.cohort_id
             WHERE c.institution_id = $1
               AND cc.row_status IN ('shortlisted','interviewing','placed','interning')
               AND cc.last_activity >= NOW() - INTERVAL '30 days'
             GROUP BY 1
             ORDER BY 1 ASC`,
            [institutionId]
        )
        const employer_engagement = engRows.map((r) => ({
            week: r.week_start,
            engagements: Number(r.engagements),
        }))

        // Department breakdown
        const { rows: deptRows } = await query<{ department: string; count: string; active: string }>(
            `SELECT COALESCE(NULLIF(TRIM(cc.department), ''), 'Unspecified') AS department,
                    COUNT(*)::text AS count,
                    COUNT(*) FILTER (WHERE cc.row_status IN ('activated','shortlisted','interviewing','placed','interning'))::text AS active
             FROM cohort_candidates cc
             JOIN cohorts c ON c.id = cc.cohort_id
             WHERE c.institution_id = $1
             GROUP BY 1
             ORDER BY COUNT(*) DESC`,
            [institutionId]
        )
        const departments = deptRows.map((r) => ({
            department: r.department,
            total: Number(r.count),
            active: Number(r.active),
        }))

        // Top matched skills (from department / matched_to / programme heuristics + optional metadata)
        const { rows: skillRows } = await query<{ skill: string; count: string }>(
            `SELECT skill, COUNT(*)::text AS count FROM (
               SELECT unnest(string_to_array(
                 lower(coalesce(cc.department,'') || ' ' || coalesce(cc.matched_to,'') || ' ' || coalesce(c.programme,'')),
                 ' '
               )) AS skill
               FROM cohort_candidates cc
               JOIN cohorts c ON c.id = cc.cohort_id
               WHERE c.institution_id = $1
                 AND cc.row_status IN ('shortlisted','interviewing','placed','interning')
                 AND cc.last_activity >= date_trunc('month', NOW())
             ) s
             WHERE length(skill) > 3
               AND skill NOT IN ('the','and','for','with','from','into','role','at','to','of','in','a','an','or')
             GROUP BY skill
             ORDER BY COUNT(*) DESC
             LIMIT 5`,
            [institutionId]
        )
        const top_skills = skillRows.map((r) => ({ skill: r.skill, count: Number(r.count) }))

        // Top employers
        const { rows: employerRows } = await query<{ matched_to: string; count: string }>(
            `SELECT matched_to, COUNT(*)::text AS count
             FROM cohort_candidates cc
             JOIN cohorts c ON c.id = cc.cohort_id
             WHERE c.institution_id = $1
               AND cc.matched_to IS NOT NULL AND cc.matched_to != ''
               AND cc.row_status IN ('shortlisted','interviewing','placed','interning')
             GROUP BY matched_to
             ORDER BY COUNT(*) DESC
             LIMIT 8`,
            [institutionId]
        )
        const top_employers = employerRows.map((r) => {
            const parts = r.matched_to.split(/-|-/)
            return {
                employer: parts[0]?.trim() || r.matched_to,
                role_type: parts[1]?.trim() || 'General',
                engagements: Number(r.count),
                matched_to: r.matched_to,
            }
        })

        // Upcoming / recent onboarding sessions (from uploads + optional sessions table)
        let upcoming_onboarding: any[] = []
        try {
            const { rows } = await query(
                `SELECT s.id, s.scheduled_at, s.department, s.expected_count, s.status, s.facilitator
                 FROM institution_onboarding_sessions s
                 WHERE s.institution_id = $1
                   AND (s.scheduled_at >= NOW() - INTERVAL '1 day' OR s.status = 'scheduled')
                 ORDER BY s.scheduled_at ASC
                 LIMIT 5`,
                [institutionId]
            )
            upcoming_onboarding = rows
        } catch {
            // Table may not exist yet - fall back to recent uploads as sessions
            const { rows } = await query(
                `SELECT cu.id, cu.created_at AS scheduled_at, cu.row_count AS expected_count,
                        cu.status, c.name AS department, cu.original_filename
                 FROM cohort_uploads cu
                 JOIN cohorts c ON c.id = cu.cohort_id
                 WHERE c.institution_id = $1
                 ORDER BY cu.created_at DESC
                 LIMIT 5`,
                [institutionId]
            )
            upcoming_onboarding = rows.map((r: any) => ({
                id: r.id,
                scheduled_at: r.scheduled_at,
                department: r.department,
                expected_count: r.expected_count,
                status: r.status,
                facilitator: 'Bulk upload',
                note: r.original_filename,
            }))
        }

        const { rows: cohorts } = await query(
            `SELECT c.id, c.name, c.programme, c.academic_level, c.status, c.created_at,
                    COUNT(cc.id)::int AS total_candidates,
                    COUNT(cc.id) FILTER (WHERE cc.row_status = 'activated')::int AS activated,
                    COUNT(cc.id) FILTER (WHERE cc.row_status IN ('placed','interning'))::int AS placed
             FROM cohorts c
             LEFT JOIN cohort_candidates cc ON cc.cohort_id = c.id
             WHERE c.institution_id = $1
             GROUP BY c.id
             ORDER BY c.created_at DESC
             LIMIT 8`,
            [institutionId]
        )

        return res.json({
            institution,
            kpi,
            stats,
            recent_activity,
            employer_engagement,
            departments,
            top_skills,
            top_employers,
            upcoming_onboarding,
            cohorts,
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

        const { name, contact_email, brand_accent_hex, email_signature, logo_url, admin_name } = req.body

        const sets: string[] = []
        const params: unknown[] = []
        let idx = 1
        if (name !== undefined) {
            sets.push(`name = $${idx++}`)
            params.push(name)
        }
        if (contact_email !== undefined) {
            sets.push(`contact_email = $${idx++}`)
            params.push(contact_email)
        }
        if (brand_accent_hex !== undefined) {
            sets.push(`brand_accent_hex = $${idx++}`)
            params.push(brand_accent_hex)
        }
        if (email_signature !== undefined) {
            sets.push(`email_signature = $${idx++}`)
            params.push(email_signature)
        }
        if (logo_url !== undefined) {
            sets.push(`logo_url = $${idx++}`)
            params.push(logo_url || null)
        }

        if (sets.length === 0 && admin_name === undefined) {
            return res.status(400).json({ error: 'No settings to update' })
        }

        let rows: any[] = []
        if (sets.length > 0) {
            params.push(institutionId)
            const result = await query(
                `UPDATE institutions SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
                params
            )
            rows = result.rows
        } else {
            const result = await query(`SELECT * FROM institutions WHERE id = $1`, [institutionId])
            rows = result.rows
        }

        if (admin_name !== undefined && req.userId) {
            await query(
                `UPDATE users SET name = $2, updated_at = NOW() WHERE user_id = $1`,
                [req.userId, typeof admin_name === 'string' ? admin_name.trim() || null : null]
            )
        }

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
        const { rows: instRows } = await query<{ id: string; name: string; slug: string; role: string; logo_url: string | null }>(
            `SELECT i.id, i.name, i.slug, i.logo_url, ia.role
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
            institution: { id: inst.id, name: inst.name, slug: inst.slug, my_role: inst.role, logo_url: inst.logo_url || null }
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
      <div style="margin-bottom: 8px;"><strong>Student ID:</strong> ${studentId || '-'}</div>
      <div><strong>Department:</strong> ${department || '-'}</div>
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${activationUrl}" style="background-color: #B98A2E; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Activate Profile</a>
    </div>
    <hr style="border: none; border-top: 1px solid #DCE1D5; margin: 24px 0;" />
    <p style="font-size: 12px; color: #3E5449;">If the button above does not work, copy and paste this link into your browser: <br />${activationUrl}</p>
  </div>
</div>
    `
    const text = `Hello ${candidateName},\n\nYour profile for the ${institutionName} graduating cohort has been created on OptioHire.\n\nActivate your account to complete your profile, upload your CV, and start matching with top employers.\n\nStudent ID: ${studentId || '-'}\nDepartment: ${department || '-'}\n\nActivate here: ${activationUrl}`

    await emailService.sendEmail({
        to: candidateEmail,
        subject: `Your ${institutionName} Career Profile is ready - activate on OptioHire`,
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

// ─────────────────────────────────────────────
// STUDENTS (institution-wide roster)
// ─────────────────────────────────────────────

export async function listInstitutionStudents(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId)
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })

        const search = String(req.query.search || '').trim()
        const department = String(req.query.department || '').trim()
        const status = String(req.query.status || '').trim()
        const page = Math.max(1, Number(req.query.page || 1))
        const limit = Math.min(100, Math.max(1, Number(req.query.limit || 50)))
        const offset = (page - 1) * limit

        const conditions = ['c.institution_id = $1']
        const params: any[] = [institutionId]
        let idx = 2
        if (search) {
            conditions.push(`(cc.candidate_name ILIKE $${idx} OR cc.email ILIKE $${idx} OR cc.student_id ILIKE $${idx})`)
            params.push(`%${search}%`)
            idx++
        }
        if (department) {
            conditions.push(`cc.department ILIKE $${idx}`)
            params.push(`%${department}%`)
            idx++
        }
        if (status === 'active') {
            conditions.push(`cc.row_status IN ('activated','shortlisted','interviewing')`)
        } else if (status === 'placed') {
            conditions.push(`cc.row_status IN ('placed','interning')`)
        } else if (status === 'inactive') {
            conditions.push(`cc.row_status IN ('invited','enrolled','pool','requires_review')`)
        } else if (status) {
            conditions.push(`cc.row_status = $${idx}`)
            params.push(status)
            idx++
        }

        const where = conditions.join(' AND ')
        const { rows: countRows } = await query<{ count: string }>(
            `SELECT COUNT(*)::text AS count
             FROM cohort_candidates cc JOIN cohorts c ON c.id = cc.cohort_id
             WHERE ${where}`,
            params
        )
        const { rows } = await query(
            `SELECT cc.id, cc.candidate_name, cc.email, cc.student_id, cc.department,
                    cc.row_status, cc.match_score, cc.matched_to, cc.last_activity, cc.invited_at, cc.activated_at,
                    c.name AS cohort_name, c.programme,
                    CASE
                      WHEN cc.row_status IN ('placed','interning') THEN 100
                      WHEN cc.row_status = 'interviewing' THEN 80
                      WHEN cc.row_status = 'shortlisted' THEN 65
                      WHEN cc.row_status = 'activated' THEN 50
                      WHEN cc.row_status = 'invited' THEN 20
                      ELSE 10
                    END AS profile_completion,
                    CASE
                      WHEN cc.row_status IN ('placed','interning') THEN 'placed'
                      WHEN cc.row_status IN ('activated','shortlisted','interviewing') THEN 'active'
                      ELSE 'inactive'
                    END AS employment_status
             FROM cohort_candidates cc
             JOIN cohorts c ON c.id = cc.cohort_id
             WHERE ${where}
             ORDER BY cc.last_activity DESC NULLS LAST, cc.candidate_name ASC
             LIMIT $${idx} OFFSET $${idx + 1}`,
            [...params, limit, offset]
        )

        return res.json({
            students: rows,
            total: Number(countRows[0]?.count || 0),
            page,
            limit,
        })
    } catch (err) {
        logger.error('listInstitutionStudents error', { err })
        return res.status(500).json({ error: 'Failed to list students' })
    }
}

export async function listEmployerActivity(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId)
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })

        const { syncInstitutionPlacementsFromApplications } = await import('../services/institutionPlacementSync.js')
        await syncInstitutionPlacementsFromApplications(institutionId)

        // Live application pipeline for roster students (email match) + roster matched_to
        const { rows: appRows } = await query(
            `SELECT cc.id AS candidate_row_id, cc.candidate_name, cc.department, cc.email,
                    c.name AS cohort_name, a.application_id, a.ai_status, a.interview_status,
                    a.ai_score, COALESCE(a.updated_at, a.created_at) AS contacted_at,
                    jp.job_title, co.company_name
             FROM cohort_candidates cc
             JOIN cohorts c ON c.id = cc.cohort_id
             JOIN applications a ON lower(a.email) = lower(cc.email)
             JOIN job_postings jp ON jp.job_posting_id = a.job_posting_id
             LEFT JOIN companies co ON co.company_id = COALESCE(a.company_id, jp.company_id)
             WHERE c.institution_id = $1
               AND (
                 upper(coalesce(a.ai_status::text,'')) IN ('SHORTLIST','SHORTLISTED','FLAG','HIRED','OFFER')
                 OR upper(coalesce(a.interview_status::text,'')) IN ('SCHEDULED','COMPLETED','INTERVIEWING','HIRED')
                 OR a.interview_time IS NOT NULL
               )
             ORDER BY COALESCE(a.updated_at, a.created_at) DESC
             LIMIT 200`,
            [institutionId]
        )

        const activityFromApps = appRows.map((r: any) => {
            let status = 'shortlisted'
            const ai = String(r.ai_status || '').toUpperCase()
            const iv = String(r.interview_status || '').toUpperCase()
            if (ai === 'HIRED' || iv === 'HIRED') status = 'placed'
            else if (ai === 'OFFER') status = 'interning'
            else if (['SCHEDULED', 'COMPLETED', 'INTERVIEWING'].includes(iv) || r.interview_status) status = 'interviewing'
            return {
                id: `${r.candidate_row_id}-${r.application_id}`,
                employer: r.company_name || 'Employer',
                role: r.job_title || 'Role under consideration',
                student_name: r.candidate_name,
                department: r.department,
                status,
                match_score: r.ai_score,
                contacted_at: r.contacted_at,
                cohort_name: r.cohort_name,
                source: 'application',
            }
        })

        const { rows } = await query(
            `SELECT cc.id, cc.candidate_name, cc.department, cc.matched_to, cc.row_status,
                    cc.match_score, cc.last_activity, c.name AS cohort_name
             FROM cohort_candidates cc
             JOIN cohorts c ON c.id = cc.cohort_id
             WHERE c.institution_id = $1
               AND cc.matched_to IS NOT NULL AND cc.matched_to != ''
               AND cc.row_status IN ('shortlisted','interviewing','placed','interning')
             ORDER BY cc.last_activity DESC NULLS LAST
             LIMIT 200`,
            [institutionId]
        )

        const activityFromRoster = rows.map((r: any) => {
            const parts = String(r.matched_to || '').split(/-|-/)
            return {
                id: r.id,
                employer: parts[0]?.trim() || r.matched_to,
                role: parts.slice(1).join(' - ').trim() || 'Role under consideration',
                student_name: r.candidate_name,
                department: r.department,
                status: r.row_status,
                match_score: r.match_score,
                contacted_at: r.last_activity,
                cohort_name: r.cohort_name,
                source: 'roster',
            }
        })

        // Prefer application-backed rows; append roster-only unique students
        const seen = new Set(activityFromApps.map((a: any) => `${a.student_name}|${a.employer}|${a.role}`))
        const merged = [
            ...activityFromApps,
            ...activityFromRoster.filter((a: any) => !seen.has(`${a.student_name}|${a.employer}|${a.role}`)),
        ]
        return res.json({ activity: merged.slice(0, 200) })
    } catch (err) {
        logger.error('listEmployerActivity error', { err })
        return res.status(500).json({ error: 'Failed to load employer activity' })
    }
}

export async function listPlacements(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId)
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })

        const { syncInstitutionPlacementsFromApplications } = await import('../services/institutionPlacementSync.js')
        await syncInstitutionPlacementsFromApplications(institutionId)

        // Prefer live applications (email-matched hire) then roster matched_to
        const { rows: appPlacements } = await query(
            `SELECT DISTINCT ON (lower(cc.email), jp.job_posting_id)
                    cc.id, cc.candidate_name, cc.department, cc.email, cc.row_status,
                    c.name AS cohort_name, c.programme,
                    coalesce(co.company_name, 'Employer') AS employer,
                    jp.job_title AS role,
                    a.application_id, jp.job_posting_id,
                    COALESCE(a.updated_at, a.created_at) AS placed_at,
                    CASE
                      WHEN upper(coalesce(a.interview_status::text,'')) = 'HIRED'
                        OR upper(coalesce(a.ai_status::text,'')) = 'HIRED' THEN 'placed'
                      ELSE 'interning'
                    END AS placement_type
             FROM cohort_candidates cc
             JOIN cohorts c ON c.id = cc.cohort_id
             JOIN applications a ON lower(a.email) = lower(cc.email)
             JOIN job_postings jp ON jp.job_posting_id = a.job_posting_id
             LEFT JOIN companies co ON co.company_id = COALESCE(a.company_id, jp.company_id)
             WHERE c.institution_id = $1
               AND (
                 upper(coalesce(a.interview_status::text,'')) = 'HIRED'
                 OR upper(coalesce(a.ai_status::text,'')) IN ('HIRED','OFFER')
               )
             ORDER BY lower(cc.email), jp.job_posting_id, COALESCE(a.updated_at, a.created_at) DESC`,
            [institutionId]
        )

        const { rows } = await query(
            `SELECT cc.id, cc.candidate_name, cc.department, cc.email, cc.matched_to, cc.row_status,
                    cc.last_activity, c.name AS cohort_name, c.programme
             FROM cohort_candidates cc
             JOIN cohorts c ON c.id = cc.cohort_id
             WHERE c.institution_id = $1
               AND cc.row_status IN ('placed','interning')
             ORDER BY cc.last_activity DESC NULLS LAST`,
            [institutionId]
        )

        const fromApps = appPlacements.map((r: any) => ({
            id: `app-${r.application_id || r.id}`,
            student_name: r.candidate_name,
            student_email: r.email,
            department: r.department,
            employer: r.employer,
            role: r.role,
            placement_type: r.placement_type,
            placed_at: r.placed_at,
            cohort_name: r.cohort_name,
            programme: r.programme,
            application_id: r.application_id,
            job_posting_id: r.job_posting_id,
            source: 'application',
        }))

        const seenEmails = new Set(fromApps.map((p: any) => String(p.student_email || '').toLowerCase()))
        const fromRoster = rows
            .filter((r: any) => !seenEmails.has(String(r.email || '').toLowerCase()))
            .map((r: any) => {
                const parts = String(r.matched_to || '').split(/-|-/)
                return {
                    id: r.id,
                    student_name: r.candidate_name,
                    student_email: r.email,
                    department: r.department,
                    employer: parts[0]?.trim() || 'Employer',
                    role: parts.slice(1).join(' - ').trim() || (r.row_status === 'interning' ? 'Internship' : 'Role'),
                    placement_type: r.row_status,
                    placed_at: r.last_activity,
                    cohort_name: r.cohort_name,
                    programme: r.programme,
                    application_id: null,
                    job_posting_id: null,
                    source: 'roster',
                }
            })

        const placements = [...fromApps, ...fromRoster]
        return res.json({ placements, total: placements.length })
    } catch (err) {
        logger.error('listPlacements error', { err })
        return res.status(500).json({ error: 'Failed to load placements' })
    }
}

export async function getReportsSummary(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId)
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })

        const { rows: byDept } = await query(
            `SELECT COALESCE(NULLIF(TRIM(cc.department),''),'Unspecified') AS department,
                    COUNT(*)::int AS students,
                    COUNT(*) FILTER (WHERE cc.row_status IN ('placed','interning'))::int AS placed,
                    COUNT(*) FILTER (WHERE cc.row_status IN ('shortlisted','interviewing'))::int AS in_pipeline
             FROM cohort_candidates cc
             JOIN cohorts c ON c.id = cc.cohort_id
             WHERE c.institution_id = $1
             GROUP BY 1 ORDER BY students DESC`,
            [institutionId]
        )
        const { rows: byCohort } = await query(
            `SELECT c.id, c.name, c.programme, c.academic_level,
                    COUNT(cc.id)::int AS students,
                    COUNT(cc.id) FILTER (WHERE cc.row_status IN ('placed','interning'))::int AS placed
             FROM cohorts c
             LEFT JOIN cohort_candidates cc ON cc.cohort_id = c.id
             WHERE c.institution_id = $1
             GROUP BY c.id ORDER BY c.created_at DESC`,
            [institutionId]
        )
        return res.json({ by_department: byDept, by_cohort: byCohort, generated_at: new Date().toISOString() })
    } catch (err) {
        logger.error('getReportsSummary error', { err })
        return res.status(500).json({ error: 'Failed to load report summary' })
    }
}

export async function listOnboardingSessions(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId)
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })

        try {
            const { rows } = await query(
                `SELECT * FROM institution_onboarding_sessions
                 WHERE institution_id = $1
                 ORDER BY scheduled_at DESC`,
                [institutionId]
            )
            return res.json({ sessions: rows })
        } catch {
            const { rows } = await query(
                `SELECT cu.id, cu.created_at AS scheduled_at, cu.row_count AS expected_count,
                        cu.valid_rows AS onboarded_count, cu.status, c.name AS department,
                        cu.original_filename, 'Bulk upload' AS facilitator
                 FROM cohort_uploads cu
                 JOIN cohorts c ON c.id = cu.cohort_id
                 WHERE c.institution_id = $1
                 ORDER BY cu.created_at DESC`,
                [institutionId]
            )
            return res.json({ sessions: rows })
        }
    } catch (err) {
        logger.error('listOnboardingSessions error', { err })
        return res.status(500).json({ error: 'Failed to load onboarding sessions' })
    }
}

export async function requestOnboardingSession(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId, ['owner', 'roster_manager'])
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })

        const { preferred_date, department, expected_count, notes } = req.body || {}
        if (!preferred_date) return res.status(400).json({ error: 'preferred_date required' })

        try {
            const { rows } = await query(
                `INSERT INTO institution_onboarding_sessions
                   (institution_id, scheduled_at, department, expected_count, status, facilitator, notes)
                 VALUES ($1, $2, $3, $4, 'scheduled', 'Pending OptioHire facilitator', $5)
                 RETURNING *`,
                [institutionId, preferred_date, department || null, Number(expected_count) || 0, notes || null]
            )
            const { fanOutInstitutionRequestToAdmin } = await import('../services/institutionAdminFanout.js')
            await fanOutInstitutionRequestToAdmin({
                institutionId,
                userId: req.userId,
                userEmail: req.userEmail,
                requestType: 'onboarding_session',
                subject: `Onboarding session - ${department || 'All departments'}`,
                message: [
                    `Preferred date: ${preferred_date}`,
                    `Expected students: ${Number(expected_count) || 0}`,
                    notes ? `Notes: ${notes}` : '',
                ].filter(Boolean).join('\n'),
                referenceId: rows[0].id,
                meta: { department, expected_count: Number(expected_count) || 0, preferred_date },
            })
            return res.status(201).json({ session: rows[0] })
        } catch (e: any) {
            // Ensure table then retry once
            await query(`
              CREATE TABLE IF NOT EXISTS institution_onboarding_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
                scheduled_at TIMESTAMPTZ NOT NULL,
                department TEXT,
                expected_count INT DEFAULT 0,
                status TEXT DEFAULT 'scheduled',
                facilitator TEXT,
                notes TEXT,
                created_at TIMESTAMPTZ DEFAULT now()
              )`)
            const { rows } = await query(
                `INSERT INTO institution_onboarding_sessions
                   (institution_id, scheduled_at, department, expected_count, status, facilitator, notes)
                 VALUES ($1, $2, $3, $4, 'scheduled', 'Pending OptioHire facilitator', $5)
                 RETURNING *`,
                [institutionId, preferred_date, department || null, Number(expected_count) || 0, notes || null]
            )
            const { fanOutInstitutionRequestToAdmin } = await import('../services/institutionAdminFanout.js')
            await fanOutInstitutionRequestToAdmin({
                institutionId,
                userId: req.userId,
                userEmail: req.userEmail,
                requestType: 'onboarding_session',
                subject: `Onboarding session - ${department || 'All departments'}`,
                message: [
                    `Preferred date: ${preferred_date}`,
                    `Expected students: ${Number(expected_count) || 0}`,
                    notes ? `Notes: ${notes}` : '',
                ].filter(Boolean).join('\n'),
                referenceId: rows[0].id,
                meta: { department, expected_count: Number(expected_count) || 0, preferred_date },
            })
            return res.status(201).json({ session: rows[0] })
        }
    } catch (err) {
        logger.error('requestOnboardingSession error', { err })
        return res.status(500).json({ error: 'Failed to request onboarding session' })
    }
}

export async function listAnnouncements(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId)
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })

        req.query.audience = 'institution'
        req.query.institution_id = institutionId
        const { listPlatformAnnouncements } = await import('./announcementsController.js')
        return listPlatformAnnouncements(req, res)
    } catch (err) {
        logger.error('listAnnouncements error', { err })
        return res.status(500).json({ error: 'Failed to load announcements' })
    }
}

export async function listSupportTickets(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId)
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })
        try {
            await query(`
              CREATE TABLE IF NOT EXISTS institution_support_tickets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
                created_by UUID,
                subject TEXT NOT NULL,
                message TEXT NOT NULL,
                status TEXT DEFAULT 'open',
                created_at TIMESTAMPTZ DEFAULT now()
              )`)
            const { rows } = await query(
                `SELECT * FROM institution_support_tickets WHERE institution_id = $1 ORDER BY created_at DESC`,
                [institutionId]
            )
            return res.json({ tickets: rows, response_sla: 'Within 1 business day' })
        } catch (e: any) {
            return res.json({ tickets: [], response_sla: 'Within 1 business day' })
        }
    } catch (err) {
        logger.error('listSupportTickets error', { err })
        return res.status(500).json({ error: 'Failed to load support tickets' })
    }
}

export async function createSupportTicket(req: AuthRequest, res: Response) {
    try {
        const { id: institutionId } = req.params
        const role = await ensureAdminAccess(req.userId!, institutionId)
        if (!role && req.userRole !== 'admin') return res.status(403).json({ error: 'Access denied' })
        const { subject, message } = req.body || {}
        if (!subject || !message) return res.status(400).json({ error: 'subject and message required' })

        await query(`
          CREATE TABLE IF NOT EXISTS institution_support_tickets (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
            created_by UUID,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'open',
            created_at TIMESTAMPTZ DEFAULT now()
          )`)
        const { rows } = await query(
            `INSERT INTO institution_support_tickets (institution_id, created_by, subject, message)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [institutionId, req.userId, subject, message]
        )

        const { fanOutInstitutionRequestToAdmin } = await import('../services/institutionAdminFanout.js')
        await fanOutInstitutionRequestToAdmin({
            institutionId,
            userId: req.userId,
            userEmail: req.userEmail,
            requestType: 'support',
            subject,
            message,
            referenceId: rows[0].id,
        })

        return res.status(201).json({ ticket: rows[0], response_sla: 'Within 1 business day' })
    } catch (err) {
        logger.error('createSupportTicket error', { err })
        return res.status(500).json({ error: 'Failed to create support ticket' })
    }
}
