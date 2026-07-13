/**
 * Subdomain → portal mapping (replaces frontend/src/middleware.ts logic).
 */

export type Portal = 'marketing' | 'admin' | 'candidate' | 'hr' | 'institutions'

const SUBDOMAIN_MAP: Record<string, Portal> = {
  console: 'admin',
  admin: 'admin',
  applications: 'candidate',
}

export function getSubdomain(hostname?: string): string {
  const host = hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '')
  const isLocalhost = host.includes('localhost') || host === '127.0.0.1'
  const parts = host.split('.')
  if (isLocalhost && parts.length >= 2) return parts[0].toLowerCase()
  if (parts.length >= 3) return parts[0].toLowerCase()
  return ''
}

export function getPortalFromHost(hostname?: string): Portal {
  const sub = getSubdomain(hostname)
  return SUBDOMAIN_MAP[sub] ?? 'marketing'
}

export function getPortalFromPath(pathname: string): Portal {
  if (pathname.startsWith('/admin') || pathname.startsWith('/console')) return 'admin'
  if (pathname.startsWith('/candidate') || pathname.startsWith('/applications')) return 'candidate'
  if (pathname.startsWith('/hr')) return 'hr'
  if (pathname.startsWith('/institutions')) return 'institutions'
  return 'marketing'
}

export function resolvePortal(hostname?: string, pathname?: string): Portal {
  const fromHost = getPortalFromHost(hostname)
  if (fromHost !== 'marketing') return fromHost
  return getPortalFromPath(pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/'))
}

/** Subdomain rewrite target — mirrors Next middleware internal paths */
export function getSubdomainRewritePath(hostname: string, pathname: string): string | null {
  const sub = getSubdomain(hostname)
  const mapping: Record<string, string> = {
    console: '/admin',
    admin: '/admin',
    applications: '/candidate',
  }
  const internal = mapping[sub]
  if (!internal) return null
  if (pathname.startsWith(internal)) return null
  if (pathname.startsWith('/api') || pathname.startsWith('/assets') || pathname.includes('.')) return null
  return `${internal}${pathname === '/' ? '' : pathname}`
}
