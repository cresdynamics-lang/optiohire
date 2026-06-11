import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * OptioHire Stable Subdomain Middleware
 * 
 * Performs internal rewrites to map subdomains to their respective portal folders.
 * Trust Nginx to handle canonical redirects (e.g., stripping prefixes or routing main domain).
 */

const SUBDOMAIN_MAPPING: Record<string, string> = {
  'console': '/hr',
  'admin': '/admin',
  'candidate': '/candidate',
  'applications': '/candidate',
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
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
      url.pathname.includes('.')
    ) {
      return NextResponse.next()
    }

    // Stable Rewrite: Map the external URL to the internal folder
    // e.g., console.optiohire.com/dashboard -> optiohire.com/hr/dashboard
    // We only rewrite if the path hasn't already been prefixed (prevents recursion)
    if (!url.pathname.startsWith(internalPath)) {
      const targetUrl = new URL(`${internalPath}${url.pathname === '/' ? '' : url.pathname}`, request.url)
      const response = NextResponse.rewrite(targetUrl)
      response.headers.set('x-optiohire-subdomain', subdomain)
      return response
    }
  }

  // 3. Fallback (Main domain or already-prefixed path)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
