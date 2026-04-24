'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Why Us', href: '/why-optiohire' },
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 14)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled
          ? 'border-b border-slate-200/70 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 shadow-sm shadow-slate-900/5'
          : 'border-b border-transparent bg-white/45 backdrop-blur-md supports-[backdrop-filter]:bg-white/35'
      }`}
    >
      <nav ref={navRef} className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 z-10">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center">
            <span className="text-[rgb(var(--ink-navy))] text-xl md:text-2xl font-semibold tracking-tight">
              OptioHire
            </span>
          </Link>
        </div>

        {/* Desktop navigation - visible on lg screens and above */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-8 lg:flex-1 lg:justify-center">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                pathname === item.href ? 'text-primary' : 'text-slate-600 hover:text-[rgb(var(--ink-navy))]'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Get Started button - visible on lg screens and above */}
        <div className="hidden lg:flex lg:items-center lg:flex-shrink-0">
          <Link
            href="/auth/signup"
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-blue-700 transition-all duration-200 whitespace-nowrap shadow-sm shadow-blue-500/25 hover:shadow-md hover:shadow-blue-500/35"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu button - visible on small screens */}
        <button
          type="button"
          className="lg:hidden p-2 text-slate-700 hover:text-[rgb(var(--ink-navy))] transition-colors flex-shrink-0 z-10 relative flex items-center justify-center min-w-[40px] min-h-[40px]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-[rgb(var(--ink-navy))]" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6 text-[rgb(var(--ink-navy))]" aria-hidden="true" />
          )}
        </button>

        {/* Mobile menu dropdown - visible on small screens when open */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 lg:hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-xl shadow-slate-900/10 backdrop-blur-md overflow-hidden z-[200] opacity-100 transform translate-y-0 transition-all duration-200">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-4 py-3 font-medium text-sm rounded-lg transition-colors duration-200 ${
                    pathname === item.href
                      ? 'text-primary bg-blue-50/80'
                      : 'text-slate-700 hover:text-[rgb(var(--ink-navy))] hover:bg-slate-50/80'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {/* Mobile Get Started button */}
              <Link
                href="/auth/signup"
                className="block px-4 py-3 mt-2 bg-primary text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition-colors duration-200 text-center"
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
