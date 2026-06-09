'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/footer/footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()

  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/candidate') || pathname?.startsWith('/hr') || false
  const isAuth = pathname?.startsWith('/auth') || false
  const isAdmin = pathname?.startsWith('/admin') || false
  const isPrivacy = pathname === '/privacy' || false

  // Hide navbar and footer for dashboard, auth, admin, and privacy pages
  if (isDashboard || isAuth || isAdmin || isPrivacy) {
    return <>{children}</>
  }

  // Always render Navbar + Footer on public pages — no mount gate.
  // The pt-20 reserves space for the fixed navbar so content never jumps.
  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-[60vh]">{children}</main>
      <Footer />
    </>
  )
}
