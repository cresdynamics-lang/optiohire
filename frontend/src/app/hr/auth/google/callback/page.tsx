'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setSession } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')
    const statePortal = searchParams.get('state') // Read portal from state if available
    
    if (errorParam) {
      setError(errorParam === 'access_denied' ? 'You cancelled sign in.' : 'Google sign-in failed.')
      return
    }
    if (!code) {
      setError('Missing authorization code.')
      return
    }

    const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/auth/google/callback` : ''
    const apiUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/api/auth/google`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.optiohire.com'}/auth/google`

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code, 
        redirect_uri: redirectUri, 
        portal: statePortal || 'hr' // Use state if available, fallback to hardcoded hr
      })
    })
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (data.error) {
          setError(data.error)
          return
        }
        if (!data.token || !data.user) {
          setError('Invalid response from server.')
          return
        }
        
        // Use setSession to update AuthProvider state immediately
        setSession(data.token, data.user)
        
        const user = data.user
        const role = (user.role || '').toLowerCase()
        const companyRole = (user.company_role || user.companyRole || '').toLowerCase()
        const isCandidate = role === 'candidate' || companyRole === 'candidate'
        const isAdmin = role === 'admin'
        
        // Use full domain URL and path for redirection
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        let targetUrl = ''
        
        if (isLocalhost) {
          if (isCandidate) targetUrl = '/candidate'
          else if (isAdmin) targetUrl = '/admin'
          else if (!user.hasCompany && !user.companyId) targetUrl = '/company-setup'
          else targetUrl = '/hr'
        } else {
          // Production domain routing
          if (isCandidate) targetUrl = 'https://applications.optiohire.com'
          else if (isAdmin) targetUrl = 'https://console.optiohire.com'
          else if (!user.hasCompany && !user.companyId) targetUrl = 'https://optiohire.com/company-setup'
          else targetUrl = 'https://optiohire.com/hr'
        }
        
        window.location.href = targetUrl
      })
      .catch(() => setError('Network error. Please try again.'))
  }, [searchParams, router, setSession])

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <p className="text-red-600 font-figtree mb-4">{error}</p>
        <a
          href="/hr/auth/signin"
          className="text-blue-600 hover:underline font-figtree"
        >
          Back to sign in
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-8 h-8 border-4 border-[#2D2DDD] border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-gray-600 font-figtree">Completing sign in...</p>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
          <div className="w-8 h-8 border-4 border-[#2D2DDD] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  )
}
