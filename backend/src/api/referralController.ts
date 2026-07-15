import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth.js'
import { pool, query } from '../db/index.js'
import { logger } from '../utils/logger.js'

export const REFERRAL_REWARD_COINS = 5

export const PERKS = {
  ai_shortlist_boost: {
    id: 'ai_shortlist_boost' as const,
    label: 'AI shortlist boost',
    description: 'One extra AI re-rank credit for a job’s applicant list.',
    cost: 5,
    audience: 'employer' as const,
    durationDays: null as number | null,
  },
  profile_boost: {
    id: 'profile_boost' as const,
    label: 'Profile boost',
    description: 'Highlight your candidate profile to HR for 7 days.',
    cost: 5,
    audience: 'candidate' as const,
    durationDays: 7 as number | null,
  },
}

type Audience = 'employer' | 'candidate'

function audienceFromRole(companyRole?: string | null, role?: string | null): Audience | null {
  const cr = (companyRole || '').toLowerCase()
  const r = (role || '').toLowerCase()
  if (['candidate', 'job_seeker', 'jobseeker'].includes(cr) || r === 'candidate') return 'candidate'
  if (['hr', 'hiring_manager', 'employer', 'company', 'recruiter'].includes(cr)) return 'employer'
  return null
}

function makeReferralCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'OH'
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)]
  return code
}

async function ensureReferralCode(userId: string): Promise<string> {
  const { rows } = await query<{ referral_code: string | null }>(
    `SELECT referral_code FROM users WHERE user_id = $1`,
    [userId]
  )
  if (rows[0]?.referral_code) return rows[0].referral_code

  for (let attempt = 0; attempt < 8; attempt++) {
    const code = makeReferralCode()
    try {
      const updated = await query<{ referral_code: string }>(
        `UPDATE users SET referral_code = $1
         WHERE user_id = $2 AND (referral_code IS NULL OR referral_code = '')
         RETURNING referral_code`,
        [code, userId]
      )
      if (updated.rows[0]?.referral_code) return updated.rows[0].referral_code
      const again = await query<{ referral_code: string | null }>(
        `SELECT referral_code FROM users WHERE user_id = $1`,
        [userId]
      )
      if (again.rows[0]?.referral_code) return again.rows[0].referral_code
    } catch {
      // unique collision - retry
    }
  }
  throw new Error('Failed to allocate referral code')
}

function frontendBase(): string {
  return (process.env.FRONTEND_URL || 'https://optiohire.com').replace(/\/$/, '')
}

export function buildReferralLinks(code: string, audience: Audience) {
  const base = frontendBase()
  if (audience === 'candidate') {
    return {
      primary: `${base}/candidate/auth/signup?ref=${encodeURIComponent(code)}`,
      share: `${base}/auth/options?mode=signup&ref=${encodeURIComponent(code)}`,
    }
  }
  return {
    primary: `${base}/hr/auth/signup?ref=${encodeURIComponent(code)}`,
    share: `${base}/auth/options?mode=signup&ref=${encodeURIComponent(code)}`,
  }
}

/**
 * Award coins when a new HR/candidate signs up with a valid referral code.
 * Idempotent per referee. Skips institution-only accounts and self-referral.
 */
export async function processReferralOnSignup(opts: {
  refereeUserId: string
  referralCode?: string | null
  refereeAudience: Audience | null
}): Promise<void> {
  const code = (opts.referralCode || '').trim().toUpperCase()
  if (!code || !opts.refereeAudience) return

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: referrers } = await client.query<{
      user_id: string
      company_role: string | null
      role: string | null
      is_active: boolean
    }>(
      `SELECT user_id, company_role, role, is_active
       FROM users
       WHERE upper(referral_code) = $1
       LIMIT 1`,
      [code]
    )

    if (referrers.length === 0) {
      await client.query('ROLLBACK')
      return
    }

    const referrer = referrers[0]
    if (!referrer.is_active || referrer.user_id === opts.refereeUserId) {
      await client.query('ROLLBACK')
      return
    }

    const referrerAudience = audienceFromRole(referrer.company_role, referrer.role)
    if (!referrerAudience) {
      await client.query('ROLLBACK')
      return
    }

    const { rows: existing } = await client.query(
      `SELECT id FROM referrals WHERE referee_user_id = $1 LIMIT 1`,
      [opts.refereeUserId]
    )
    if (existing.length > 0) {
      await client.query('ROLLBACK')
      return
    }

    await client.query(
      `INSERT INTO referrals (referrer_user_id, referee_user_id, referral_code, coins_awarded, status)
       VALUES ($1, $2, $3, $4, 'completed')`,
      [referrer.user_id, opts.refereeUserId, code, REFERRAL_REWARD_COINS]
    )

    await client.query(
      `UPDATE users SET coin_balance = coin_balance + $1 WHERE user_id = $2`,
      [REFERRAL_REWARD_COINS, referrer.user_id]
    )

    await client.query(
      `INSERT INTO coin_ledger (user_id, amount, reason, reference_id, meta)
       VALUES ($1, $2, 'referral_reward', $3, $4::jsonb)`,
      [
        referrer.user_id,
        REFERRAL_REWARD_COINS,
        opts.refereeUserId,
        JSON.stringify({ referral_code: code, referee_audience: opts.refereeAudience }),
      ]
    )

    await client.query('COMMIT')
    logger.info(`Referral rewarded: ${referrer.user_id} +${REFERRAL_REWARD_COINS} for ${opts.refereeUserId}`)
  } catch (err) {
    await client.query('ROLLBACK')
    logger.error('processReferralOnSignup failed', err)
  } finally {
    client.release()
  }
}

export async function getMyReferral(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' })

    const audience = audienceFromRole(req.userCompanyRole, req.userRole)
    if (!audience) {
      return res.status(403).json({ error: 'Referrals are available for HR and candidates only' })
    }

    const code = await ensureReferralCode(req.userId)
    const links = buildReferralLinks(code, audience)

    const { rows: bal } = await query<{ coin_balance: number }>(
      `SELECT coin_balance FROM users WHERE user_id = $1`,
      [req.userId]
    )

    const { rows: stats } = await query<{ successful: string; coins_earned: string }>(
      `SELECT
         COUNT(*)::text AS successful,
         COALESCE(SUM(coins_awarded), 0)::text AS coins_earned
       FROM referrals
       WHERE referrer_user_id = $1 AND status = 'completed'`,
      [req.userId]
    )

    const { rows: activeBoosts } = await query<{ perk: string; expires_at: string | null; created_at: string }>(
      `SELECT perk, expires_at, created_at
       FROM coin_redemptions
       WHERE user_id = $1
         AND (expires_at IS NULL OR expires_at > now())
       ORDER BY created_at DESC
       LIMIT 10`,
      [req.userId]
    )

    const availablePerks = Object.values(PERKS).filter((p) => p.audience === audience)

    return res.json({
      referralCode: code,
      referralLink: links.primary,
      shareLink: links.share,
      coinBalance: bal[0]?.coin_balance ?? 0,
      rewardPerReferral: REFERRAL_REWARD_COINS,
      successfulReferrals: Number(stats[0]?.successful || 0),
      coinsEarnedFromReferrals: Number(stats[0]?.coins_earned || 0),
      message: `Refer a friend to earn coins. A successful referral for a person to join using your link gives you ${REFERRAL_REWARD_COINS} coins.`,
      availablePerks,
      activeBoosts,
      audience,
    })
  } catch (err) {
    logger.error('getMyReferral error', err)
    return res.status(500).json({ error: 'Failed to load referral status' })
  }
}

export async function redeemPerk(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' })

    const audience = audienceFromRole(req.userCompanyRole, req.userRole)
    if (!audience) {
      return res.status(403).json({ error: 'Referrals are available for HR and candidates only' })
    }

    const perkId = String(req.body?.perk || '')
    const perk = Object.values(PERKS).find((p) => p.id === perkId)
    if (!perk || perk.audience !== audience) {
      return res.status(400).json({ error: 'Invalid perk for this account' })
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const { rows } = await client.query<{ coin_balance: number }>(
        `SELECT coin_balance FROM users WHERE user_id = $1 FOR UPDATE`,
        [req.userId]
      )
      const balance = rows[0]?.coin_balance ?? 0
      if (balance < perk.cost) {
        await client.query('ROLLBACK')
        return res.status(400).json({ error: `Need ${perk.cost} coins (you have ${balance})` })
      }

      await client.query(
        `UPDATE users SET coin_balance = coin_balance - $1 WHERE user_id = $2`,
        [perk.cost, req.userId]
      )

      const expiresAt = perk.durationDays
        ? new Date(Date.now() + perk.durationDays * 24 * 60 * 60 * 1000)
        : null

      const { rows: redemption } = await client.query(
        `INSERT INTO coin_redemptions (user_id, perk, cost, expires_at, meta)
         VALUES ($1, $2, $3, $4, $5::jsonb)
         RETURNING id, perk, cost, expires_at, created_at`,
        [req.userId, perk.id, perk.cost, expiresAt, JSON.stringify({ label: perk.label })]
      )

      await client.query(
        `INSERT INTO coin_ledger (user_id, amount, reason, reference_id, meta)
         VALUES ($1, $2, 'redeem_perk', $3, $4::jsonb)`,
        [req.userId, -perk.cost, redemption[0].id, JSON.stringify({ perk: perk.id })]
      )

      const { rows: bal } = await client.query<{ coin_balance: number }>(
        `SELECT coin_balance FROM users WHERE user_id = $1`,
        [req.userId]
      )

      await client.query('COMMIT')
      return res.json({
        message: `Redeemed ${perk.label}`,
        coinBalance: bal[0]?.coin_balance ?? 0,
        redemption: redemption[0],
      })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    logger.error('redeemPerk error', err)
    return res.status(500).json({ error: 'Failed to redeem perk' })
  }
}
