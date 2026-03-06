'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(errorParam === 'access_denied' ? 'You cancelled sign in.' : 'Google sign-in failed.')
      return
    }
    if (!code) {
      setError('Missing authorization code.')
      return
    }

    const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/auth/google/callback` : ''
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

    fetch(`${backendUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: redirectUri })
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
        localStorage.setItem('token', data.token)
        const user = data.user
        if (!user.hasCompany && !user.companyId) {
          router.replace('/company-setup')
          return
        }
        router.replace('/dashboard')
      })
      .catch(() => setError('Network error. Please try again.'))
  }, [searchParams, router])

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <p className="text-red-600 font-figtree mb-4">{error}</p>
        <a
          href="/auth/signin"
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
