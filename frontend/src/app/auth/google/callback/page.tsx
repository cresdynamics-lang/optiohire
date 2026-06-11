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
    // 1. Check for token in URL (Session Transfer from another subdomain)
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl)
      // Small delay to ensure localStorage is set before redirecting
      setTimeout(() => {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        const isCandidateSubdomain = window.location.hostname.startsWith('applications.') || window.location.hostname.startsWith('candidate.')
        
        if (isLocalhost) {
          router.replace(isCandidateSubdomain ? '/candidate' : '/hr')
        } else {
          // In production, the current hostname tells us where we are
          router.replace('/') // The app's logic will handle internal routing based on role
        }
      }, 100)
      return
    }

    // 2. Standard Google OAuth Code Exchange
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')
    const statePortal = searchParams.get('state') // Get portal from state
    
    if (errorParam) {
      setError(errorParam === 'access_denied' ? 'You cancelled sign in.' : 'Google sign-in failed.')
      return
    }
    if (!code) {
      setError('Missing authorization code.')
      return
    }

    // Origin-aware redirect URI (must match the one used in sign-in)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const redirectUri = isLocalhost 
      ? `${window.location.origin}/auth/google/callback`
      : 'https://optiohire.com/auth/google/callback'
      
    const apiUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/api/auth/google`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/auth/google`

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code, 
        redirect_uri: redirectUri,
        portal: statePortal || undefined // Pass portal for enforcement
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
        
        setSession(data.token, data.user)
        
        const user = data.user
        const role = (user.role || '').toLowerCase()
        const companyRole = (user.company_role || user.companyRole || '').toLowerCase()
        const isCandidate = role === 'candidate' || companyRole === 'candidate'
        const isAdmin = role === 'admin'
        
        let targetUrl = ''
        
        if (isLocalhost) {
          if (isCandidate) targetUrl = '/candidate'
          else if (isAdmin) targetUrl = '/admin'
          else if (!user.hasCompany && !user.companyId) targetUrl = '/company-setup'
          else targetUrl = '/hr'
          window.location.href = targetUrl
        } else {
          // Production domain routing with Session Transfer (token in URL)
          const tokenParam = `?token=${data.token}`
          const currentHost = window.location.hostname
          
          if (isCandidate) {
            targetUrl = `https://applications.optiohire.com/auth/google/callback${tokenParam}`
          } else if (isAdmin) {
            targetUrl = `https://console.optiohire.com/auth/google/callback${tokenParam}`
          } else {
            // Main domain: we can just use internal routing since token is already in localStorage
            if (!user.hasCompany && !user.companyId) targetUrl = '/company-setup'
            else targetUrl = '/hr'
          }
          
          if (targetUrl.startsWith('http')) {
            window.location.href = targetUrl
          } else {
            router.replace(targetUrl)
          }
        }
      })
      .catch(() => setError('Network error. Please try again.'))
  }, [searchParams, router, setSession])

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <p className="text-red-600 font-figtree mb-4">{error}</p>
        <a
          href="/auth/options?mode=signin"
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
