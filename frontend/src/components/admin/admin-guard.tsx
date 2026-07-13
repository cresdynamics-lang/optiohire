'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ShieldCheck, Loader2, Clock } from 'lucide-react'

/**
 * Admin access control + session lifecycle.
 *
 * - Blocks rendering of the admin shell until a valid, non-expired admin token exists.
 * - Enforces the JWT hard expiry (checked on an interval); expired => no access until re-login.
 * - After a period of inactivity, shows a 59s countdown modal. "Continue" keeps the
 *   session alive; reaching zero (or an expired token) logs the user out.
 */

const INACTIVITY_WARN_AFTER_MS = 4 * 60 * 1000 // start the warning after 4 min of no activity
const COUNTDOWN_SECONDS = 59
const CHECK_INTERVAL_MS = 1000

function decodeExp(token: string): number | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const payload = JSON.parse(atob(padded))
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('admin_token') || localStorage.getItem('token')
}

function hasValidSession(): boolean {
  if (typeof window === 'undefined') return false
  const token = getAdminToken()
  const session = localStorage.getItem('admin_session')
  if (!token || !session) return false
  const exp = decodeExp(token)
  if (exp && exp < Date.now() / 1000) return false
  return true
}

export function AdminGuard({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'checking' | 'authed'>('checking')
  const [warning, setWarning] = useState(false)
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS)

  const lastActivity = useRef<number>(Date.now())
  const warnStart = useRef<number | null>(null)

  const logout = useCallback(() => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('token')
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_session')
    localStorage.removeItem('admin_email')
    localStorage.removeItem('admin_name')
    window.location.replace('/admin/login')
  }, [])

  // Initial gate: valid session or bounce to login.
  useEffect(() => {
    if (!hasValidSession()) {
      logout()
      return
    }
    setStatus('authed')
  }, [logout])

  // Activity tracking + session ticker (expiry + inactivity countdown).
  useEffect(() => {
    if (status !== 'authed') return

    const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    const onActivity = () => {
      // Ignore activity while the warning is up — user must explicitly click Continue.
      if (!warnStart.current) lastActivity.current = Date.now()
    }
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))

    const interval = setInterval(() => {
      // Hard token expiry always wins.
      const token = getAdminToken()
      const exp = token ? decodeExp(token) : null
      if (!token || (exp && exp < Date.now() / 1000)) {
        logout()
        return
      }

      if (warnStart.current) {
        const left = COUNTDOWN_SECONDS - Math.floor((Date.now() - warnStart.current) / 1000)
        if (left <= 0) {
          logout()
          return
        }
        setRemaining(left)
      } else if (Date.now() - lastActivity.current >= INACTIVITY_WARN_AFTER_MS) {
        warnStart.current = Date.now()
        setRemaining(COUNTDOWN_SECONDS)
        setWarning(true)
      }
    }, CHECK_INTERVAL_MS)

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity))
      clearInterval(interval)
    }
  }, [status, logout])

  const handleContinue = useCallback(() => {
    warnStart.current = null
    lastActivity.current = Date.now()
    setWarning(false)
    setRemaining(COUNTDOWN_SECONDS)
  }, [])

  if (status === 'checking') {
    return (
      <div className="admin-neu flex min-h-screen items-center justify-center">
        <div className="neu-raised flex flex-col items-center gap-4 rounded-3xl px-10 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
          <p className="text-sm font-medium text-[#3b4252]">Verifying admin access…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}

      {warning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="neu-raised w-full max-w-md rounded-3xl p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full neu-inset">
              <Clock className="h-7 w-7 text-[#2563eb]" />
            </div>
            <h2 className="text-xl font-bold text-[#3b4252]">Are you still logged in?</h2>
            <p className="mt-2 text-sm text-[#6b7280]">
              Your session will end due to inactivity. You&apos;ll be logged out automatically when the
              countdown reaches zero.
            </p>

            <div className="my-6 flex items-center justify-center">
              <div className="neu-inset flex h-24 w-24 items-center justify-center rounded-full">
                <span className="text-3xl font-extrabold tabular-nums text-[#2563eb]">{remaining}</span>
              </div>
            </div>
            <p className="mb-6 text-xs uppercase tracking-widest text-[#6b7280]">seconds remaining</p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleContinue}
                className="neu-pressable flex-1 rounded-xl px-6 py-3 text-sm font-semibold text-[#2563eb]"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Continue session
                </span>
              </button>
              <button
                type="button"
                onClick={logout}
                className="neu-pressable flex-1 rounded-xl px-6 py-3 text-sm font-semibold text-red-500"
              >
                Log out now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
