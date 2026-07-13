import { lazy, Suspense, type ComponentType } from 'react'

/** Lazy-load a Next.js page default export with a loading fallback */
export function lazyPage(loader: () => Promise<{ default: ComponentType }>) {
  const Lazy = lazy(loader)
  return function LazyPage(props: Record<string, unknown>) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <Lazy {...props} />
      </Suspense>
    )
  }
}
