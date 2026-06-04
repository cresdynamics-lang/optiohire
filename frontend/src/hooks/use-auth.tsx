'use client'

import { createContext, useContext, useState, useEffect, useLayoutEffect, useRef } from 'react'

interface AuthUser {
  username?: string | null
  email: string
  id?: string
  created_at?: string
  role?: string
  name?: string | null
  companyRole?: string | null
  hasCompany?: boolean
  companyId?: string
  companyName?: string
  companyEmail?: string
  hrEmail?: string
  hiringManagerEmail?: string | null
  companyLogoUrl?: string | null
  companyLocation?: string | null
}

export type SignOutOptions = {
  /** Where to go after clearing storage. Default `/auth/signin`. Use `false` to only clear client state (no navigation). */
  next?: string | false
}

interface AuthContextType {
  user: null | AuthUser
  loading: boolean
  signUp: (
    name: string,
    email: string,
    password: string,
    company_role: string,
    organization_name: string,
    company_email: string,
    hr_email: string,
    hiring_manager_email: string,
    captchaToken?: string
  ) => Promise<{ error: null | { message: string }; needsEmailVerification?: boolean; email?: string }>
  signIn: (email: string, password: string) => Promise<{ error: null | { message: string } }>
  signOut: (options?: SignOutOptions) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function normalizeCompanyRole(value?: string | null): string | null {
  if (!value) return null
  const role = value.toLowerCase().trim()
  if (role === 'employer' || role === 'company' || role === 'recruiter') {
    return 'hr'
  }
  if (role === 'candidate' || role === 'job_seeker' || role === 'jobseeker' || role === 'job seeker') {
    return 'candidate'
  }
  return role
}

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

function shouldRequireCompanySetup(user: Partial<AuthUser> | null | undefined): boolean {
  if (!user || user.role === 'admin') return false
  const normalizedCompanyRole = normalizeCompanyRole(user.companyRole)
  const normalizedRole = normalizeCompanyRole(user.role)
  if (normalizedCompanyRole === 'candidate' || normalizedRole === 'candidate') return false
  return user.hasCompany === false && !user.companyId
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<null | AuthUser>(null)
  const [loading, setLoading] = useState(true) // Resolved synchronously in useLayoutEffect (client)
  const fallbackUserRef = useRef<AuthUser | null>(null)
  const profileSyncAbortRef = useRef<AbortController | null>(null)
  const getBackendBaseUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim()
    if (envUrl) return envUrl.replace(/\/$/, '')
    if (typeof window !== 'undefined') {
      const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname)
      if (isLocalHost) return 'http://localhost:3001'
    }
    return ''
  }

  // Hydrate session before first paint (avoids long “loading” flash on dashboard)
  useLayoutEffect(() => {
    fallbackUserRef.current = null
    const adminSession = localStorage.getItem('admin_session')
    if (adminSession) {
      try {
        const admin = JSON.parse(adminSession)
        setUser({
          email: admin.email,
          id: admin.id || admin.email,
          name: admin.name || null,
          role: 'admin',
        })
        setLoading(false)
        return
      } catch (e) {
        console.error('Error parsing admin session:', e)
        localStorage.removeItem('admin_session')
      }
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const payload = decodeJwtPayload(token)
      if (!payload) {
        localStorage.removeItem('token')
        setUser(null)
        setLoading(false)
        return
      }

      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        localStorage.removeItem('token')
        setUser(null)
        setLoading(false)
        return
      }

      if (payload.sub && payload.email) {
        const normalizedCompanyRole = normalizeCompanyRole(
          payload.company_role || payload.companyRole || payload.role
        )
        const basicUser: AuthUser = {
          email: payload.email,
          id: payload.sub,
          role: payload.role || undefined,
          companyRole: normalizedCompanyRole,
          hasCompany: typeof payload.hasCompany === 'boolean' ? payload.hasCompany : undefined,
          companyId: payload.companyId || null,
        }
        fallbackUserRef.current = basicUser
        setUser(basicUser)
        setLoading(false)
        return
      }

      localStorage.removeItem('token')
      setUser(null)
      setLoading(false)
    } catch (e) {
      console.error('Error decoding token:', e)
      localStorage.removeItem('token')
      setUser(null)
      setLoading(false)
    }
  }, [])

  // Background profile enrichment (does not block UI)
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    // Dedicated admin login: skip /api/user/me (saves a round-trip and avoids extra setUser churn on admin routes)
    if (typeof window !== 'undefined' && localStorage.getItem('admin_session')) {
      return
    }

    const fallbackUser = fallbackUserRef.current
    if (!fallbackUser) return

    // Cancel any previous in-flight profile sync to avoid cross-session races.
    profileSyncAbortRef.current?.abort()
    const controller = new AbortController()
    profileSyncAbortRef.current = controller
    const timeoutId = setTimeout(() => controller.abort(), 20000)

    const run = async () => {
      try {
        // Same-origin proxy avoids calling :3001 directly and survives cold/slow backends better.
        const profileUrl =
          typeof window !== 'undefined'
            ? `${window.location.origin}/api/user/me`
            : `${getBackendBaseUrl() || 'http://localhost:3001'}/api/user/me`
        const resp = await fetch(profileUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Ignore stale responses from an older session token.
        if (localStorage.getItem('token') !== token) {
          return
        }

        if (resp.ok) {
          const userData = await resp.json()
          const mapped: AuthUser = {
            name: userData.name || null,
            username: userData.username || null,
            email: userData.email,
            id: userData.id || userData.user_id,
            created_at: userData.created_at,
            role: userData.role,
            companyRole: normalizeCompanyRole(
              userData.company_role || userData.companyRole || userData.role || null
            ),
            hasCompany: userData.hasCompany ?? false,
            companyId: userData.companyId || null,
            companyName: userData.companyName || null,
            companyEmail: userData.companyEmail || null,
            hrEmail: userData.hrEmail || null,
            hiringManagerEmail: userData.hiring_manager_email || userData.hiringManagerEmail || null,
            companyLogoUrl: userData.companyLogoUrl || null,
            companyLocation: userData.companyLocation || null,
          }

          if (
            shouldRequireCompanySetup({
              role: userData.role,
              companyRole: normalizeCompanyRole(
                userData.company_role || userData.companyRole || userData.role || null
              ),
              hasCompany: userData.hasCompany,
              companyId: userData.companyId || null,
            })
          ) {
            setUser({ ...mapped, hasCompany: false, companyId: undefined })
            fallbackUserRef.current = { ...mapped, hasCompany: false, companyId: undefined }
          } else if (userData.companyId && !userData.hasCompany) {
            setUser({ ...mapped, hasCompany: true })
            fallbackUserRef.current = { ...mapped, hasCompany: true }
          } else {
            setUser(mapped)
            fallbackUserRef.current = mapped
          }
        } else if (resp.status === 401) {
          console.warn('Profile endpoint returned 401; keeping fallback session user')
          setUser(fallbackUser)
        } else if (resp.status === 403) {
          console.warn('Access denied (403) but keeping user session with basic info')
          setUser(fallbackUser)
        } else {
          console.error('Error fetching user profile:', resp.status, 'keeping basic user info')
          setUser(fallbackUser)
        }
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId)
        if (localStorage.getItem('token') !== token) {
          return
        }
        const errName = fetchError instanceof Error ? fetchError.name : ''
        if (errName === 'AbortError') {
          if (process.env.NODE_ENV === 'development') {
            console.debug(
              '[auth] Profile enrichment timed out; using JWT claims until /api/user/me succeeds.'
            )
          }
        } else {
          console.error('Error fetching user profile:', fetchError, 'keeping basic user info')
        }
        setUser(fallbackUser)
      }
    }

    void run()

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
      if (profileSyncAbortRef.current === controller) {
        profileSyncAbortRef.current = null
      }
    }
  }, [user?.id])

  const signUp = async (
    name: string,
    email: string,
    password: string,
    company_role: string,
    organization_name: string,
    company_email: string,
    hr_email: string,
    hiring_manager_email: string,
    captchaToken?: string
  ) => {
    try {
      // Use same-origin proxy (server resolves BACKEND_URL) — avoids CORS and 405 errors on production.
      const signUpUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/api/auth/signup`
          : `${getBackendBaseUrl() || 'http://localhost:3001'}/auth/signup`
          
      const normalizedSignupRole = normalizeCompanyRole(company_role) || company_role
      const resp = await fetch(signUpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          company_role: normalizedSignupRole,
          company_name: organization_name, 
          company_email, 
          hr_email,
          hiring_manager_email,
          captchaToken
        }),
        signal: AbortSignal.timeout(20000)
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) {
        return { error: { message: data?.error || data?.details || 'Sign up failed' } }
      }
      if (data?.token) {
        profileSyncAbortRef.current?.abort()
        localStorage.setItem('token', data.token)
        const resolvedRole = data?.user?.company_role || data?.user?.role || normalizedSignupRole
        const isCandidate = resolvedRole === 'candidate'
        const nextUser: AuthUser = {
          name: data?.user?.name || name,
          email: email.toLowerCase(),
          id: data?.user?.id || data?.user?.user_id,
          created_at: data?.user?.created_at,
          role: data?.user?.role,
          companyRole: normalizeCompanyRole(resolvedRole),
          hasCompany: isCandidate ? false : data?.company ? true : (data?.user?.hasCompany ?? false),
          companyId: isCandidate ? undefined : data?.company?.company_id || data?.user?.companyId || null,
          companyName: isCandidate ? undefined : data?.company?.company_name || data?.user?.companyName || organization_name,
          companyEmail: isCandidate ? undefined : data?.company?.company_email || data?.user?.companyEmail || company_email,
          hrEmail: isCandidate ? undefined : data?.company?.hr_email || data?.user?.hrEmail || hr_email,
          hiringManagerEmail: isCandidate
            ? undefined
            : data?.company?.hiring_manager_email || data?.user?.hiringManagerEmail || hiring_manager_email,
          companyLogoUrl: isCandidate ? undefined : data?.company?.company_logo_url || data?.user?.companyLogoUrl || null,
          companyLocation: isCandidate ? undefined : data?.company?.company_location || data?.user?.companyLocation || null,
        }
        setUser(nextUser)
        fallbackUserRef.current = nextUser
      }
      return {
        error: null,
        needsEmailVerification: data?.needsEmailVerification === true,
        email: data?.user?.email || email?.toLowerCase()
      }
    } catch (err) {
      // Network error or other fetch errors
      const errorMessage = err instanceof Error ? err.message : 'Network error'
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        return { error: { message: 'Cannot connect to server. Please check your internet connection and try again.' } }
      }
      return { error: { message: errorMessage } }
    } finally {
      // No setLoading(false) - we didn't set it at start
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // Same-origin proxy (server resolves BACKEND_URL / NEXT_PUBLIC_BACKEND_URL) — avoids :3001 in the browser network log and CORS edge cases.
      const signInUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/api/auth/signin`
          : `${getBackendBaseUrl() || 'http://localhost:3001'}/auth/signin`
      const resp = await fetch(signInUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(15000),
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) {
        return { error: { message: data?.error || data?.details || 'Sign in failed' } }
      }
      if (data?.token) {
        profileSyncAbortRef.current?.abort()
        localStorage.setItem('token', data.token)
        const u = data?.user || {}
        const normalizedCompanyRole = normalizeCompanyRole(u.company_role || u.role)
        const isCandidate = normalizedCompanyRole === 'candidate'
        // Job seekers: keep employer/company fields empty so UI routes to the candidate dashboard, not company-setup.
        const nextUser: AuthUser = {
          username: u.username || null,
          name: u.name || null,
          email: email.toLowerCase(),
          id: u.id || u.user_id,
          created_at: u.created_at,
          role: u.role,
          companyRole: normalizedCompanyRole,
          hasCompany: isCandidate ? false : (u.hasCompany ?? false),
          companyId: isCandidate ? undefined : (u.companyId || null),
          companyName: isCandidate ? undefined : (u.companyName || null),
          companyEmail: isCandidate ? undefined : (u.companyEmail || null),
          hrEmail: isCandidate ? undefined : (u.hrEmail || null),
          hiringManagerEmail: isCandidate ? undefined : (u.hiringManagerEmail || null),
          companyLogoUrl: isCandidate ? undefined : (u.companyLogoUrl || null),
          companyLocation: isCandidate ? undefined : (u.companyLocation || null),
        }
        setUser(nextUser)
        fallbackUserRef.current = nextUser
      }
      return { error: null }
    } catch (err) {
      // Network error or other fetch errors
      const errorMessage = err instanceof Error ? err.message : 'Network error'
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        return { error: { message: 'Cannot connect to server. Please check your internet connection and try again.' } }
      }
      return { error: { message: errorMessage } }
    } finally {
      // Keep auth context non-blocking during sign-in.
    }
  }

  const signOut = async (options?: SignOutOptions) => {
    profileSyncAbortRef.current?.abort()
    localStorage.removeItem('token')
    localStorage.removeItem('admin_session')
    localStorage.removeItem('admin_email')
    localStorage.removeItem('admin_name')
    localStorage.removeItem('admin_token')
    fallbackUserRef.current = null

    const next =
      options?.next === false ? null : typeof options?.next === 'string' ? options.next : '/auth/signin'

    // Full navigation avoids an extra React pass where the dashboard shows a skeleton while
    // `router.push` runs — the main cause of “logout just keeps loading”.
    if (typeof window !== 'undefined' && next) {
      window.location.replace(next)
      return
    }

    setUser(null)
    setLoading(false)
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
