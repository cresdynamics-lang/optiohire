/**
 * Typed API client for direct backend communication.
 * During dev, Vite proxy also serves /api/* same-origin for legacy fetch paths.
 */

const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    // Same-origin in dev (proxy) and production (Nginx routes /api to backend)
    return ''
  }
  return import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3001'
}

export function getBackendUrl(): string {
  return import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3001'
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('admin_token') || localStorage.getItem('token')
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const base = getApiBase()
  const headers = new Headers(init.headers)

  if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const adminEmail = localStorage.getItem('admin_email')
  if (adminEmail && !headers.has('X-Admin-Email')) {
    headers.set('X-Admin-Email', adminEmail)
  }

  return fetch(`${base}${path}`, { ...init, headers })
}

export async function apiJson<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = (data as { error?: string })?.error || `Request failed (${res.status})`
    throw new Error(err)
  }
  return data as T
}

/** Map frontend /api paths to real backend paths (see docs/migration/API_CONTRACT.md) */
export const API_PATHS = {
  auth: {
    signin: '/api/auth/signin',
    signup: '/api/auth/signup',
    adminSignin: '/api/auth/admin-signin',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
    hrSignin: '/api/hr/auth/signin',
    hrSignup: '/api/hr/auth/signup',
    candidateSignin: '/api/candidate/auth/signin',
    candidateSignup: '/api/candidate/auth/signup',
  },
  user: {
    me: '/api/user/me',
    company: '/api/user/company',
  },
  jobs: {
    public: '/api/job-postings/public',
    publicById: (id: string) => `/api/job-postings/public/${id}`,
  },
  contact: '/api/contact',
  institutionApplications: '/api/institution-applications',
} as const
