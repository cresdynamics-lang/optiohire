import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'

type DynamicOptions<P = Record<string, unknown>> = {
  loading?: () => ReactNode
  ssr?: boolean
}

export default function dynamic<P = Record<string, unknown>>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  options?: DynamicOptions<P>
) {
  const Lazy = lazy(loader)
  const Loading = options?.loading

  return function DynamicComponent(props: P) {
    return (
      <Suspense fallback={Loading ? <Loading /> : null}>
        <Lazy {...(props as P & JSX.IntrinsicAttributes)} />
      </Suspense>
    )
  }
}
