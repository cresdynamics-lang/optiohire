'use client'

import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-slate-600" />
        <p className="text-slate-600">Loading admin section...</p>
      </div>
    </div>
  )
}
