'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Jobs', href: '/jobs' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Use Cases', href: '/use-cases' },
  { name: 'About', href: '/about' },
  { name: 'Security', href: '/security' },
  { name: 'Demo', href: '/demo' },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const pathname = usePathname()

  // Close mobile menu when clicking outside, on resize, or route change
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false)
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && navRef.current && !navRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    if (mobileMenuOpen) {
      // Use setTimeout to avoid immediate close when opening
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobileMenuOpen])

  return (
    <header
      className="sticky left-0 right-0 top-0 z-[100] border-b border-slate-200 bg-white"
    >
      <nav ref={navRef} className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 z-10">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <Image
              src="/assets/logo/logo.png"
              alt="OptioHire logo"
              width={34}
              height={34}
              className="h-[34px] w-[34px] rounded-md object-contain"
              priority
            />
            <span className="headline-platform text-xl tracking-tight md:text-2xl !font-semibold">
              OptioHire
            </span>
          </Link>
        </div>

        {/* Desktop navigation - visible on lg screens and above */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-center">
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
            {navigation.map((item) => (
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

        {/* Desktop auth buttons - visible on lg screens and above */}
        <div className="hidden lg:flex lg:items-center lg:flex-shrink-0 lg:gap-2">
          <Link
            href="/auth/signin"
            className="whitespace-nowrap rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="whitespace-nowrap rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-black"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu button - visible on small screens */}
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

        {/* Mobile menu dropdown - visible on small screens when open */}
        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full z-[200] mt-2 translate-y-0 overflow-hidden rounded-2xl border border-slate-200 bg-white opacity-100 shadow-xl shadow-slate-900/10 transition-all duration-200 lg:hidden">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => (
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
              {/* Mobile auth buttons */}
              <Link
                href="/auth/signin"
                prefetch={process.env.NODE_ENV === 'production'}
                className="mt-2 block rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                prefetch={process.env.NODE_ENV === 'production'}
                className="mt-2 block rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white transition-colors duration-200 hover:bg-black"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
