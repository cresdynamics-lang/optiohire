'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Coins, Copy, Gift, Loader2, Share2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

type Perk = {
  id: string
  label: string
  description: string
  cost: number
}

type ReferralStatus = {
  referralCode: string
  referralLink: string
  shareLink: string
  coinBalance: number
  rewardPerReferral: number
  successfulReferrals: number
  coinsEarnedFromReferrals: number
  message: string
  availablePerks: Perk[]
  audience: 'employer' | 'candidate'
}

type ReferralPanelProps = {
  compact?: boolean
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' }
}

export function useReferralStatus() {
  const { user } = useAuth()
  const [data, setData] = useState<ReferralStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/referrals/me', { headers: authHeaders() })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Failed to load referrals')
      setData(json as ReferralStatus)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { data, loading, error, refresh }
}

export function ReferralPanel({ compact }: ReferralPanelProps) {
  const { data, loading, error, refresh } = useReferralStatus()
  const [copied, setCopied] = useState(false)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)

  const handleCopy = async () => {
    if (!data?.referralLink) return
    try {
      await navigator.clipboard.writeText(data.referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const handleShare = async () => {
    if (!data) return
    const text = `Join me on OptioHire — skills-first hiring. Use my link and I earn ${data.rewardPerReferral} coins when you sign up.`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'OptioHire', text, url: data.referralLink })
      } else {
        await handleCopy()
      }
    } catch {
      // ignore abort
    }
  }

  const handleRedeem = async (perkId: string) => {
    setRedeeming(perkId)
    setFlash(null)
    try {
      const res = await fetch('/api/referrals/redeem', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ perk: perkId }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Redeem failed')
      setFlash(json.message || 'Perk unlocked')
      await refresh()
    } catch (e: any) {
      setFlash(e.message || 'Redeem failed')
    } finally {
      setRedeeming(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading referral…
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        {error || 'Referrals unavailable for this account.'}
      </div>
    )
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-sm ${
        compact ? 'p-3' : 'p-5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
            <Gift className="h-3.5 w-3.5" aria-hidden />
            Refer & earn
          </p>
          <h3 className={`mt-1 font-semibold text-slate-900 ${compact ? 'text-sm' : 'text-lg'}`}>
            Refer a friend to earn {data.rewardPerReferral} coins
          </h3>
          {!compact && (
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{data.message}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900">
          <Coins className="h-4 w-4" aria-hidden />
          {data.coinBalance}
        </div>
      </div>

      <div className={`mt-3 rounded-xl border border-slate-200/80 bg-white/90 ${compact ? 'p-2' : 'p-3'}`}>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Your invite link</p>
        <p className="mt-1 truncate font-mono text-xs text-slate-700 sm:text-sm">{data.referralLink}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={handleCopy}>
            {copied ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy link'}
          </Button>
          <Button type="button" size="sm" className="rounded-xl bg-amber-600 hover:bg-amber-700" onClick={handleShare}>
            <Share2 className="mr-1 h-3.5 w-3.5" />
            Share with a friend
          </Button>
        </div>
      </div>

      <div className={`mt-3 grid gap-2 text-xs text-slate-600 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
        <div className="rounded-lg bg-white/70 px-2.5 py-2">
          <p className="text-slate-400">Successful</p>
          <p className="text-base font-semibold text-slate-900">{data.successfulReferrals}</p>
        </div>
        <div className="rounded-lg bg-white/70 px-2.5 py-2">
          <p className="text-slate-400">Coins earned</p>
          <p className="text-base font-semibold text-slate-900">{data.coinsEarnedFromReferrals}</p>
        </div>
        {!compact && (
          <div className="rounded-lg bg-white/70 px-2.5 py-2">
            <p className="text-slate-400">Code</p>
            <p className="text-base font-semibold tracking-wide text-slate-900">{data.referralCode}</p>
          </div>
        )}
      </div>

      {!compact && data.availablePerks.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Spend coins</p>
          {data.availablePerks.map((perk) => (
            <div
              key={perk.id}
              className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{perk.label}</p>
                <p className="text-xs text-slate-500">{perk.description}</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0 rounded-xl"
                disabled={redeeming === perk.id || data.coinBalance < perk.cost}
                onClick={() => handleRedeem(perk.id)}
              >
                {redeeming === perk.id ? (
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Coins className="mr-1 h-3.5 w-3.5" />
                )}
                {perk.cost} coins
              </Button>
            </div>
          ))}
        </div>
      )}

      {flash && <p className="mt-3 text-sm text-amber-800">{flash}</p>}
    </div>
  )
}

/** Left-docked post-login promo for HR + candidates */
export function ReferralInvitePopup() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    const role = (user.companyRole || user.role || '').toLowerCase()
    const eligible =
      ['candidate', 'job_seeker', 'jobseeker', 'hr', 'hiring_manager'].includes(role) ||
      role === 'user'
    if (!eligible) return

    const key = `oh_referral_popup_seen_${user.id}`
    if (sessionStorage.getItem(key) === '1') return

    const t = window.setTimeout(() => setOpen(true), 900)
    return () => window.clearTimeout(t)
  }, [user?.id, user?.companyRole, user?.role])

  const dismiss = () => {
    if (user?.id) sessionStorage.setItem(`oh_referral_popup_seen_${user.id}`, '1')
    setOpen(false)
  }

  if (!open || !user) return null

  const settingsHref =
    (user.companyRole || '').toLowerCase() === 'candidate' ||
    (user.companyRole || '').toLowerCase() === 'job_seeker'
      ? '/candidate/settings#referrals'
      : '/hr/settings?tab=referrals'

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-3 z-[90] w-[min(20rem,calc(100vw-1.5rem))] sm:bottom-6 sm:left-5"
      role="dialog"
      aria-label="Refer a friend"
    >
      <div className="pointer-events-auto animate-in slide-in-from-left-4 fade-in duration-300 rounded-2xl border border-amber-200 bg-white p-4 shadow-xl shadow-amber-900/10">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Coins className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">Refer a friend to earn 5 coins</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Share your invite link. When they join OptioHire, you earn 5 coins to spend on platform boosts.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={settingsHref}
                onClick={dismiss}
                className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
              >
                Refer a friend
              </a>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

/** Capture ?ref= into localStorage for signup attribution */
export function ReferralCodeCapture() {
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get('ref')
      if (ref && /^[A-Za-z0-9_-]{4,32}$/.test(ref)) {
        localStorage.setItem('oh_referral_code', ref.trim().toUpperCase())
      }
    } catch {
      // ignore
    }
  }, [])
  return null
}
