'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'

/** Legacy /overview → main dashboard */
export default function OverviewRedirect({ params }: { params: Promise<{ institutionId: string }> }) {
  const { institutionId } = use(params)
  const router = useRouter()
  useEffect(() => {
    router.replace(`/institutions/${institutionId}`)
  }, [institutionId, router])
  return null
}
