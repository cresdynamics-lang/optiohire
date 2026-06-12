'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Briefcase, ChevronRight, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { ThemeToggle } from '@/components/theme-toggle'

const hrNavigation = [
  { name: 'Home', href: '/' },
  { name: 'Jobs', href: '/jobs' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Use Cases', href: '/use-cases' },
  { name: 'About', href: '/about' },
  { name: 'Security', href: '/security' },
  { name: 'Demo', href: '/demo' },
]

export function Navbar() {
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [candidateMode, setCandidateMode] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const pathname = usePathname()

  // Get dashboard link based on role
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

  // Auto-detect candidate mode based on pathname
  useEffect(() => {
    const isJobsRoute = pathname?.startsWith('/jobs') || pathname?.startsWith('/apply')
    setCandidateMode(isJobsRoute || false)
  }, [pathname])

  // Close mobile menu on resize or route change
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

  return (
    <header className="sticky left-0 right-0 top-0 z-[100] border-b border-slate-200 bg-white">
      <nav ref={navRef} className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 z-10">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <Image
              src="/assets/logo/logo-removebg-preview.png"
              alt="OptioHire logo"
              width={64}
              height={64}
              className="h-[64px] w-[64px] rounded-md object-contain"
              priority
            />
            <span className="headline-platform text-xl tracking-tight md:text-2xl !font-semibold">
              OptioHire
            </span>
          </Link>
        </div>

        {/* Desktop center nav — HR mode */}
        {!candidateMode && (
          <div className="hidden lg:flex lg:flex-1 lg:justify-center">
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {hrNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    pathname === item.href
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Desktop center nav — Candidate mode */}
        {candidateMode && (
          <div className="hidden lg:flex lg:flex-1 lg:justify-center">
            <div className="flex items-center gap-1 rounded-xl border border-blue-100 bg-blue-50 p-1">
              <Link
                href="/jobs"
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  pathname === '/jobs' || pathname?.startsWith('/jobs/')
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-blue-600 hover:bg-white/80 hover:text-blue-700'
                }`}
              >
                Browse Jobs
              </Link>
              <Link
                href="https://applications.optiohire.com"
                className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-blue-600 hover:bg-white/80 hover:text-blue-700 transition-colors duration-200"
              >
                My Applications
              </Link>
            </div>
          </div>
        )}

        {/* Desktop right side */}
        <div className="hidden lg:flex lg:items-center lg:flex-shrink-0 lg:gap-2">
          {/* Theme Toggle */}
          <ThemeToggle className="mr-2" />

          {/* Mode toggle pill */}
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium mr-1">
            <Link
              href="/"
              onClick={() => setCandidateMode(false)}
              className={`rounded-full px-3 py-1.5 transition-all duration-200 whitespace-nowrap ${
                !candidateMode
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              For HR
            </Link>
            <Link
              href="/jobs"
              onClick={() => setCandidateMode(true)}
              className={`rounded-full px-3 py-1.5 transition-all duration-200 whitespace-nowrap flex items-center gap-1 ${
                candidateMode
                  ? 'bg-blue-600 text-white shadow-sm'
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
              className={`whitespace-nowrap rounded-2xl px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 flex items-center gap-2 ${
                candidateMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-black'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
          ) : candidateMode ? (
            <Link
              href="/jobs"
              className="whitespace-nowrap rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 flex items-center gap-1.5"
            >
              Browse Jobs
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/auth/options?mode=signin"
                className="whitespace-nowrap rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900"
              >
                Sign In
              </Link>
              <Link
                href="/auth/options?mode=signup"
                className="whitespace-nowrap rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-black"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="relative z-10 flex min-h-[40px] min-w-[40px] flex-shrink-0 items-center justify-center p-2 text-slate-700 transition-colors hover:text-slate-900 lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-slate-900" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6 text-slate-900" aria-hidden="true" />
          )}
        </button>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full z-[200] mt-2 translate-y-0 overflow-hidden rounded-2xl border border-slate-200 bg-white opacity-100 shadow-xl shadow-slate-900/10 transition-all duration-200 lg:hidden">
            <div className="px-4 py-4 space-y-2">
              {/* Theme toggle in mobile */}
              <div className="flex items-center justify-between p-2 mb-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-sm font-medium text-slate-700">Theme</span>
                <ThemeToggle />
              </div>

              {/* Mode toggle in mobile */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 mb-3">
                <button
                  onClick={() => setCandidateMode(false)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
                    !candidateMode ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  For HR Teams
                </button>
                <button
                  onClick={() => setCandidateMode(true)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
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
                          : 'text-slate-700 hover:bg-slate-50/80 hover:text-slate-900'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  {user ? (
                    <Link
                      href={getDashboardLink()}
                      className="mt-2 block rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white flex items-center justify-center gap-2"
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
                        className="mt-2 block rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/jobs"
                    className="block rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm font-medium text-blue-700"
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
                      className="mt-2 block rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white flex items-center justify-center gap-2"
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
