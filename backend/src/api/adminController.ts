import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { query } from '../db/index.js'
import type { AuthRequest } from '../middleware/auth.js'
import { logAdminAction } from '../utils/adminLogger.js'
import { logger } from '../utils/logger.js'

const SALT_ROUNDS = 12

// ============================================================================
// USERS MANAGEMENT
// ============================================================================

export async function getAllUsers(req: Request, res: Response) {
  try {
    const { page = '1', limit = '50', search = '' } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let whereClause = ''
    const params: any[] = [Number(limit), offset]
    
    if (search) {
      whereClause = `WHERE email ILIKE $3`
      params.push(`%${search}%`)
    }

    // Check which columns exist
    const { rows: colCheck } = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('admin_approval_status', 'admin_permissions', 'username', 'name', 'company_role')
    `)
    
    const hasApprovalStatus = colCheck.some((r: any) => r.column_name === 'admin_approval_status')
    const hasPermissions = colCheck.some((r: any) => r.column_name === 'admin_permissions')
    const hasUsername = colCheck.some((r: any) => r.column_name === 'username')
    const hasName = colCheck.some((r: any) => r.column_name === 'name')
    const hasCompanyRole = colCheck.some((r: any) => r.column_name === 'company_role')
    
    // Admin can see passwords (password_hash) - this is for admin dashboard
    const selectFields = [
      'user_id',
      'email',
      'password_hash', // Admin can see passwords
      'role',
      hasUsername ? 'username' : 'NULL::text as username',
      hasName ? 'name' : 'NULL::text as name',
      hasCompanyRole ? 'company_role' : 'NULL::text as company_role',
      'is_active',
      'created_at',
      hasApprovalStatus ? 'admin_approval_status' : 'NULL::text as admin_approval_status',
      hasPermissions ? 'admin_permissions' : 'NULL::jsonb as admin_permissions'
    ].join(', ')

    const { rows: users } = await query<{
      user_id: string
      email: string
      password_hash: string
      role: string
      username?: string | null
      name?: string | null
      company_role?: string | null
      is_active: boolean
      created_at: string
      admin_approval_status?: string | null
      admin_permissions?: Record<string, boolean> | null
    }>(
      `SELECT ${selectFields}
       FROM users 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      params
    )

    type CompanyRow = {
      company_id: string
      company_name: string
      company_email: string
      hr_email: string
      hiring_manager_email: string
      user_id: string | null
    }

    const byUserId = new Map<string, CompanyRow>()
    const byEmail = new Map<string, CompanyRow>()
    if (users.length > 0) {
      try {
        const userIds = users.map((u) => u.user_id)
        const emails = [...new Set(users.map((u) => u.email.toLowerCase()))]
        const { rows: companyRows } = await query<CompanyRow>(
          `SELECT company_id, company_name, company_email, hr_email, hiring_manager_email, user_id
           FROM companies 
           WHERE user_id::text = ANY($1::text[])
              OR LOWER(hr_email) = ANY($2::text[])
              OR LOWER(company_email) = ANY($2::text[])`,
          [userIds, emails]
        )
        for (const c of companyRows) {
          if (c.user_id) {
            const k = String(c.user_id)
            if (!byUserId.has(k)) byUserId.set(k, c)
          }
          if (c.hr_email) {
            const k = c.hr_email.toLowerCase()
            if (!byEmail.has(k)) byEmail.set(k, c)
          }
          if (c.company_email) {
            const k = c.company_email.toLowerCase()
            if (!byEmail.has(k)) byEmail.set(k, c)
          }
        }
      } catch (err) {
        console.error('Error batch-loading companies for admin user list:', err)
      }
    }

    const usersWithCompanies = users.map((user) => {
      const uid = String(user.user_id)
      const em = user.email.toLowerCase()
      const companyInfo =
        byUserId.get(uid) || byEmail.get(em) || null
      return {
        ...user,
        company: companyInfo,
      }
    })

    const { rows: countRows } = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM users ${whereClause}`,
      search ? [params[2]] : []
    )

    return res.json({
      users: usersWithCompanies,
      total: Number(countRows[0].count),
      page: Number(page),
      limit: Number(limit)
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch users' })
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const { userId } = req.params

    // Check which columns exist
    const { rows: colCheck } = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('username', 'name', 'company_role')
    `)
    
    const hasUsername = colCheck.some((r: any) => r.column_name === 'username')
    const hasName = colCheck.some((r: any) => r.column_name === 'name')
    const hasCompanyRole = colCheck.some((r: any) => r.column_name === 'company_role')
    
    const selectFields = [
      'user_id',
      'email',
      'role',
      hasUsername ? 'username' : 'NULL::text as username',
      hasName ? 'name' : 'NULL::text as name',
      hasCompanyRole ? 'company_role' : 'NULL::text as company_role',
      'is_active',
      'created_at'
    ].join(', ')

    const { rows: userRows } = await query<{
      user_id: string
      email: string
      role: string
      username?: string | null
      name?: string | null
      company_role?: string | null
      is_active: boolean
      created_at: string
    }>(
      `SELECT ${selectFields}
       FROM users 
       WHERE user_id = $1`,
      [userId]
    )

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = userRows[0]

    // Get company info
    let companyInfo = null
    try {
      const { rows: companyRows } = await query<{
        company_id: string
        company_name: string
        company_email: string
        hr_email: string
        hiring_manager_email: string
      }>(
        `SELECT company_id, company_name, company_email, hr_email, hiring_manager_email 
         FROM companies 
         WHERE user_id = $1 OR hr_email = $2 OR company_email = $2 
         LIMIT 1`,
        [user.user_id, user.email]
      )
      if (companyRows.length > 0) {
        companyInfo = companyRows[0]
      }
    } catch (err) {
      console.error('Error fetching company for user:', user.user_id, err)
    }

    return res.json({
      ...user,
      company: companyInfo
    })
  } catch (err) {
    console.error('Error fetching user:', err)
    return res.status(500).json({ error: 'Failed to fetch user' })
  }
}

export async function getUserStats(req: Request, res: Response) {
  try {
    const { userId } = req.params

    // Get company_id for the user
    const { rows: companyRows } = await query<{ company_id: string }>(
      `SELECT company_id FROM companies 
       WHERE user_id = $1 OR hr_email = (SELECT email FROM users WHERE user_id = $1) 
       OR company_email = (SELECT email FROM users WHERE user_id = $1)
       LIMIT 1`,
      [userId]
    )

    const companyId = companyRows.length > 0 ? companyRows[0].company_id : null

    // If no company found, return zeros
    if (!companyId) {
      return res.json({
        job_posts_count: 0,
        applicants_count: 0,
        interviews_count: 0,
        meetings_count: 0
      })
    }

    // Get job posts count
    const { rows: jobCountRows } = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM job_postings WHERE company_id = $1`,
      [companyId]
    )
    const job_posts_count = Number(jobCountRows[0]?.count || 0)

    // Get applicants count (all applications for jobs from this company)
    const { rows: applicantCountRows } = await query<{ count: string }>(
      `SELECT COUNT(*) as count 
       FROM applications a
       JOIN job_postings jp ON a.job_posting_id = jp.job_posting_id
       WHERE jp.company_id = $1`,
      [companyId]
    )
    const applicants_count = Number(applicantCountRows[0]?.count || 0)

    // Get interviews count (applications with interview_time set)
    const { rows: interviewCountRows } = await query<{ count: string }>(
      `SELECT COUNT(*) as count 
       FROM applications a
       JOIN job_postings jp ON a.job_posting_id = jp.job_posting_id
       WHERE jp.company_id = $1 AND a.interview_time IS NOT NULL`,
      [companyId]
    )
    const interviews_count = Number(interviewCountRows[0]?.count || 0)

    // Get meetings count (applications with interview_link set)
    const { rows: meetingCountRows } = await query<{ count: string }>(
      `SELECT COUNT(*) as count 
       FROM applications a
       JOIN job_postings jp ON a.job_posting_id = jp.job_posting_id
       WHERE jp.company_id = $1 AND a.interview_link IS NOT NULL`,
      [companyId]
    )
    const meetings_count = Number(meetingCountRows[0]?.count || 0)

    return res.json({
      job_posts_count,
      applicants_count,
      interviews_count,
      meetings_count
    })
  } catch (err) {
    console.error('Error fetching user stats:', err)
    return res.status(500).json({ error: 'Failed to fetch user statistics' })
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { userId } = req.params
    const { role, is_active, admin_permissions } = req.body
    const authReq = req as AuthRequest
    const currentUserId = authReq.userId

    // STRICT: Prevent admin from deactivating themselves
    if (currentUserId === userId && is_active === false) {
      return res.status(403).json({ error: 'You cannot deactivate your own account' })
    }

    // STRICT: Prevent admin from removing their own admin role
    if (currentUserId === userId && role && role !== 'admin') {
      return res.status(403).json({ error: 'You cannot remove your own admin role' })
    }

    // If promoting to admin, require approval (set admin_approval_status to 'pending')
    if (role === 'admin') {
      const { rows: userRows } = await query<{ role: string }>(
        `SELECT role FROM users WHERE user_id = $1`,
        [userId]
      )
      
      if (userRows.length === 0) {
        return res.status(404).json({ error: 'User not found' })
      }

      // If user is not already admin, set approval status to pending
      if (userRows[0].role !== 'admin') {
        const updates: string[] = []
        const params: any[] = []
        let paramIndex = 1

        updates.push(`role = $${paramIndex++}`)
        params.push('admin')
        
        // Check if admin_approval_status column exists
        const { rows: colCheck } = await query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'admin_approval_status'
        `)
        
        if (colCheck.length > 0) {
          updates.push(`admin_approval_status = $${paramIndex++}`)
          params.push('pending')
        }

        // Check if admin_permissions column exists
        const { rows: permCheck } = await query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'admin_permissions'
        `)
        
        if (permCheck.length > 0 && admin_permissions) {
          updates.push(`admin_permissions = $${paramIndex++}::jsonb`)
          params.push(JSON.stringify(admin_permissions))
        }

        updates.push(`updated_at = now()`)
        params.push(userId)

        await query(
          `UPDATE users SET ${updates.join(', ')} WHERE user_id = $${paramIndex}`,
          params
        )

        return res.json({ 
          success: true, 
          message: 'Admin role assigned. Approval required.',
          requires_approval: true 
        })
      }
    }

    const updates: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (role !== undefined) {
      updates.push(`role = $${paramIndex++}`)
      params.push(role)
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`)
      params.push(is_active)
    }

    // Handle admin_permissions if provided
    if (admin_permissions !== undefined) {
      const { rows: permCheck } = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'admin_permissions'
      `)
      
      if (permCheck.length > 0) {
        updates.push(`admin_permissions = $${paramIndex++}::jsonb`)
        params.push(JSON.stringify(admin_permissions))
      }
    }

    // Handle admin_approval_status if provided (for approving/rejecting admin requests)
    if (req.body.admin_approval_status !== undefined) {
      const { rows: statusCheck } = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'admin_approval_status'
      `)
      
      if (statusCheck.length > 0) {
        updates.push(`admin_approval_status = $${paramIndex++}`)
        params.push(req.body.admin_approval_status)
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    updates.push(`updated_at = now()`)
    params.push(userId)

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE user_id = $${paramIndex}`,
      params
    )

    // Log admin action
    await logAdminAction(req, 'update_user', 'user', userId, { role, is_active, admin_permissions })

    return res.json({ success: true })
  } catch (err) {
    console.error('Update user error:', err)
    return res.status(500).json({ error: 'Failed to update user' })
  }
}

/**
 * Admin reset user password. Sets password_hash for the given user.
 * Body: { newPassword: string } (min 8 chars recommended).
 */
export async function resetUserPassword(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params
    const { newPassword } = req.body as { newPassword?: string }

    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'newPassword is required' })
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    const { rows } = await query<{ user_id: string }>(
      `SELECT user_id FROM users WHERE user_id = $1`,
      [userId]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS)
    await query(
      `UPDATE users SET password_hash = $1, updated_at = now() WHERE user_id = $2`,
      [password_hash, userId]
    )

    await logAdminAction(req, 'reset_password', 'user', userId, {})
    return res.json({ success: true, message: 'Password reset successfully' })
  } catch (err) {
    console.error('Reset password error:', err)
    return res.status(500).json({ error: 'Failed to reset password' })
  }
}

export async function getUserActivity(req: Request, res: Response) {
  try {
    const { userId } = req.params
    const { limit = '100' } = req.query

    const { rows } = await query(
      `SELECT tt.*, u.email as user_email, u.name as user_name
       FROM time_tracking tt
       LEFT JOIN users u ON u.user_id = tt.user_id
       WHERE tt.user_id = $1
       ORDER BY tt.created_at DESC
       LIMIT $2`,
      [userId, Number(limit)]
    )

    return res.json({ activities: rows })
  } catch (err) {
    console.error('Get user activity error:', err)
    return res.status(500).json({ error: 'Failed to fetch user activity' })
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params
    const authReq = req as AuthRequest
    const currentUserId = authReq.userId

    // STRICT: Prevent admin from deleting themselves
    if (currentUserId === userId) {
      return res.status(403).json({ error: 'You cannot delete your own account' })
    }

    // Check if user being deleted is an admin
    const { rows: userRows } = await query<{ role: string }>(
      `SELECT role FROM users WHERE user_id = $1`,
      [userId]
    )

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Prevent deleting the last admin
    if (userRows[0].role === 'admin') {
      const { rows: adminCount } = await query<{ count: string }>(
        `SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND is_active = true`
      )
      if (Number(adminCount[0].count) <= 1) {
        return res.status(403).json({ error: 'Cannot delete the last active admin' })
      }
    }

    await query(`DELETE FROM users WHERE user_id = $1`, [userId])
    
    // Log admin action
    await logAdminAction(req, 'delete_user', 'user', userId, {})

    return res.json({ success: true })
  } catch (err) {
    console.error('Delete user error:', err)
    return res.status(500).json({ error: 'Failed to delete user' })
  }
}

// ============================================================================
// COMPANIES MANAGEMENT
// ============================================================================

export async function getAllCompanies(req: Request, res: Response) {
  try {
    const { page = '1', limit = '50', search = '' } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let whereClause = ''
    const params: any[] = [Number(limit), offset]
    
    if (search) {
      whereClause = `WHERE company_name ILIKE $3 OR company_domain ILIKE $3 OR hr_email ILIKE $3`
      params.push(`%${search}%`)
    }

    const { rows: companies } = await query(
      `SELECT c.company_id, c.company_name, c.company_email, c.hr_email, 
              c.hiring_manager_email, c.company_domain, c.settings, 
              c.created_at, c.updated_at,
              (SELECT COUNT(*)::int FROM job_postings jp WHERE jp.company_id = c.company_id) AS jobs_count,
              (SELECT COUNT(*)::int FROM applications a WHERE a.company_id = c.company_id) AS applications_count
       FROM companies c
       ${whereClause.replace(/company_name|company_domain|hr_email/g, 'c.$&')}
       ORDER BY c.created_at DESC 
       LIMIT $1 OFFSET $2`,
      params
    )

    const countWhere = search ? whereClause.replace(/\$3/g, '$1') : whereClause
    const { rows: countRows } = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM companies ${countWhere}`,
      search ? [params[2]] : []
    )

    return res.json({
      companies,
      total: Number(countRows[0].count),
      page: Number(page),
      limit: Number(limit)
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch companies' })
  }
}

export async function getCompanyDetails(req: Request, res: Response) {
  try {
    const { companyId } = req.params

    const { rows: companies } = await query(
      `SELECT * FROM companies WHERE company_id = $1`,
      [companyId]
    )

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' })
    }

    // Get job postings count
    const { rows: jobCount } = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM job_postings WHERE company_id = $1`,
      [companyId]
    )

    // Get applications count
    const { rows: appCount } = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM applications WHERE company_id = $1`,
      [companyId]
    )

    return res.json({
      company: companies[0],
      stats: {
        job_postings: Number(jobCount[0].count),
        applications: Number(appCount[0].count)
      }
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch company details' })
  }
}

export async function updateCompany(req: Request, res: Response) {
  try {
    const { companyId } = req.params
    const { company_name, company_email, hr_email, hiring_manager_email, company_domain, settings } = req.body

    const updates: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (company_name !== undefined) {
      updates.push(`company_name = $${paramIndex++}`)
      params.push(company_name)
    }
    if (company_email !== undefined) {
      updates.push(`company_email = $${paramIndex++}`)
      params.push(company_email)
    }
    if (hr_email !== undefined) {
      updates.push(`hr_email = $${paramIndex++}`)
      params.push(hr_email)
    }
    if (hiring_manager_email !== undefined) {
      updates.push(`hiring_manager_email = $${paramIndex++}`)
      params.push(hiring_manager_email)
    }
    if (company_domain !== undefined) {
      updates.push(`company_domain = $${paramIndex++}`)
      params.push(company_domain)
    }
    if (settings !== undefined) {
      updates.push(`settings = $${paramIndex++}::jsonb`)
      params.push(JSON.stringify(settings))
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    updates.push(`updated_at = now()`)
    params.push(companyId)

    await query(
      `UPDATE companies SET ${updates.join(', ')} WHERE company_id = $${paramIndex}`,
      params
    )

    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update company' })
  }
}

export async function deleteCompany(req: Request, res: Response) {
  try {
    const { companyId } = req.params
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' })
    }

    console.log(`[Delete Company] Attempting to delete company with ID: ${companyId}`)

    // Check if company exists first
    // Cast parameter to UUID (PostgreSQL will handle invalid UUID format gracefully)
    const { rows: existingCompanies } = await query<{ company_id: string; company_name: string }>(
      `SELECT company_id, company_name FROM companies WHERE company_id = $1::uuid`,
      [companyId]
    )

    console.log(`[Delete Company] Found ${existingCompanies.length} matching company(ies) for ID: ${companyId}`)

    if (existingCompanies.length === 0) {
      console.log(`[Delete Company] Company not found: ${companyId}`)
      return res.status(404).json({ error: 'Company not found', companyId })
    }

    const companyName = existingCompanies[0].company_name

    // Delete the company (cascade will handle related records like jobs and applications)
    const { rowCount } = await query(
      `DELETE FROM companies WHERE company_id = $1::uuid`,
      [companyId]
    )

    console.log(`[Delete Company] Deleted ${rowCount} row(s) for company ID: ${companyId} (${companyName})`)

    if (rowCount === 0) {
      console.log(`[Delete Company] No rows deleted (company may have been already deleted): ${companyId}`)
      return res.status(404).json({ error: 'Company not found or already deleted', companyId })
    }

    // Log admin action
    const authReq = req as AuthRequest
    if (authReq.userId) {
      try {
        await logAdminAction(authReq, 'delete_company', 'company', companyId, { companyName })
      } catch (logErr) {
        console.error('[Delete Company] Failed to log admin action:', logErr)
        // Don't fail the delete if logging fails
      }
    }

    return res.json({ success: true, message: 'Company deleted successfully', companyId, companyName })
  } catch (err) {
    console.error('[Delete Company] Error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: 'Failed to delete company', details: errorMessage })
  }
}

// ============================================================================
// JOB POSTINGS MANAGEMENT
// ============================================================================

export async function getAllJobPostings(req: Request, res: Response) {
  try {
    const { page = '1', limit = '50', search = '', status = '', company_id = '' } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const conditions: string[] = []
    const params: any[] = [Number(limit), offset]
    let paramIndex = 3

    if (search) {
      conditions.push(`(job_title ILIKE $${paramIndex} OR job_description ILIKE $${paramIndex})`)
      params.push(`%${search}%`)
      paramIndex++
    }
    if (status) {
      conditions.push(`status = $${paramIndex++}`)
      params.push(status)
    }
    if (company_id) {
      conditions.push(`company_id = $${paramIndex++}`)
      params.push(company_id)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const { rows: jobs } = await query(
      `SELECT jp.*, c.company_name, c.company_domain
       FROM job_postings jp
       LEFT JOIN companies c ON jp.company_id = c.company_id
       ${whereClause}
       ORDER BY jp.created_at DESC 
       LIMIT $1 OFFSET $2`,
      params
    )

    const { rows: countRows } = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM job_postings ${whereClause}`,
      params.slice(2)
    )

    return res.json({
      jobs,
      total: Number(countRows[0].count),
      page: Number(page),
      limit: Number(limit)
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch job postings' })
  }
}

export async function resendJobCreationEmail(req: Request, res: Response) {
  try {
    const { jobId } = req.params
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' })
    }

    console.log(`[Resend Email] Resending job creation email for job ID: ${jobId}`)

    // Get job posting details with company info
    const { rows: jobRows } = await query<{
      job_posting_id: string
      job_title: string
      application_deadline: string | null
      company_id: string
      company_name: string
      company_email: string
      hr_email: string
      hiring_manager_email: string | null
    }>(
      `SELECT 
        jp.job_posting_id,
        jp.job_title,
        jp.application_deadline,
        c.company_id,
        c.company_name,
        c.company_email,
        c.hr_email,
        c.hiring_manager_email
      FROM job_postings jp
      JOIN companies c ON jp.company_id = c.company_id
      WHERE jp.job_posting_id = $1::uuid`,
      [jobId]
    )

    if (jobRows.length === 0) {
      return res.status(404).json({ error: 'Job posting not found', jobId })
    }

    const job = jobRows[0]

    // Collect all recipients: company emails + users associated with the company
    const recipients = new Set<string>()
    
    // Add company emails
    if (job.hr_email && job.hr_email.includes('@')) {
      recipients.add(job.hr_email)
    }
    if (job.company_email && job.company_email.includes('@')) {
      recipients.add(job.company_email)
    }
    if (job.hiring_manager_email && job.hiring_manager_email.includes('@')) {
      recipients.add(job.hiring_manager_email)
    }

    // Get users associated with this company
    try {
      // Check if user_id column exists
      const { rows: colCheck } = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'user_id'
      `)

      if (colCheck.length > 0) {
        // Get users by user_id
        const { rows: userRows } = await query<{ email: string }>(
          `SELECT DISTINCT u.email
           FROM users u
           JOIN companies c ON c.user_id = u.user_id
           WHERE c.company_id = $1::uuid AND u.is_active = true`,
          [job.company_id]
        )
        userRows.forEach(user => {
          if (user.email && user.email.includes('@')) {
            recipients.add(user.email)
          }
        })
      }

      // Also get users by email match (hr_email or company_email)
      const { rows: emailMatchUsers } = await query<{ email: string }>(
        `SELECT DISTINCT u.email
         FROM users u
         JOIN companies c ON (c.hr_email = u.email OR c.company_email = u.email)
         WHERE c.company_id = $1::uuid AND u.is_active = true`,
        [job.company_id]
      )
      emailMatchUsers.forEach(user => {
        if (user.email && user.email.includes('@')) {
          recipients.add(user.email)
        }
      })
    } catch (userErr) {
      console.error('[Resend Email] Error fetching users:', userErr)
      // Continue even if user fetch fails
    }

    const recipientList = Array.from(recipients)

    if (recipientList.length === 0) {
      return res.status(400).json({ 
        error: 'No valid email recipients found',
        details: 'No active users or company emails found for this job'
      })
    }

    console.log(`[Resend Email] Sending to ${recipientList.length} recipient(s): ${recipientList.join(', ')}`)

    // Send email using the email service
    const emailService = new (await import('../services/emailService.js')).EmailService()
    
    await emailService.sendJobPostingCreatedEmail({
      recipients: recipientList,
      jobTitle: job.job_title,
      companyName: job.company_name,
      applicationDeadline: job.application_deadline || new Date().toISOString()
    })

    // Log admin action
    const authReq = req as AuthRequest
    if (authReq.userId) {
      try {
        await logAdminAction(authReq, 'resend_job_creation_email', 'job_posting', jobId, {
          jobTitle: job.job_title,
          companyName: job.company_name,
          recipients: recipientList
        })
      } catch (logErr) {
        console.error('[Resend Email] Failed to log admin action:', logErr)
      }
    }

    console.log(`[Resend Email] ✅ Email sent successfully to: ${recipientList.join(', ')}`)

    return res.json({ 
      success: true, 
      message: 'Job creation email sent successfully',
      recipients: recipientList,
      jobTitle: job.job_title,
      companyName: job.company_name
    })
  } catch (err) {
    console.error('[Resend Email] Error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ 
      error: 'Failed to resend job creation email', 
      details: errorMessage 
    })
  }
}

export async function deleteJobPosting(req: Request, res: Response) {
  try {
    const { jobId } = req.params
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' })
    }

    console.log(`[Delete Job] Attempting to delete job with ID: ${jobId}`)

    // Check if job exists first
    // Cast parameter to UUID (PostgreSQL will handle invalid UUID format gracefully)
    const { rows: existingJobs } = await query<{ job_posting_id: string }>(
      `SELECT job_posting_id FROM job_postings WHERE job_posting_id = $1::uuid`,
      [jobId]
    )

    console.log(`[Delete Job] Found ${existingJobs.length} matching job(s) for ID: ${jobId}`)

    if (existingJobs.length === 0) {
      console.log(`[Delete Job] Job not found: ${jobId}`)
      return res.status(404).json({ error: 'Job posting not found', jobId })
    }

    // Delete the job (cascade will handle related records)
    const { rowCount } = await query(
      `DELETE FROM job_postings WHERE job_posting_id = $1::uuid`,
      [jobId]
    )

    console.log(`[Delete Job] Deleted ${rowCount} row(s) for job ID: ${jobId}`)

    if (rowCount === 0) {
      console.log(`[Delete Job] No rows deleted (job may have been already deleted): ${jobId}`)
      return res.status(404).json({ error: 'Job posting not found or already deleted', jobId })
    }

    // Log admin action
    const authReq = req as AuthRequest
    if (authReq.userId) {
      try {
        await logAdminAction(authReq, 'delete_job_posting', 'job_posting', jobId, {})
      } catch (logErr) {
        console.error('[Delete Job] Failed to log admin action:', logErr)
        // Don't fail the delete if logging fails
      }
    }

    return res.json({ success: true, message: 'Job posting deleted successfully', jobId })
  } catch (err) {
    console.error('[Delete Job] Error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: 'Failed to delete job posting', details: errorMessage })
  }
}

// ============================================================================
// APPLICATIONS MANAGEMENT
// ============================================================================

export async function getAllApplications(req: Request, res: Response) {
  try {
    const { page = '1', limit = '50', search = '', job_id = '', company_id = '', ai_status = '' } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const conditions: string[] = []
    const params: any[] = [Number(limit), offset]
    let paramIndex = 3

    if (search) {
      conditions.push(`(a.candidate_name ILIKE $${paramIndex} OR a.email ILIKE $${paramIndex})`)
      params.push(`%${search}%`)
      paramIndex++
    }
    if (job_id) {
      conditions.push(`a.job_posting_id = $${paramIndex++}`)
      params.push(job_id)
    }
    if (company_id) {
      conditions.push(`a.company_id = $${paramIndex++}`)
      params.push(company_id)
    }
    if (ai_status) {
      conditions.push(`a.ai_status = $${paramIndex++}`)
      params.push(ai_status)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const { rows: applications } = await query(
      `SELECT a.*, jp.job_title, c.company_name
       FROM applications a
       LEFT JOIN job_postings jp ON a.job_posting_id = jp.job_posting_id
       LEFT JOIN companies c ON a.company_id = c.company_id
       ${whereClause}
       ORDER BY a.created_at DESC 
       LIMIT $1 OFFSET $2`,
      params
    )

    const { rows: countRows } = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM applications a ${whereClause}`,
      params.slice(2)
    )

    // Normalize ai_score to number (PostgreSQL numeric can be returned as string)
    const normalizedApplications = applications.map((app: any) => ({
      ...app,
      ai_score: app.ai_score !== null && app.ai_score !== undefined 
        ? (typeof app.ai_score === 'number' ? app.ai_score : Number(app.ai_score))
        : null
    }))

    return res.json({
      applications: normalizedApplications,
      total: Number(countRows[0].count),
      page: Number(page),
      limit: Number(limit)
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch applications' })
  }
}

export async function deleteApplication(req: Request, res: Response) {
  try {
    const { applicationId } = req.params
    await query(`DELETE FROM applications WHERE application_id = $1`, [applicationId])
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete application' })
  }
}

// ============================================================================
// SYSTEM STATISTICS
// ============================================================================

export async function getSystemStats(req: Request, res: Response) {
  try {
    const [
      { rows: userStats },
      { rows: companyStats },
      { rows: jobStats },
      { rows: applicationStats },
      { rows: reportStats }
    ] = await Promise.all([
      query<{ total: string; active: string; admins: string }>(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE is_active = true) as active,
          COUNT(*) FILTER (WHERE role = 'admin') as admins
         FROM users`
      ),
      query<{ count: string }>(`SELECT COUNT(*) as count FROM companies`),
      query<{ count: string; active: string }>(
        `SELECT 
          COUNT(*) as count,
          COUNT(*) FILTER (WHERE status = 'ACTIVE') as active
         FROM job_postings`
      ),
      query<{ count: string; shortlisted: string }>(
        `SELECT 
          COUNT(*) as count,
          COUNT(*) FILTER (WHERE ai_status = 'SHORTLIST') as shortlisted
         FROM applications`
      ),
      query<{ count: string }>(`SELECT COUNT(*) as count FROM reports`)
    ])

    return res.json({
      users: {
        total: Number(userStats[0].total),
        active: Number(userStats[0].active),
        admins: Number(userStats[0].admins)
      },
      companies: Number(companyStats[0].count),
      job_postings: {
        total: Number(jobStats[0].count),
        active: Number(jobStats[0].active)
      },
      applications: {
        total: Number(applicationStats[0].count),
        shortlisted: Number(applicationStats[0].shortlisted)
      },
      reports: Number(reportStats[0].count)
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch system stats' })
  }
}

export async function getAIAuditTrail(req: Request, res: Response) {
  try {
    const { page = '1', limit = '50', job_id = '', company_id = '' } = req.query
    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.min(200, Math.max(1, Number(limit) || 50))
    const offset = (pageNum - 1) * limitNum

    const conditions: string[] = []
    const params: any[] = []
    let i = 1

    if (job_id) {
      conditions.push(`a.job_posting_id = $${i++}`)
      params.push(job_id)
    }
    if (company_id) {
      conditions.push(`a.company_id = $${i++}`)
      params.push(company_id)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const { rows } = await query<{
      application_id: string
      created_at: string
      ai_score: number | null
      ai_status: string | null
      reasoning: string | null
      candidate_name: string | null
      email: string
      job_posting_id: string
      job_title: string | null
      company_id: string
      company_name: string | null
    }>(
      `SELECT
         a.application_id,
         a.created_at,
         a.ai_score,
         a.ai_status,
         a.reasoning,
         a.candidate_name,
         a.email,
         a.job_posting_id,
         jp.job_title,
         a.company_id,
         c.company_name
       FROM applications a
       LEFT JOIN job_postings jp ON jp.job_posting_id = a.job_posting_id
       LEFT JOIN companies c ON c.company_id = a.company_id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT $${i++} OFFSET $${i}`,
      [...params, limitNum, offset]
    )

    const { rows: countRows } = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM applications a ${whereClause}`,
      params
    )

    const sensitiveReasoningPattern =
      /\b(age|date of birth|dob|gender|male|female|nationality|ethnicity|race|religion|marital status|disability|photo|address)\b/i

    const audits = rows.map((row) => {
      const reasoning = row.reasoning || ''
      const mentionsSensitiveAttribute = sensitiveReasoningPattern.test(reasoning)
      const score = row.ai_score !== null && row.ai_score !== undefined ? Number(row.ai_score) : null
      const status = (row.ai_status || 'PENDING').toUpperCase()

      return {
        application_id: row.application_id,
        created_at: row.created_at,
        candidate: {
          name: row.candidate_name || null,
          email: row.email,
        },
        job: {
          job_posting_id: row.job_posting_id,
          title: row.job_title || null,
          company_id: row.company_id,
          company_name: row.company_name || null,
        },
        decision: {
          score,
          status,
          reasoning,
        },
        fairnessFlags: {
          reasoning_mentions_sensitive_attribute: mentionsSensitiveAttribute,
          borderline_decision:
            score !== null &&
            ((score >= 45 && score <= 55) || (score >= 75 && score <= 85)),
          missing_reasoning: reasoning.trim().length === 0,
        },
      }
    })

    return res.json({
      page: pageNum,
      limit: limitNum,
      total: Number(countRows[0]?.count || 0),
      audits,
    })
  } catch (err) {
    logger.error('Failed to fetch AI audit trail', err)
    return res.status(500).json({ error: 'Failed to fetch AI audit trail' })
  }
}

