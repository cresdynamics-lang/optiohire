'use client'

import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D2DDD] mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading admin section...</p>
      </div>
    </div>
  )
}
