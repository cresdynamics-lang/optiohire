import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import type { ReactNode } from 'react'

type ProtectedRouteProps = {
  children: ReactNode
  roles?: string[]
  loginPath?: string
}

export function ProtectedRoute({ children, roles, loginPath = '/auth/options?mode=signin' }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />
  }

  if (roles?.length && user.role && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
