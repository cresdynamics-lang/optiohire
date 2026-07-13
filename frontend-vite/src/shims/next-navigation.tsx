import { useCallback, useMemo } from 'react'
import {
  useLocation,
  useNavigate,
  useParams as useRouterParams,
  useSearchParams as useRouterSearchParams,
} from 'react-router-dom'

export function useRouter() {
  const navigate = useNavigate()
  const location = useLocation()

  return useMemo(
    () => ({
      push: (href: string) => navigate(href),
      replace: (href: string) => navigate(href, { replace: true }),
      back: () => navigate(-1),
      forward: () => navigate(1),
      refresh: () => window.location.reload(),
      prefetch: (_href: string) => {},
      pathname: location.pathname,
    }),
    [navigate, location.pathname]
  )
}

export function usePathname() {
  return useLocation().pathname
}

export function useSearchParams() {
  const [params, setParams] = useRouterSearchParams()

  const get = useCallback(
    (key: string) => params.get(key),
    [params]
  )

  const set = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params)
      next.set(key, value)
      setParams(next)
    },
    [params, setParams]
  )

  return [params, { get, set }] as const
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string>>() {
  return useRouterParams() as T
}

export function redirect(url: string) {
  if (typeof window !== 'undefined') {
    window.location.replace(url)
  }
  return null
}

export function notFound() {
  throw new Response('Not Found', { status: 404 })
}
