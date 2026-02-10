'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000)
    }
  }, [])

  const applyCookiePreferences = (accepted: boolean) => {
    // Set cookies based on preferences
    if (accepted) {
      // Enable all cookies
      document.cookie = `analytics_enabled=true; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
      document.cookie = `marketing_enabled=true; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
      document.cookie = `functional_enabled=true; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
    } else {
      // Disable optional cookies
      document.cookie = `analytics_enabled=false; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
      document.cookie = `marketing_enabled=false; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
      document.cookie = `functional_enabled=false; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
    }

    // Always set necessary cookies
    document.cookie = `necessary_enabled=true; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`

    // Track consent timestamp
    document.cookie = `consent_timestamp=${Date.now()}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
  }

  const handleAcceptAll = () => {
    applyCookiePreferences(true)
    localStorage.setItem('cookie-consent', JSON.stringify({
      accepted: true,
      preferences: {
        necessary: true,
        analytics: true,
        marketing: true,
        functional: true,
      },
      timestamp: Date.now()
    }))
    setShowBanner(false)
  }

  const handleRejectAll = () => {
    applyCookiePreferences(false)
    localStorage.setItem('cookie-consent', JSON.stringify({
      accepted: false,
      preferences: {
        necessary: true,
        analytics: false,
        marketing: false,
        functional: false,
      },
      timestamp: Date.now()
    }))
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              {/* Left side - Message */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate">
                  We use cookies to enhance your experience.
                  <a href="/privacy" className="text-teal-600 hover:underline font-medium ml-1">
                    Learn more
                  </a>.
                </p>
              </div>

              {/* Right side - Buttons */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  Decline
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors duration-200"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

