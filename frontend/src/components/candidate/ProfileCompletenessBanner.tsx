'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

export function ProfileCompletenessBanner() {
  const { user } = useAuth()
  const [isIncomplete, setIsIncomplete] = useState(false)

  useEffect(() => {
    // Only check for candidates
    if (!user || (user.role !== 'candidate' && user.companyRole !== 'candidate')) return

    const checkProfile = async () => {
      try {
        const res = await fetch('/api/candidate/dashboard', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        if (res.ok) {
          const { data } = await res.json()
          if (data && data.profile) {
            // Profile is incomplete if it lacks both a bio and a job category, meaning they skipped onboarding
            if (!data.profile.bio && !data.profile.job_category && !data.profile.cv_url) {
              setIsIncomplete(true)
            }
          }
        }
      } catch (err) {
        console.error('Failed to check profile completeness:', err)
      }
    }
    checkProfile()
  }, [user])

  if (!isIncomplete) return null

  return (
    <div className="bg-red-50 border-b border-red-200 px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between flex-wrap gap-3 max-w-[1440px] mx-auto">
        <div className="flex items-center flex-1 min-w-0 gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-medium text-red-800 truncate">
            <span className="font-bold">Action Required:</span> Your profile is incomplete. You are not in the Talent Pool and are invisible to our AI matching and recruiters.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link
            href="/candidate/profile"
            className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition-colors"
          >
            Complete Profile Now
          </Link>
        </div>
      </div>
    </div>
  )
}
