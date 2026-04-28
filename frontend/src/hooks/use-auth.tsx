'use client'

import { createContext, useContext, useState, useEffect } from 'react'

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
}

interface AuthContextType {
  user: null | AuthUser
  loading: boolean
  signUp: (name: string, email: string, password: string, company_role: string, organization_name: string, company_email: string, hiring_manager_email: string) => Promise<{ error: null | { message: string }; needsEmailVerification?: boolean; email?: string }>
  signIn: (email: string, password: string) => Promise<{ error: null | { message: string } }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function normalizeCompanyRole(value?: string | null): string | null {
  if (!value) return null
  const role = value.toLowerCase().trim()
  if (role === 'candidate' || role === 'job_seeker' || role === 'jobseeker') {
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
  if (normalizeCompanyRole(user.companyRole) === 'candidate') return false
  return user.hasCompany === false && !user.companyId
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<null | AuthUser>(null)
  const [loading, setLoading] = useState(true) // Start as true to check token on mount
  const getBackendBaseUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim()
    if (envUrl) return envUrl.replace(/\/$/, '')
    if (typeof window !== 'undefined') {
      const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname)
      if (isLocalHost) return 'http://localhost:3001'
    }
    return ''
  }

  // Check for existing token on mount and fetch full user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      // Check for admin session first (bypasses regular auth)
      const adminSession = localStorage.getItem('admin_session')
      if (adminSession) {
        try {
          const admin = JSON.parse(adminSession)
          setUser({
            email: admin.email,
            id: admin.id || admin.email,
            name: admin.name || null,
            role: 'admin'
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
        setLoading(false)
        return
      }

      try {
        // Try to decode token to get basic user info
        const payload = decodeJwtPayload(token)
        if (!payload) {
          console.log('Invalid token payload')
          localStorage.removeItem('token')
          setUser(null)
          setLoading(false)
          return
        }
        
        // Check token expiration
        const now = Math.floor(Date.now() / 1000)
        if (payload.exp && payload.exp < now) {
          // Token expired
          console.log('Token expired')
          localStorage.removeItem('token')
          setUser(null)
          setLoading(false)
          return
        }
        
        if (payload.sub && payload.email) {
          const normalizedCompanyRole = normalizeCompanyRole(payload.company_role || payload.companyRole)
          // Set basic user info immediately (non-blocking) for fast UI
          // Include role from token if available
          const basicUser = {
            email: payload.email,
            id: payload.sub,
            role: payload.role || undefined,
            companyRole: normalizedCompanyRole,
            hasCompany: typeof payload.hasCompany === 'boolean' ? payload.hasCompany : undefined,
            companyId: payload.companyId || null,
          }
          setUser(basicUser)
          
          // Set loading to false immediately so UI can render
          setLoading(false)
          
          // Store basic user as fallback in case API call fails
          let fallbackUser = basicUser

          // Fetch full user profile from backend in background (non-blocking)
          // Use AbortController for timeout
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
          
          try {
          const backendUrl = getBackendBaseUrl()
          if (!backendUrl) {
            clearTimeout(timeoutId)
            setUser(fallbackUser)
            return
          }
          const resp = await fetch(`${backendUrl}/api/user/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
              },
              signal: controller.signal
          })

            clearTimeout(timeoutId)

          if (resp.ok) {
            const userData = await resp.json()
            setUser({
              name: userData.name || null,
              username: userData.username || null,
              email: userData.email,
              id: userData.id || userData.user_id,
              created_at: userData.created_at,
              role: userData.role,
              companyRole: normalizeCompanyRole(userData.company_role || userData.companyRole || null),
              hasCompany: userData.hasCompany ?? false,
              companyId: userData.companyId || null,
              companyName: userData.companyName || null,
              companyEmail: userData.companyEmail || null,
              hrEmail: userData.hrEmail || null,
              hiringManagerEmail: userData.hiring_manager_email || userData.hiringManagerEmail || null,
              companyLogoUrl: userData.companyLogoUrl || null
            })
            
            // User has no company (e.g. signed up with Google): keep token and user, redirect to company-setup in layout
            if (shouldRequireCompanySetup({
              role: userData.role,
              companyRole: normalizeCompanyRole(userData.company_role || userData.companyRole || null),
              hasCompany: userData.hasCompany,
              companyId: userData.companyId || null,
            })) {
              setUser({
                ...userData,
                hasCompany: false,
                companyId: null
              })
            } else if (userData.companyId && !userData.hasCompany) {
              // If companyId exists but hasCompany is false, set it to true
              setUser({
                ...userData,
                hasCompany: true
              })
            }
            } else if (resp.status === 401) {
              // Do not clear session aggressively here; network/proxy mismatches can transiently return 401.
              // Keep the fallback user from token so the app does not hard-log users out unexpectedly.
              console.warn('Profile endpoint returned 401; keeping fallback session user')
              setUser(fallbackUser)
            } else if (resp.status === 403) {
              // Access denied but token might be valid - keep basic user info
              console.warn('Access denied (403) but keeping user session with basic info')
              // Keep the basic user info from token
              setUser(fallbackUser)
            } else {
              // Other error (500, etc.) - keep user logged in with basic info
              console.error('Error fetching user profile:', resp.status, 'keeping basic user info')
              setUser(fallbackUser)
            }
          } catch (fetchError: any) {
            clearTimeout(timeoutId)
            // If it's an abort (timeout) or network error, keep the basic user info
            if (fetchError.name === 'AbortError') {
              console.warn('User profile fetch timed out, using basic info from token')
            } else {
              console.error('Error fetching user profile:', fetchError, 'keeping basic user info')
            }
            // Always keep the basic user info from token on network errors
            setUser(fallbackUser)
          }
        } else {
          // Invalid token payload
          console.log('Invalid token payload')
          localStorage.removeItem('token')
          setUser(null)
          setLoading(false)
        }
      } catch (e) {
        // Invalid token format, remove it
        console.error('Error decoding token:', e)
        localStorage.removeItem('token')
        setUser(null)
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [])

  const signUp = async (name: string, email: string, password: string, company_role: string, organization_name: string, company_email: string, hiring_manager_email: string) => {
    try {
      // Don't set global loading here - it can cause AuthProvider to re-render and remount the signup form
      // Call backend directly to avoid dev-time Next API compilation lag on signup.
      // hr_email is set to company_email since the form doesn't have a separate hr_email field
      const backendUrl = getBackendBaseUrl()
      if (!backendUrl) {
        return { error: { message: 'Backend URL is not configured. Please set NEXT_PUBLIC_BACKEND_URL.' } }
      }
      const resp = await fetch(`${backendUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          company_role, 
          company_name: organization_name, 
          company_email, 
          hr_email: company_email, // Use company_email as hr_email
          hiring_manager_email 
        }),
        signal: AbortSignal.timeout(20000)
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) {
        return { error: { message: data?.error || data?.details || 'Sign up failed' } }
      }
      if (data?.token) {
        localStorage.setItem('token', data.token)
        const resolvedRole = data?.user?.company_role || company_role
        const isCandidate = resolvedRole === 'candidate'
        setUser({
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
          hrEmail: isCandidate ? undefined : data?.company?.hr_email || data?.user?.hrEmail || company_email,
          hiringManagerEmail: isCandidate
            ? undefined
            : data?.company?.hiring_manager_email || data?.user?.hiringManagerEmail || hiring_manager_email,
          companyLogoUrl: isCandidate ? undefined : data?.company?.company_logo_url || data?.user?.companyLogoUrl || null,
        })
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
      setLoading(true)
      // Call backend directly to avoid dev-time Next API route compile lag.
      const backendUrl = getBackendBaseUrl()
      if (!backendUrl) {
        return { error: { message: 'Backend URL is not configured. Please set NEXT_PUBLIC_BACKEND_URL.' } }
      }
      const resp = await fetch(`${backendUrl}/auth/signin`, {
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
        localStorage.setItem('token', data.token)
        const u = data?.user || {}
        const normalizedCompanyRole = normalizeCompanyRole(u.company_role)
        const isCandidate = normalizedCompanyRole === 'candidate'
        // Job seekers: keep employer/company fields empty so UI routes to the candidate dashboard, not company-setup.
        setUser({
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
        })
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
      setLoading(false)
    }
  }

  const signOut = async () => {
    localStorage.removeItem('token')
    localStorage.removeItem('admin_session')
    localStorage.removeItem('admin_email')
    localStorage.removeItem('admin_name')
    localStorage.removeItem('admin_token')
    setUser(null)
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
