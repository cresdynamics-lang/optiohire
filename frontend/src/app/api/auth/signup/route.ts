import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pg from 'pg'

const JWT_SECRET = process.env.JWT_SECRET || 'a6869b3fb2a7b56cb33c58d07cf69548ee1ccbe9f6ec2aa54ce13d1a1bafeedae2d88ee36ed7d92f0e29d573d68c2335fe187eb7cf3890be9b7d4bf216cfd568'
const SALT_ROUNDS = 10

export async function POST(request: NextRequest) {
  const { getPool } = await import('@/lib/db')
  let client: pg.PoolClient | null = null
  
  try {
    // Get database connection
    try {
      // Check if DATABASE_URL is available
      if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not set in environment variables')
        return NextResponse.json(
          {
            error: 'Database connection failed',
            details: 'DATABASE_URL environment variable is not set. Please check your .env.local file and restart the server.',
          },
          { status: 500 }
        )
      }
      
      const pool = getPool()
      console.log('Attempting database connection...')
      client = await pool.connect()
      console.log('Database connection successful')
    } catch (dbErr: any) {
      console.error('Database connection error:', dbErr)
      console.error('Error details:', {
        message: dbErr?.message,
        code: dbErr?.code,
        errno: dbErr?.errno,
        syscall: dbErr?.syscall,
        hostname: dbErr?.hostname,
        hasConnectionString: !!process.env.DATABASE_URL,
        connectionStringLength: process.env.DATABASE_URL?.length || 0
      })
      
      // Provide more specific error messages
      let errorDetails = dbErr?.message || 'Could not connect to database.'
      if (dbErr?.code === 'ENOTFOUND' || dbErr?.code === 'ECONNREFUSED') {
        errorDetails = 'Cannot reach database server. Please check your network connection and DATABASE_URL.'
      } else if (dbErr?.message?.includes('password') || dbErr?.message?.includes('authentication')) {
        errorDetails = 'Database authentication failed. Please check your DATABASE_URL password.'
      } else if (dbErr?.message?.includes('timeout')) {
        errorDetails = 'Database connection timeout. The server may be unreachable.'
      }
      
      return NextResponse.json(
        {
          error: 'Database connection failed',
          details: errorDetails,
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { 
      name, 
      email, 
      password, 
      company_role, 
      company_name, 
      company_email, 
      hr_email, 
      hiring_manager_email 
    } = body || {}

    // Validate all required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }
    if (!company_role || !company_name || !company_email || !hr_email || !hiring_manager_email) {
      return NextResponse.json(
        { error: 'Company role, organization name, company email, HR email, and hiring manager email are all required' },
        { status: 400 }
      )
    }

    // Validate company_role
    if (company_role !== 'hr' && company_role !== 'hiring_manager') {
      return NextResponse.json(
        { error: 'Company role must be either "hr" or "hiring_manager"' },
        { status: 400 }
      )
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email) || !emailRegex.test(company_email) || !emailRegex.test(hr_email) || !emailRegex.test(hiring_manager_email)) {
      return NextResponse.json(
        { error: 'All email addresses must be valid' },
        { status: 400 }
      )
    }

    // Prefer backend signup so user is created once and OTP is sent by the backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    if (backendUrl) {
      try {
        const res = await fetch(`${backendUrl}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.toLowerCase(),
            password,
            company_role,
            company_name,
            company_email,
            hr_email: hr_email || company_email,
            hiring_manager_email,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
          return NextResponse.json(data, { status: 201 })
        }
        return NextResponse.json(
          { error: data?.error || data?.details || 'Sign up failed' },
          { status: res.status }
        )
      } catch (e) {
        console.error('Backend signup failed, falling back to local signup:', e)
        // Fall through to local signup below
      }
    }

    // Start transaction (local signup when no backend or backend failed)
    await client.query('BEGIN')

    try {
      // Check if email already exists
      const existingResult = await client.query(
        `SELECT user_id FROM users WHERE email = $1`,
        [email.toLowerCase()]
      )
      const existing = existingResult.rows as { user_id: string }[]
      if (existing.length > 0) {
        await client.query('ROLLBACK')
        return NextResponse.json(
          { error: 'Account with this email already exists' },
          { status: 409 }
        )
      }

      // Create user
      const hash = await bcrypt.hash(password, SALT_ROUNDS)
      
      // Check which columns exist in users table
      const { rows: colCheck } = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name IN ('name', 'company_role')
      `)
      
      const hasNameColumn = colCheck.some((r: any) => r.column_name === 'name')
      const hasCompanyRoleColumn = colCheck.some((r: any) => r.column_name === 'company_role')
      
      // Build dynamic insert query
      const columns: string[] = []
      const values: string[] = []
      const params: any[] = []
      let paramIndex = 1
      
      if (hasNameColumn) {
        columns.push('name')
        values.push(`$${paramIndex++}`)
        params.push(name.trim())
      }
      columns.push('email')
      values.push(`$${paramIndex++}`)
      params.push(email.toLowerCase())
      columns.push('password_hash')
      values.push(`$${paramIndex++}`)
      params.push(hash)
      columns.push('role')
      values.push(`'user'`)
      if (hasCompanyRoleColumn) {
        columns.push('company_role')
        values.push(`$${paramIndex++}`)
        params.push(company_role)
      }
      columns.push('is_active')
      values.push('true')
      
      const insertQuery = `INSERT INTO users (${columns.join(', ')}) VALUES (${values.join(', ')}) RETURNING user_id, created_at`
      
      const insertResult = await client.query(
        insertQuery,
        params
      )
      const rows = insertResult.rows as { user_id: string; created_at: string }[]
      const userId = rows[0].user_id

      // Extract domain from company_email
      const companyDomain = company_email.split('@')[1] || hr_email.split('@')[1] || null

      // Check if user_id column exists in companies table
      let hasUserIdColumn = false
      try {
        const checkResult = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'companies' AND column_name = 'user_id'
        `)
        hasUserIdColumn = checkResult.rows.length > 0
      } catch (err) {
        console.log('Could not check for user_id column, assuming it does not exist')
        hasUserIdColumn = false
      }

      // Create company
      let companyResult
      if (hasUserIdColumn) {
        const result = await client.query(
          `INSERT INTO companies (user_id, company_name, hr_email, hiring_manager_email, company_domain, company_email)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING company_id`,
          [
            userId,
            company_name,
            hr_email,
            hiring_manager_email,
            companyDomain,
            company_email
          ]
        )
        companyResult = { rows: result.rows as { company_id: string }[] }
      } else {
        const result = await client.query(
          `INSERT INTO companies (company_name, hr_email, hiring_manager_email, company_domain, company_email)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING company_id`,
          [
            company_name,
            hr_email,
            hiring_manager_email,
            companyDomain,
            company_email
          ]
        )
        companyResult = { rows: result.rows as { company_id: string }[] }
      }

      // Commit transaction
      await client.query('COMMIT')

      // Send email verification code (backend sends email with code; user confirms on /auth/verify-email)
      // Always require verify step: send user to verify-email page even if email send fails (they can request resend)
      let verificationEmailSent = false
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
        const res = await fetch(`${backendUrl}/auth/send-signup-verification-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase(), name: name.trim() })
        })
        const resData = await res.json().catch(() => ({}))
        if (res.ok && resData?.message && !resData?.codeSaved) {
          verificationEmailSent = true
        } else if (!res.ok) {
          console.error('Verification email request failed:', res.status, resData?.error || await res.text().catch(() => ''))
        } else if (resData?.codeSaved) {
          console.warn('Verification code saved but email not sent (check backend RESEND_API_KEY or SMTP):', resData?.message)
        }
      } catch (e) {
        console.error('Could not send verification email:', e)
      }

      // Generate JWT token
      const token = jwt.sign(
        { sub: userId, email: email.toLowerCase() },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      return NextResponse.json(
        {
          token,
          needsEmailVerification: true,
          verificationEmailSent,
          user: {
            user_id: userId,
            id: userId,
            name: name.trim(),
            email: email.toLowerCase(),
            role: 'user',
            company_role: company_role,
            created_at: rows[0].created_at,
            hasCompany: true,
            companyId: companyResult.rows[0].company_id,
            companyName: company_name,
            companyEmail: company_email,
            hrEmail: hr_email,
            hiringManagerEmail: hiring_manager_email,
          },
          company: {
            company_id: companyResult.rows[0].company_id,
            company_name,
            company_email,
            hr_email,
            hiring_manager_email,
          },
        },
        { status: 201 }
      )
    } catch (err) {
      // Rollback transaction on error
      await client.query('ROLLBACK')
      throw err
    }
  } catch (err) {
    console.error('Signup error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'

    // Rollback transaction if it was started
    if (client) {
      try {
        await client.query('ROLLBACK').catch(() => {})
      } catch (rollbackErr) {
        console.error('Rollback error:', rollbackErr)
      }
    }

    // Check if it's a database connection error
    if (
      errorMessage.includes('password') ||
      errorMessage.includes('authentication') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('DATABASE_URL') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('ENOTFOUND')
    ) {
      return NextResponse.json(
        {
          error: 'Database connection failed. Please check DATABASE_URL environment variable.',
          details: 'Make sure DATABASE_URL is properly configured in your environment variables',
        },
        { status: 500 }
      )
    }

    // Check for unique constraint violations
    if (errorMessage.includes('unique') || errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
      if (errorMessage.toLowerCase().includes('email')) {
        return NextResponse.json(
          { error: 'Account with this email already exists' },
          { status: 409 }
        )
      }
    }

    // Return user-friendly error message
    const userFriendlyError = errorMessage || 'Failed to create account'
    return NextResponse.json(
      { error: userFriendlyError },
      { status: 500 }
    )
  } finally {
    if (client) {
      client.release()
    }
  }
}

