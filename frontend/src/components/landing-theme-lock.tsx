'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * On landing and other public marketing pages, force dark theme so the
 * design stays consistent and "live" theme switching doesn't affect the page.
 */
const LANDING_PATHS = ['/', '/about', '/features', '/pricing', '/how-it-works', '/why-optiohire', '/use-cases', '/trust-security', '/contact']

export function LandingThemeLock() {
  const pathname = usePathname()
  const isLanding = pathname !== null && LANDING_PATHS.includes(pathname)

  useEffect(() => {
    const root = document.documentElement
    if (isLanding) {
      root.classList.add('dark')
      root.classList.remove('light')
    }
    return () => {
      if (isLanding) {
        // Restore control to ThemeProvider when leaving
        root.classList.remove('dark', 'light')
      }
    }
  }, [isLanding])

  return null
}
