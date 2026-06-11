import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


const SUBDOMAIN_MAPPING: Record<string, string> = {
  'console': '/admin',
  'applications': '/candidate',
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Create request headers to pass to the next component
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-invoke-path', url.pathname)

  // 1. Simple Subdomain Extraction
  const hostParts = hostname.split('.')
  const isLocalhost = hostname.includes('localhost')
  const subdomain = (isLocalhost && hostParts.length >= 2) || hostParts.length >= 3 
    ? hostParts[0].toLowerCase() 
    : ''

  const internalPath = SUBDOMAIN_MAPPING[subdomain]

  // 2. Rewrite Logic (Subdomain only)
  if (internalPath) {
    // Skip static assets, API routes, and internal Next.js files
    if (
      url.pathname.startsWith('/_next') ||
      url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/assets') ||
      url.pathname.startsWith('/auth/options') ||
      url.pathname.includes('.')
    ) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }

  
    if (!url.pathname.startsWith(internalPath)) {
      const targetUrl = new URL(`${internalPath}${url.pathname === '/' ? '' : url.pathname}`, request.url)
      
      requestHeaders.set('x-optiohire-subdomain', subdomain)
      
      const response = NextResponse.rewrite(targetUrl, {
        request: {
          headers: requestHeaders,
        },
      })
      return response
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
