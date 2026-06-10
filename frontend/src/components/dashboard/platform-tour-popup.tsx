'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, Sparkles, HelpCircle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface PlatformTourPopupProps {
  onStartTour: () => void
}

export function PlatformTourPopup({ onStartTour }: PlatformTourPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    // Check if user has already opted out
    const optOut = localStorage.getItem('platform-tour-opt-out')
    if (optOut === 'true') return

    // Show popup after 5 seconds
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('platform-tour-opt-out', 'true')
    }
    setIsOpen(false)
  }

  const handleAccept = () => {
    if (dontShowAgain) {
      localStorage.setItem('platform-tour-opt-out', 'true')
    }
    setIsOpen(false)
    onStartTour()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 z-[101] w-[min(calc(100vw-2rem),28rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-slate-200 dark:border-gray-800"
          >
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-500">
                <Sparkles className="h-8 w-8" />
              </div>

              <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                New to OptioHire?
              </h3>
              
              <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
                Would you like a quick tour of the platform to learn how to hire 3x faster with AI-powered screening?
              </p>

              <div className="flex w-full flex-col gap-3">
                <Button
                  onClick={handleAccept}
                  className="h-12 w-full rounded-xl bg-[#2D2DDD] text-sm font-semibold text-white hover:bg-[#2525c4]"
                >
                  Yes, show me around
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="h-12 w-full rounded-xl border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:text-slate-400 dark:hover:bg-gray-800"
                >
                  Maybe later
                </Button>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <Checkbox
                  id="dont-show-tour"
                  checked={dontShowAgain}
                  onCheckedChange={(checked) => setDontShowAgain(!!checked)}
                />
                <label
                  htmlFor="dont-show-tour"
                  className="text-xs font-medium text-slate-500 dark:text-slate-500 cursor-pointer select-none"
                >
                  Don&apos;t show this again
                </label>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
