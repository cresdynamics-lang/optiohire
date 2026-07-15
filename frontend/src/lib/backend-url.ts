/** Server-side backend base URL for Next.js API proxies on the OptioHire VPS. */
export function getBackendUrl(): string {
  return (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:3001'
  ).replace(/\/$/, '')
}

export function createTimeoutSignal(ms: number): AbortSignal {
  if (
    typeof AbortSignal !== 'undefined' &&
    typeof (AbortSignal as { timeout?: (timeoutMs: number) => AbortSignal }).timeout === 'function'
  ) {
    return (AbortSignal as { timeout: (timeoutMs: number) => AbortSignal }).timeout(ms)
  }
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms)
  return controller.signal
}
