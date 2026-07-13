import { useMemo, type ReactNode } from 'react'
import { useParams, Outlet } from 'react-router-dom'
import InstitutionLayout from '@/app/institutions/[institutionId]/layout'

export function InstitutionLayoutWrapper() {
  const { institutionId } = useParams<{ institutionId: string }>()
  const params = useMemo(
    () => Promise.resolve({ institutionId: institutionId ?? '' }),
    [institutionId]
  )

  return (
    <InstitutionLayout params={params}>
      <Outlet />
    </InstitutionLayout>
  )
}

/** For pages that are direct children without outlet nesting issues */
export function InstitutionLayoutShell({ children }: { children: ReactNode }) {
  const { institutionId } = useParams<{ institutionId: string }>()
  const params = useMemo(
    () => Promise.resolve({ institutionId: institutionId ?? '' }),
    [institutionId]
  )
  return <InstitutionLayout params={params}>{children}</InstitutionLayout>
}
