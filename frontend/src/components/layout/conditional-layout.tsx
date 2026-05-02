'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/footer/footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check pathname immediately - no need to wait for mount
  // usePathname() works on both server and client
  const isDashboard = pathname?.startsWith('/dashboard') || false
  const isAuth = pathname?.startsWith('/auth') || false
  const isAdmin = pathname?.startsWith('/admin') || false
  const isPrivacy = pathname === '/privacy' || false

  // Hide navbar and footer for dashboard, auth, admin, and privacy pages
  if (isDashboard || isAuth || isAdmin || isPrivacy) {
    return <>{children}</>
  }

  // Fixed navbar: reserve top padding from the first paint so content does not jump when the
  // navbar appears after mount (removes a common “page refreshed” flash on marketing pages).
  const mainClass = 'pt-20 min-h-[60vh]'

  // Navbar/footer render after mount to avoid SSR/CSR markup mismatches; padding stays stable.
  if (!mounted) {
    return <main className={mainClass}>{children}</main>
  }

  return (
    <>
      <Navbar />
      <main className={mainClass}>{children}</main>
      <Footer />
    </>
  )
}
