'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
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
  const navRef = useRef<HTMLElement>(null)

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
    <header className="fixed top-0 left-0 right-0 z-[100] px-4 md:px-6 pt-6">
      <nav ref={navRef} className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8 rounded-2xl border border-white/40 bg-black/40 backdrop-blur-xl shadow-2xl shadow-black/50">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 z-10">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center">
            <span className="text-white text-xl md:text-2xl font-figtree font-light tracking-tight">
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
              className="text-white hover:text-white font-medium text-sm transition-colors duration-200 whitespace-nowrap"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Get Started button - visible on lg screens and above */}
        <div className="hidden lg:flex lg:items-center lg:flex-shrink-0">
          <Link
            href="/auth/signup"
            className="px-6 py-2 bg-white text-teal-600 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu button - visible on small screens */}
        <button
          type="button"
          className="lg:hidden p-2 text-white hover:text-white/80 transition-colors flex-shrink-0 z-10 relative flex items-center justify-center min-w-[40px] min-h-[40px]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-white" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6 text-white" aria-hidden="true" />
          )}
        </button>

        {/* Mobile menu dropdown - visible on small screens when open */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 lg:hidden bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-[200] opacity-100 transform translate-y-0 transition-all duration-200">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-3 text-gray-900 hover:text-teal-600 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {/* Mobile Get Started button */}
              <Link
                href="/auth/signup"
                className="block px-4 py-3 mt-2 bg-teal-600 text-white font-medium text-sm rounded-lg hover:bg-teal-700 transition-colors duration-200 text-center"
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
