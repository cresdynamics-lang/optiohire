'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/footer/footer'
import { CookieConsent } from '@/components/ui/cookie-consent'
import { useAuth } from '@/hooks/use-auth'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [host, setHost] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHost(window.location.host)
    }
  }, [])

  const isSubdomain = host.startsWith('console.') || host.startsWith('admin.') || host.startsWith('candidate.') || host.startsWith('applications.')
  const isDashboardPath = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/candidate') || 
    pathname.startsWith('/hr') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/console') ||
    pathname.startsWith('/institutions') ||
    pathname === '/privacy'

  // Determine if Navbar and Footer should be rendered
  const isAppInterface = isSubdomain || isDashboardPath
  
  // Show Navbar if:
  // 1. Not logged in and not in an app interface (standard landing page behavior)
  // 2. OR logged in on the main domain (optiohire.com) and not on the HR path
  const isMainDomain = !isSubdomain && (host.includes('optiohire.com') || host.includes('localhost'))
  const showNavbar = !loading && (
    (!user && !isAppInterface) || 
    (user && isMainDomain && !pathname.startsWith('/hr') && !pathname.startsWith('/institutions'))
  )
  
  const showFooter = !isAppInterface
  const showCookieConsent = !isAppInterface
  const isHome = pathname === '/'

  return (
    <>
      {showNavbar && <Navbar />}
      <main className={showNavbar && !isHome ? "pt-20 min-h-[60vh]" : "min-h-[60vh]"}>{children}</main>
      {showCookieConsent && <CookieConsent />}
      {showFooter && <Footer />}
    </>
  )
}
