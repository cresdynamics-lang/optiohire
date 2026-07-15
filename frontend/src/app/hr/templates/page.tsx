'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Templates now live under Settings → Templates */
export default function HrTemplatesRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/hr/settings?tab=templates')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2D2DDD] border-t-transparent" />
    </div>
  )
}
