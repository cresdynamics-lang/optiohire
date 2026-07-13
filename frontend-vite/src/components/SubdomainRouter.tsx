import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getSubdomainRewritePath } from '../lib/portal'

/**
 * Client-side subdomain rewrite (replaces Next.js middleware rewrites).
 * console.* → /admin, applications.* → /candidate
 */
export function SubdomainRouter({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const rewrite = getSubdomainRewritePath(window.location.hostname, location.pathname)
    if (rewrite && rewrite !== location.pathname) {
      navigate(rewrite, { replace: true })
    }
  }, [location.pathname, navigate])

  return <>{children}</>
}
