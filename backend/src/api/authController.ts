import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { z } from 'zod'
import { query, pool } from '../db/index.js'
import { EmailService } from '../services/emailService.js'
import { verifyCaptcha } from '../utils/captcha.js'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required but not configured')
}
const SALT_ROUNDS = 10
const RESET_TOKEN_EXPIRY_HOURS = 1
const VERIFICATION_CODE_EXPIRY_HOURS = 24

// --- SCHEMAS ---
const CleanEmail = z.string().email().transform(v => v.toLowerCase().trim())
const CleanString = z.string().min(1).transform(v => v.trim())
const CleanCode = z.coerce.string().transform(v => v.trim())

const SignupSchema = z.object({
  name: CleanString,
  email: CleanEmail,
  password: z.string().min(8),
  company_role: z.string().transform(v => v.toLowerCase().trim()),
  company_name: z.string().optional(),
  company_email: CleanEmail.optional(),
  hr_email: CleanEmail.optional(),
  hiring_manager_email: CleanEmail.optional(),
  captchaToken: z.string()
})

const SigninSchema = z.object({
  email: CleanEmail,
  password: z.string()
})

const ResetPasswordSchema = z.object({
  email: CleanEmail,
  code: CleanCode,
  password: z.string().min(8)
})

// --- HELPERS ---
async function getSystemSetting(key: string, defaultValue: any = null) {
  try {
    const { rows } = await query<{ setting_value: string }>(
      `SELECT setting_value FROM system_settings WHERE setting_key = $1`,
      [key]
    )
    return rows.length > 0 ? JSON.parse(rows[0].setting_value) : defaultValue
  } catch {
    return defaultValue
  }
}

// --- CONTROLLERS ---

export async function signup(req: Request, res: Response) {
  const result = SignupSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input', details: result.error.format() })
  }

  const { name, email, password, company_role, company_name, company_email, hr_email, hiring_manager_email, captchaToken } = result.data
  
  if (!(await verifyCaptcha(captchaToken))) {
    return res.status(400).json({ error: 'Invalid captcha. Please try again.' })
  }

  const isCandidate = ['candidate', 'jobseeker', 'job seeker', 'job-seeker', 'job_seeker'].includes(company_role)
  const isEmployerAlias = ['employer', 'company', 'recruiter'].includes(company_role)
  const targetRole = isCandidate ? 'candidate' : (isEmployerAlias ? 'hr' : company_role)

  if (!isCandidate && (!company_name || !company_email || !hr_email)) {
    return res.status(400).json({ error: 'Organization details are required for employers' })
  }

  const client = await pool.connect()
  try {
    const { rows: existing } = await client.query(`SELECT user_id FROM users WHERE email = $1`, [email])
    if (existing.length > 0) return res.status(409).json({ error: 'Account already exists' })

    await client.query('BEGIN')
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    
    const { rows: colCheck } = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('name', 'company_role')
    `)
    const hasName = colCheck.some(r => r.column_name === 'name')
    const hasRole = colCheck.some(r => r.column_name === 'company_role')

    const cols = ['email', 'password_hash', 'role', 'is_active']
    const vals = ['$1', '$2', "'user'", 'true']
    const params = [email, hash]
    if (hasName) { cols.push('name'); vals.push(`$${params.push(name)}`) }
    if (hasRole) { cols.push('company_role'); vals.push(`$${params.push(targetRole)}`) }

    const { rows: userRows } = await client.query(
      `INSERT INTO users (${cols.join(',')}) VALUES (${vals.join(',')}) RETURNING user_id, created_at`,
      params
    )
    const userId = userRows[0].user_id

    const requireApproval = await getSystemSetting('require_signup_approval', false)
    if (requireApproval) {
      await client.query(`UPDATE users SET is_active = false WHERE user_id = $1`, [userId])
      await client.query(
        `INSERT INTO signup_queue (user_id, email, name, company_name, company_email, status) VALUES ($1, $2, $3, $4, $5, 'pending')`,
        [userId, email, name, isCandidate ? 'Individual' : company_name!, isCandidate ? email : company_email!]
      )
    }

    let companyId = null
    if (!isCandidate) {
      const domain = company_email!.split('@')[1] || hr_email!.split('@')[1]
      const { rows: colCheckComp } = await client.query(`SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'user_id'`)
      const hasCompUserId = colCheckComp.length > 0

      const hmEmail = hiring_manager_email || hr_email!
      const { rows: existingComp } = await client.query(
        `SELECT company_id FROM companies WHERE (company_email = $1 OR hr_email = $2 OR company_domain = $3) AND ($4::boolean = false OR user_id IS NULL OR user_id = $5) LIMIT 1`,
        [company_email!, hr_email!, domain, hasCompUserId, userId]
      )

      if (existingComp.length > 0) {
        companyId = existingComp[0].company_id
        const upCols = ['company_name=$1', 'company_email=$2', 'hr_email=$3', 'hiring_manager_email=$4', 'company_domain=$5', 'updated_at=now()']
        const upParams = [company_name!, company_email!, hr_email!, hmEmail, domain, companyId]
        if (hasCompUserId) upCols.push(`user_id=$${upParams.push(userId)}`)
        await client.query(`UPDATE companies SET ${upCols.join(',')} WHERE company_id = $${upParams.length}`, upParams)
      } else {
        const insCols = ['company_name', 'hr_email', 'hiring_manager_email', 'company_domain', 'company_email']
        const insVals = ['$1', '$2', '$3', '$4', '$5']
        const insParams = [company_name!, hr_email!, hmEmail, domain, company_email!]
        if (hasCompUserId) { insCols.push('user_id'); insVals.push(`$${insParams.push(userId)}`) }
        const { rows: newComp } = await client.query(`INSERT INTO companies (${insCols.join(',')}) VALUES (${insVals.join(',')}) RETURNING company_id`, insParams)
        companyId = newComp[0].company_id
      }
    }

    await client.query('COMMIT')

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_HOURS * 3600000)
    try {
      await query(`INSERT INTO email_verification_codes (user_id, email, code, expires_at) VALUES ($1, $2, $3, $4)`, [userId, email, otp, expires])
      void new EmailService().sendEmailVerificationCode(email, name, otp).catch(e => console.error('OTP send failed', e))
    } catch (e) { console.error('OTP save failed', e) }

    const token = jwt.sign({ sub: userId, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' })
    return res.status(201).json({
      token,
      needsEmailVerification: true,
      user: {
        id: userId, email, name, role: 'user', company_role: targetRole,
        hasCompany: !isCandidate, companyId, is_active: !requireApproval
      }
    })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Signup error:', err)
    return res.status(500).json({ error: 'Failed to create account' })
  } finally {
    client.release()
  }
}

export async function signin(req: Request, res: Response) {
  const result = SigninSchema.safeParse(req.body)
  if (!result.success) return res.status(400).json({ error: 'Invalid input' })
  const { email, password } = result.data

  try {
    const { rows } = await query<{ user_id: string, password_hash: string, role: string, is_active: boolean, name: string | null, company_role: string | null, created_at: string }>(
      `SELECT * FROM users WHERE email = $1`, [email]
    )
    if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    if (!rows[0].is_active) return res.status(401).json({ error: 'Account is inactive' })

    const user = rows[0]
    let companyInfo = { hasCompany: false, companyId: null as string | null }
    
    if (user.role === 'admin') {
      companyInfo.hasCompany = true
    } else if (user.company_role !== 'candidate') {
      const { rows: colCheck } = await query(`SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'user_id'`)
      const q = colCheck.length > 0 
        ? `SELECT company_id FROM companies WHERE user_id = $1 LIMIT 1`
        : `SELECT company_id FROM companies WHERE hr_email = $1 OR company_email = $1 LIMIT 1`
      const { rows: comp } = await query<{ company_id: string }>(q, colCheck.length > 0 ? [user.user_id] : [email])
      if (comp.length > 0) {
        companyInfo.hasCompany = true
        companyInfo.companyId = comp[0].company_id
      }
    }

    const token = jwt.sign({ sub: user.user_id, email, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    return res.status(200).json({ 
      token, 
      user: { id: user.user_id, email, name: user.name, role: user.role, company_role: user.company_role, ...companyInfo } 
    })
  } catch (err) {
    console.error('Signin error:', err)
    return res.status(500).json({ error: 'Failed to sign in' })
  }
}

export async function adminSignin(req: Request, res: Response) {
  const result = SigninSchema.safeParse(req.body)
  if (!result.success) return res.status(400).json({ error: 'Invalid input' })
  const { email, password } = result.data

  try {
    const { rows } = await query<{ user_id: string, password_hash: string, role: string, is_active: boolean }>(
      `SELECT * FROM users WHERE email = $1`, [email]
    )
    if (rows.length === 0 || rows[0].role !== 'admin' || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    if (!rows[0].is_active) return res.status(401).json({ error: 'Account is inactive' })

    const token = jwt.sign({ sub: rows[0].user_id, email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
    return res.status(200).json({ token, user: { id: rows[0].user_id, email, role: 'admin', hasCompany: true } })
  } catch (err) {
    console.error('Admin signin error:', err)
    return res.status(500).json({ error: 'Failed to sign in' })
  }
}

export async function forgotPassword(req: Request, res: Response) {
  const { email, captchaToken } = req.body || {}
  const cleanEmail = CleanEmail.safeParse(email)
  if (!cleanEmail.success) return res.status(400).json({ error: 'Valid email required' })

  if (!(await verifyCaptcha(captchaToken))) return res.status(400).json({ error: 'Invalid captcha' })

  try {
    const { rows } = await query<{ user_id: string, email: string, name: string | null }>(
      `SELECT user_id, email, name FROM users WHERE email = $1 AND is_active = true`, [cleanEmail.data]
    )
    if (rows.length > 0) {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const expires = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 3600000)
      await query(`UPDATE password_reset_tokens SET used = true WHERE user_id = $1`, [rows[0].user_id])
      await query(`INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`, [rows[0].user_id, code, expires])
      void new EmailService().sendPasswordResetCode(rows[0].email, rows[0].name || 'User', code).catch(e => console.error('Reset email failed', e))
    }
    return res.status(200).json({ message: 'If an account exists, a reset code has been sent.' })
  } catch (err) {
    console.error('Forgot password error:', err)
    return res.status(500).json({ error: 'Failed to process request' })
  }
}

export async function verifyResetCode(req: Request, res: Response) {
  const emailRes = CleanEmail.safeParse(req.body.email)
  const codeRes = CleanCode.safeParse(req.body.code)
  if (!emailRes.success || !codeRes.success) return res.status(400).json({ error: 'Email and code required', valid: false })

  try {
    const { rows } = await query<{ token_id: string, expires_at: Date, used: boolean }>(
      `SELECT prt.* FROM password_reset_tokens prt JOIN users u ON u.user_id = prt.user_id WHERE u.email = $1 AND prt.token = $2 AND prt.used = false ORDER BY prt.created_at DESC LIMIT 1`,
      [emailRes.data, codeRes.data]
    )
    if (rows.length === 0 || new Date(rows[0].expires_at) < new Date()) {
      return res.status(200).json({ valid: false, error: 'Invalid or expired code' })
    }
    return res.status(200).json({ valid: true, token_id: rows[0].token_id })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to verify code', valid: false })
  }
}

export async function verifyResetToken(req: Request, res: Response) {
  const tokenRes = CleanString.safeParse(req.body.token)
  if (!tokenRes.success) return res.status(400).json({ error: 'Token required', valid: false })

  try {
    const { rows } = await query<{ expires_at: Date, used: boolean }>(
      `SELECT * FROM password_reset_tokens WHERE token = $1`, [tokenRes.data]
    )
    if (rows.length === 0 || rows[0].used || new Date(rows[0].expires_at) < new Date()) {
      return res.status(200).json({ valid: false, error: 'Invalid or expired token' })
    }
    return res.status(200).json({ valid: true })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to verify token', valid: false })
  }
}

export async function resetPassword(req: Request, res: Response) {
  const result = ResetPasswordSchema.safeParse(req.body)
  if (!result.success) return res.status(400).json({ error: 'Invalid input' })
  const { email, code, password } = result.data

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query<{ token_id: string, user_id: string, expires_at: Date }>(
      `SELECT prt.* FROM password_reset_tokens prt JOIN users u ON u.user_id = prt.user_id WHERE u.email = $1 AND prt.token = $2 AND prt.used = false FOR UPDATE`,
      [email, code]
    )
    if (rows.length === 0 || new Date(rows[0].expires_at) < new Date()) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Invalid or expired code' })
    }
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    await client.query(`UPDATE users SET password_hash = $1 WHERE user_id = $2`, [hash, rows[0].user_id])
    await client.query(`UPDATE password_reset_tokens SET used = true WHERE token_id = $1`, [rows[0].token_id])
    await client.query('COMMIT')
    return res.status(200).json({ message: 'Password reset successfully' })
  } catch (err) {
    await client.query('ROLLBACK')
    return res.status(500).json({ error: 'Failed to reset password' })
  } finally {
    client.release()
  }
}

export async function sendSignupVerificationEmail(req: Request, res: Response) {
  const emailRes = CleanEmail.safeParse(req.body.email)
  if (!emailRes.success) return res.status(400).json({ error: 'Valid email required' })
  const email = emailRes.data

  try {
    const { rows } = await query<{ user_id: string, name: string | null }>(`SELECT user_id, name FROM users WHERE email = $1`, [email])
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' })
    
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_HOURS * 3600000)
    await query(`INSERT INTO email_verification_codes (user_id, email, code, expires_at) VALUES ($1, $2, $3, $4)`, [rows[0].user_id, email, code, expires])
    await new EmailService().sendEmailVerificationCode(email, req.body.name || rows[0].name || 'User', code)
    return res.status(200).json({ message: 'Code sent' })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send email' })
  }
}

export async function verifyEmail(req: Request, res: Response) {
  const emailRes = CleanEmail.safeParse(req.body.email)
  const codeRes = CleanCode.safeParse(req.body.code)
  if (!emailRes.success || !codeRes.success) return res.status(400).json({ error: 'Email and code required' })

  try {
    const { rows } = await query<{ code_id: string, user_id: string, expires_at: Date, used: boolean }>(
      `SELECT * FROM email_verification_codes WHERE email = $1 AND code = $2 ORDER BY created_at DESC LIMIT 1`,
      [emailRes.data, codeRes.data]
    )
    if (rows.length === 0 || rows[0].used || new Date(rows[0].expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired code' })
    }
    await query(`UPDATE email_verification_codes SET used = true WHERE code_id = $1`, [rows[0].code_id])
    await query(`UPDATE users SET email_verified = true WHERE user_id = $1`, [rows[0].user_id]).catch(() => {})
    
    const { rows: user } = await query<{ name: string | null }>(`SELECT name FROM users WHERE user_id = $1`, [rows[0].user_id])
    void new EmailService().sendWelcomeEmail(emailRes.data, user[0]?.name || 'User').catch(() => {})
    
    return res.status(200).json({ message: 'Email verified', verified: true })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to verify email' })
  }
}

export async function googleSignIn(req: Request, res: Response) {
  try {
    const { code, id_token: idTokenBody } = req.body
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    if (!clientId || !clientSecret) return res.status(503).json({ error: 'Google auth not configured' })

    let idToken = idTokenBody
    if (code && !idToken) {
      const resTok = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: req.body.redirect_uri || process.env.GOOGLE_REDIRECT_URI!, grant_type: 'authorization_code' })
      })
      if (!resTok.ok) return res.status(401).json({ error: 'Token exchange failed' })
      const tokenData = await resTok.json() as { id_token: string }
      idToken = tokenData.id_token
    }
    if (!idToken) return res.status(400).json({ error: 'Token required' })

    const infoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`)
    const info = await infoRes.json() as { email?: string, email_verified?: string, name?: string }
    if (!info.email || info.email_verified !== 'true') return res.status(401).json({ error: 'Verified email required' })

    const email = info.email.toLowerCase().trim()
    const { rows: user } = await query<{ user_id: string, role: string, name: string | null, is_active: boolean, company_role: string | null }>(
      `SELECT * FROM users WHERE email = $1`, [email]
    )
    if (user.length === 0) return res.status(401).json({ error: 'User does not exist. Sign up first.' })
    if (!user[0].is_active) return res.status(403).json({ error: 'Account inactive' })

    const u = user[0]
    let companyInfo = { hasCompany: false, companyId: null as string | null }
    if (u.company_role !== 'candidate') {
      const { rows: comp } = await query<{ company_id: string }>(`SELECT company_id FROM companies WHERE user_id = $1 LIMIT 1`, [u.user_id])
      if (comp.length > 0) { companyInfo.hasCompany = true; companyInfo.companyId = comp[0].company_id }
    }

    const token = jwt.sign({ sub: u.user_id, email, role: u.role }, JWT_SECRET, { expiresIn: '7d' })
    return res.status(200).json({ token, user: { id: u.user_id, email, name: u.name || info.name || 'User', role: u.role, company_role: u.company_role, ...companyInfo } })
  } catch (err) {
    return res.status(500).json({ error: 'Google sign-in failed' })
  }
}

export async function hrSignup(req: Request, res: Response) {
  req.body.company_role = req.body.company_role || 'hr'
  return signup(req, res)
}

export async function candidateSignup(req: Request, res: Response) {
  req.body.company_role = 'candidate'
  return signup(req, res)
}

export async function hrSignin(req: Request, res: Response) {
  req.body.portal = 'hr'
  return signin(req, res)
}

export async function candidateSignin(req: Request, res: Response) {
  req.body.portal = 'candidate'
  return signin(req, res)
}
