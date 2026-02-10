'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export function BottomCtaBanner() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show banner after scrolling down a bit
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Show when user has scrolled 30% of the page or is near bottom
      const showThreshold = Math.min(documentHeight * 0.3, documentHeight - windowHeight - 200)
      setIsVisible(scrollY > showThreshold)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-teal-600 shadow-lg border-t border-teal-500"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              {/* Left side - Message */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="text-white">
                  <p className="text-sm font-medium truncate">
                    Ready to transform your hiring?
                  </p>
                  <p className="text-xs text-teal-100 hidden sm:block">
                    Free consultation • No commitment required
                  </p>
                </div>
              </div>

              {/* Center - CTA */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="px-4 py-2 bg-white text-teal-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm whitespace-nowrap"
                >
                  Request Demo
                </button>
                <button
                  onClick={() => router.push('/contact')}
                  className="px-4 py-2 border border-white text-white font-semibold rounded-lg hover:bg-white/20 transition-colors duration-200 text-sm whitespace-nowrap hidden sm:block"
                >
                  Contact Sales
                </button>
              </div>

              {/* Right side - Close button */}
              <div className="flex items-center ml-3">
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1 text-teal-200 hover:text-white transition-colors duration-200 rounded"
                  aria-label="Close banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

