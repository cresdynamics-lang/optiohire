'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Briefcase, ChevronRight, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const hrNavigation = [
  { name: 'Home', href: '/' },
  { name: 'Jobs', href: '/jobs' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Use Cases', href: '/use-cases' },
  { name: 'About', href: '/about' },
  { name: 'Security', href: '/security' },
  { name: 'Demo', href: '/demo' },
]

/** Marketing pages with full-bleed / dark heroes — navbar overlays until scroll */
const OVERLAY_PATHS = ['/use-cases', '/how-it-works', '/about']

export function Navbar() {
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [candidateMode, setCandidateMode] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const overlayHero = OVERLAY_PATHS.some((p) => pathname === p || pathname?.startsWith(`${p}/`))
  const onDark = overlayHero && !scrolled && !mobileMenuOpen

  const getDashboardLink = () => {
    if (!user) return '/auth/options?mode=signin'
    if (user.role === 'admin') return '/admin'

    const normalizedCompanyRole = user?.companyRole?.toLowerCase()
    const normalizedRole = user?.role?.toLowerCase()
    const isJobSeeker =
      normalizedCompanyRole === 'candidate' ||
      normalizedCompanyRole === 'job_seeker' ||
      normalizedCompanyRole === 'jobseeker' ||
      normalizedRole === 'candidate' ||
      normalizedRole === 'job_seeker' ||
      normalizedRole === 'jobseeker'

    return isJobSeeker ? '/candidate' : '/hr'
  }

  useEffect(() => {
    const isJobsRoute = pathname?.startsWith('/jobs') || pathname?.startsWith('/apply')
    setCandidateMode(isJobsRoute || false)
  }, [pathname])

  useEffect(() => {
    if (!overlayHero) {
      setScrolled(true)
      return
    }
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [overlayHero])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false)
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && navRef.current && !navRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    if (mobileMenuOpen) {
      setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 0)
    }
    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobileMenuOpen])

  const linkIdle = onDark
    ? 'text-white/70 hover:bg-white/10 hover:text-white'
    : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
  const linkActive = onDark
    ? 'bg-white/15 text-white'
    : 'bg-white text-slate-900 shadow-sm'

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-[100] transition-[background-color,border-color,backdrop-filter] duration-300 ${
        onDark
          ? 'border-b border-transparent bg-transparent'
          : 'border-b border-slate-200/90 bg-white/95 backdrop-blur-md'
      }`}
    >
      <nav ref={navRef} className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        <div className="z-10 flex flex-shrink-0 items-center">
          <Link href="/" className="-m-1.5 flex items-center gap-2.5 p-1.5">
            <Image
              src={onDark ? '/assets/logo/optiohire_mark_light.png' : '/assets/logo/optiohire_mark_dark.png'}
              alt="OptioHire logo"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              priority
            />
            <span
              className={`font-[family-name:var(--font-display-italic)] text-xl tracking-tight md:text-2xl ${
                onDark ? 'text-white' : 'text-[#0c121c]'
              }`}
            >
              OptioHire
            </span>
          </Link>
        </div>

        {!candidateMode && (
          <div className="hidden lg:flex lg:flex-1 lg:justify-center">
            <div
              className={`flex items-center gap-0.5 rounded-full p-1 ${
                onDark ? 'border border-white/15 bg-white/5' : 'border border-slate-200 bg-slate-50'
              }`}
            >
              {hrNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                    pathname === item.href ? linkActive : linkIdle
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {candidateMode && (
          <div className="hidden lg:flex lg:flex-1 lg:justify-center">
            <div className="flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 p-1">
              <Link
                href="/jobs"
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  pathname === '/jobs' || pathname?.startsWith('/jobs/')
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-blue-600 hover:bg-white/80 hover:text-blue-700'
                }`}
              >
                Browse Jobs
              </Link>
              <Link
                href="https://applications.optiohire.com"
                className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-blue-600 transition-colors duration-200 hover:bg-white/80 hover:text-blue-700"
              >
                My Applications
              </Link>
            </div>
          </div>
        )}

        <div className="hidden lg:flex lg:flex-shrink-0 lg:items-center lg:gap-2">
          <div
            className={`mr-1 flex items-center gap-1 rounded-full p-0.5 text-xs font-medium ${
              onDark ? 'border border-white/15 bg-white/5' : 'border border-slate-200 bg-slate-50'
            }`}
          >
            <Link
              href="/"
              onClick={() => setCandidateMode(false)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 transition-all duration-200 ${
                !candidateMode
                  ? onDark
                    ? 'bg-white text-[#0c121c] shadow-sm'
                    : 'bg-slate-900 text-white shadow-sm'
                  : onDark
                    ? 'text-white/60 hover:text-white'
                    : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              For HR
            </Link>
            <Link
              href="/jobs"
              onClick={() => setCandidateMode(true)}
              className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 transition-all duration-200 ${
                candidateMode
                  ? 'bg-blue-600 text-white shadow-sm'
                  : onDark
                    ? 'text-white/60 hover:text-white'
                    : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Briefcase className="h-3 w-3" />
              Jobs
            </Link>
          </div>

          {user ? (
            <Link
              href={getDashboardLink()}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 ${
                candidateMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : onDark
                    ? 'bg-white text-[#0c121c] hover:bg-white/90'
                    : 'bg-[#0c121c] text-white hover:bg-black'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
          ) : candidateMode ? (
            <Link
              href="/jobs"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700"
            >
              Browse Jobs
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/auth/options?mode=signin"
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  onDark
                    ? 'border border-white/25 text-white hover:bg-white/10'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                Sign In
              </Link>
              <Link
                href="/auth/options?mode=signup"
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 ${
                  onDark
                    ? 'bg-white text-[#0c121c] hover:bg-white/90'
                    : 'bg-[#0c121c] text-white hover:bg-black'
                }`}
              >
                Start Free Trial
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className={`relative z-10 flex min-h-[40px] min-w-[40px] flex-shrink-0 items-center justify-center p-2 transition-colors lg:hidden ${
            onDark ? 'text-white hover:text-white/80' : 'text-slate-700 hover:text-slate-900'
          }`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>

        {mobileMenuOpen && (
          <div className="absolute left-3 right-3 top-full z-[200] mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 lg:hidden">
            <div className="space-y-2 px-4 py-4">
              <div className="mb-3 flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setCandidateMode(false)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
                    !candidateMode ? 'bg-[#0c121c] text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  For HR Teams
                </button>
                <button
                  type="button"
                  onClick={() => setCandidateMode(true)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
                    candidateMode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  Browse Jobs
                </button>
              </div>

              {!candidateMode ? (
                <>
                  {hrNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                        pathname === item.href
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  {user ? (
                    <Link
                      href={getDashboardLink()}
                      className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#0c121c] px-4 py-3 text-center text-sm font-medium text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Go to Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/auth/options?mode=signin"
                        className="mt-2 block rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/options?mode=signup"
                        className="mt-2 block rounded-xl bg-[#0c121c] px-4 py-3 text-center text-sm font-medium text-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Start Free Trial
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/jobs"
                    className="block rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Browse All Jobs
                  </Link>
                  <Link
                    href="https://applications.optiohire.com"
                    className="block rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Applications
                  </Link>
                  {user && (
                    <Link
                      href={getDashboardLink()}
                      className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
