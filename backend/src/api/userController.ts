import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import type { AuthRequest } from '../middleware/auth.js'
import { cache, cacheKeys } from '../utils/redis.js'

// Get current user profile
export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Try cache first
    const cacheKey = cacheKeys.user(userId)
    const cached = await cache.get(cacheKey)
    if (cached) {
      return res.json(cached)
    }

    // Check which columns exist
    const { rows: colCheck } = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('name', 'company_role')
    `)
    
    const hasNameColumn = colCheck.some((r: any) => r.column_name === 'name')
    const hasCompanyRoleColumn = colCheck.some((r: any) => r.column_name === 'company_role')
    
    const selectFields = [
      'user_id',
      'email',
      'role',
      'is_active',
      'created_at',
      'updated_at',
      'last_login_at',
      hasNameColumn ? 'name' : 'NULL::text as name',
      hasCompanyRoleColumn ? 'company_role' : 'NULL::text as company_role'
    ].join(', ')
    
    const { rows } = await query<{
      user_id: string
      email: string
      role: string
      is_active: boolean
      created_at: string
      updated_at: string | null
      last_login_at: string | null
      name?: string | null
      company_role?: string | null
    }>(
      `SELECT ${selectFields}
       FROM users 
       WHERE user_id = $1`,
      [userId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = rows[0]

    // STRICT: Check if user has a company (except admin)
    let hasCompany = false
    let companyId: string | null = null
    let companyName: string | null = null
    let companyEmail: string | null = null
    let hrEmail: string | null = null
    let hiringManagerEmail: string | null = null
    let companyLogoUrl: string | null = null
    let companyLocation: string | null = null
    let websiteUrl: string | null = null
    let linkedinUrl: string | null = null
    let twitterUrl: string | null = null
    
    if (user.role !== 'admin') {
      try {
        // Check if user_id column exists in companies table
        const checkColumn = await query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'companies' AND column_name = 'user_id'
        `)
        
        if (checkColumn.rows.length > 0) {
          // Determine if company_logo_url column exists
            let companySelectFields = 'company_id, company_name, company_email, hr_email, hiring_manager_email'
            try {
              const { rows: companyCols } = await query(
                `SELECT column_name 
                 FROM information_schema.columns 
                 WHERE table_name = 'companies' AND column_name IN ('company_logo_url', 'company_location', 'website_url', 'linkedin_url', 'twitter_url')`
              )
              const hasLogoColumn = companyCols.some((r: any) => r.column_name === 'company_logo_url')
              if (hasLogoColumn) companySelectFields += ', company_logo_url'
              const hasLocationColumn = companyCols.some((r: any) => r.column_name === 'company_location')
              if (hasLocationColumn) companySelectFields += ', company_location'
              const hasWebsiteColumn = companyCols.some((r: any) => r.column_name === 'website_url')
              if (hasWebsiteColumn) companySelectFields += ', website_url'
              const hasLinkedinColumn = companyCols.some((r: any) => r.column_name === 'linkedin_url')
              if (hasLinkedinColumn) companySelectFields += ', linkedin_url'
              const hasTwitterColumn = companyCols.some((r: any) => r.column_name === 'twitter_url')
              if (hasTwitterColumn) companySelectFields += ', twitter_url'
            } catch (e) {
              // If this check fails, continue without extra fields
            }

            // user_id column exists, check by user_id
            const companyCheck = await query<any>(
              `SELECT ${companySelectFields} FROM companies WHERE user_id = $1 LIMIT 1`,
              [userId]
            )
            hasCompany = companyCheck.rows.length > 0
            if (hasCompany) {
              companyId = companyCheck.rows[0]?.company_id || null
              companyName = companyCheck.rows[0]?.company_name || null
              companyEmail = companyCheck.rows[0]?.company_email || null
              hrEmail = companyCheck.rows[0]?.hr_email || null
              hiringManagerEmail = companyCheck.rows[0]?.hiring_manager_email || null
              companyLogoUrl = (companyCheck.rows[0] as any)?.company_logo_url || null
              companyLocation = (companyCheck.rows[0] as any)?.company_location || null
              websiteUrl = (companyCheck.rows[0] as any)?.website_url || null
              linkedinUrl = (companyCheck.rows[0] as any)?.linkedin_url || null
              twitterUrl = (companyCheck.rows[0] as any)?.twitter_url || null
            }
        } else {
          // Fallback: check by email (hr_email or company_email)
            let companySelectFields = 'company_id, company_name, company_email, hr_email, hiring_manager_email'
            try {
              const { rows: companyCols } = await query(
                `SELECT column_name 
                 FROM information_schema.columns 
                 WHERE table_name = 'companies' AND column_name IN ('company_logo_url', 'company_location', 'website_url', 'linkedin_url', 'twitter_url')`
              )
              const hasLogoColumn = companyCols.some((r: any) => r.column_name === 'company_logo_url')
              if (hasLogoColumn) companySelectFields += ', company_logo_url'
              const hasLocationColumn = companyCols.some((r: any) => r.column_name === 'company_location')
              if (hasLocationColumn) companySelectFields += ', company_location'
              const hasWebsiteColumn = companyCols.some((r: any) => r.column_name === 'website_url')
              if (hasWebsiteColumn) companySelectFields += ', website_url'
              const hasLinkedinColumn = companyCols.some((r: any) => r.column_name === 'linkedin_url')
              if (hasLinkedinColumn) companySelectFields += ', linkedin_url'
              const hasTwitterColumn = companyCols.some((r: any) => r.column_name === 'twitter_url')
              if (hasTwitterColumn) companySelectFields += ', twitter_url'
            } catch (e) {
              // Ignore extra fields if check fails
            }

            const companyCheck = await query<any>(
              `SELECT ${companySelectFields} FROM companies WHERE hr_email = $1 OR company_email = $1 LIMIT 1`,
              [user.email]
            )
            hasCompany = companyCheck.rows.length > 0
            if (hasCompany) {
              companyId = companyCheck.rows[0]?.company_id || null
              companyName = companyCheck.rows[0]?.company_name || null
              companyEmail = companyCheck.rows[0]?.company_email || null
              hrEmail = companyCheck.rows[0]?.hr_email || null
              hiringManagerEmail = companyCheck.rows[0]?.hiring_manager_email || null
              companyLogoUrl = (companyCheck.rows[0] as any)?.company_logo_url || null
              companyLocation = (companyCheck.rows[0] as any)?.company_location || null
              websiteUrl = (companyCheck.rows[0] as any)?.website_url || null
              linkedinUrl = (companyCheck.rows[0] as any)?.linkedin_url || null
              twitterUrl = (companyCheck.rows[0] as any)?.twitter_url || null
            }
        }
      } catch (err) {
        console.error('Error checking company:', err)
        // Strict enforcement: if check fails, assume no company
        hasCompany = false
      }
    } else {
      // Admin always has access
      hasCompany = true
    }

    // Job seekers never use employer company context in the app, even if a legacy company row exists.
    if (user.company_role === 'candidate') {
      hasCompany = false
      companyId = null
      companyName = null
      companyEmail = null
      hrEmail = null
      hiringManagerEmail = null
      companyLogoUrl = null
      companyLocation = null
      websiteUrl = null
      linkedinUrl = null
      twitterUrl = null
    }
    
    const userData = {
      id: user.user_id,
      user_id: user.user_id,
      name: user.name || null,
      email: user.email,
      role: user.role,
      company_role: user.company_role || null,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      previous_login_at: user.last_login_at,
      hasCompany,
      companyId,
      companyName,
      companyEmail,
      hrEmail,
      hiring_manager_email: hiringManagerEmail,
      companyLogoUrl,
      companyLocation,
      websiteUrl,
      linkedinUrl,
      twitterUrl
    }

    await cache.set(cacheKey, userData, 300)
    return res.json(userData)
  } catch (err) {
    console.error('Get current user error:', err)
    return res.status(500).json({ error: 'Failed to fetch user profile' })
  }
}

// Update user's company details
export async function updateUserCompany(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { company_name, company_email, hr_email, company_logo_url, company_location, website_url, linkedin_url, twitter_url } = req.body || {}

    if (!company_name || !company_email || !hr_email) {
      return res.status(400).json({ error: 'Company name, company email, and HR email are required' })
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(company_email) || !emailRegex.test(hr_email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Find user's company
    let companyId: string | null = null
    
    // Check if user_id column exists
    const checkColumn = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'companies' AND column_name = 'user_id'
    `)
    
    const hasUserIdColumn = checkColumn.rows.length > 0

    if (hasUserIdColumn) {
      // Find company by user_id
      const { rows: companyRows } = await query<{ company_id: string }>(
        `SELECT company_id FROM companies WHERE user_id = $1 LIMIT 1`,
        [userId]
      )
      if (companyRows.length > 0) {
        companyId = companyRows[0].company_id
      }
    }

    if (!companyId) {
      // Fallback: find by email
      const { rows: userRows } = await query<{ email: string }>(
        `SELECT email FROM users WHERE user_id = $1`,
        [userId]
      )
      if (userRows.length > 0) {
        const { rows: companyRows } = await query<{ company_id: string }>(
          `SELECT company_id FROM companies WHERE hr_email = $1 OR company_email = $1 LIMIT 1`,
          [userRows[0].email]
        )
        if (companyRows.length > 0) {
          companyId = companyRows[0].company_id
        }
      }
    }

    if (!companyId) {
      return res.status(404).json({ error: 'Company not found for this user' })
    }

    // Extract domain from company_email
    const companyDomain = company_email.split('@')[1] || null

    // Determine if columns exist
    let hasLogoColumn = false
    let hasLocationColumn = false
    let hasWebsiteColumn = false
    let hasLinkedinColumn = false
    let hasTwitterColumn = false
    try {
      const { rows: logoCols } = await query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'companies' AND column_name IN ('company_logo_url', 'company_location', 'website_url', 'linkedin_url', 'twitter_url')`
      )
      hasLogoColumn = logoCols.some((r: any) => r.column_name === 'company_logo_url')
      hasLocationColumn = logoCols.some((r: any) => r.column_name === 'company_location')
      hasWebsiteColumn = logoCols.some((r: any) => r.column_name === 'website_url')
      hasLinkedinColumn = logoCols.some((r: any) => r.column_name === 'linkedin_url')
      hasTwitterColumn = logoCols.some((r: any) => r.column_name === 'twitter_url')
    } catch (e) {
      // Defaults to false
    }

    // Update company
    let updateQuery = `UPDATE companies SET company_name = $1, company_email = $2, hr_email = $3, company_domain = $4`
    let queryParams: any[] = [company_name, company_email, hr_email, companyDomain]
    let paramCount = 5

    if (hasLogoColumn) {
      updateQuery += `, company_logo_url = $${paramCount}`
      queryParams.push(company_logo_url || null)
      paramCount++
    }

    if (hasLocationColumn) {
      updateQuery += `, company_location = $${paramCount}`
      queryParams.push(company_location || null)
      paramCount++
    }
    
    if (hasWebsiteColumn) {
      updateQuery += `, website_url = $${paramCount}`
      queryParams.push(website_url || null)
      paramCount++
    }
    
    if (hasLinkedinColumn) {
      updateQuery += `, linkedin_url = $${paramCount}`
      queryParams.push(linkedin_url || null)
      paramCount++
    }
    
    if (hasTwitterColumn) {
      updateQuery += `, twitter_url = $${paramCount}`
      queryParams.push(twitter_url || null)
      paramCount++
    }

    updateQuery += `, updated_at = NOW() WHERE company_id = $${paramCount}`
    queryParams.push(companyId)

    await query(updateQuery, queryParams)

    // Invalidate user cache
    await cache.del(cacheKeys.user(userId))

    return res.json({
      success: true,
      company: {
        company_id: companyId,
        company_name,
        company_email,
        hr_email,
        company_logo_url: hasLogoColumn ? (company_logo_url || null) : undefined,
        company_location: hasLocationColumn ? (company_location || null) : undefined,
        website_url: hasWebsiteColumn ? (website_url || null) : undefined,
        linkedin_url: hasLinkedinColumn ? (linkedin_url || null) : undefined,
        twitter_url: hasTwitterColumn ? (twitter_url || null) : undefined
      }
    })
  } catch (err) {
    console.error('Error updating company:', err)
    return res.status(500).json({ error: 'Failed to update company' })
  }
}


// Permanently delete current user account
export async function deleteSelf(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Check if user is an admin - we shouldn't let the last admin delete themselves
    const { rows: userRows } = await query<{ role: string }>(
      `SELECT role FROM users WHERE user_id = $1`,
      [userId]
    )

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (userRows[0].role === 'admin') {
      const { rows: adminCount } = await query<{ count: string }>(
        `SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND is_active = true`
      )
      if (Number(adminCount[0].count) <= 1) {
        return res.status(403).json({ error: 'Cannot delete the last active admin account' })
      }
    }

    // Delete the user (cascade will handle related records in companies, applications, etc. 
    // if references are set to ON DELETE CASCADE)
    await query(`DELETE FROM users WHERE user_id = $1`, [userId])

    // Invalidate user cache
    await cache.del(cacheKeys.user(userId))

    return res.json({ success: true, message: 'Account deleted successfully' })
  } catch (err) {
    console.error('Delete self error:', err)
    return res.status(500).json({ error: 'Failed to delete account' })
  }
}
