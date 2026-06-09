import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * OptioHire Multi-Subdomain Middleware
 * 
 * Scalable mapping for different subdomains to internal paths.
 * Example: console.optiohire.com -> optiohire.com/admin
 */

const SUBDOMAIN_MAPPING: Record<string, string> = {
  'console': '/admin',
  'admin': '/admin',
  'applications': '/candidate',
  // Add more subdomains here in the future
  // 'partners': '/partners',
  // 'talent': '/talent-pool',
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Extract subdomain (e.g., "console" from "console.optiohire.com")
  const subdomain = hostname.split('.')[0].toLowerCase()

  // Skip logic if it's the main domain, www, or an IP
  if (!subdomain || subdomain === 'www' || subdomain === 'optiohire' || hostname.includes('localhost')) {
    return NextResponse.next()
  }

  // Check if we have a mapping for this subdomain
  const targetPath = SUBDOMAIN_MAPPING[subdomain]
  
  // 1. If on the main domain (no subdomain mapping) and accessing /admin, redirect to console subdomain
  if (!targetPath && url.pathname.startsWith('/admin')) {
    const consoleUrl = new URL(url.pathname, `https://console.optiohire.com`)
    return NextResponse.redirect(consoleUrl)
  }

  // 2. If on a mapped subdomain (like console.), handle the rewrite
  if (targetPath) {
    // Skip static assets and internal Next.js routes
    if (
      url.pathname.startsWith('/_next') ||
      url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/auth') ||
      url.pathname.startsWith('/assets') ||
      url.pathname.startsWith('/icon') ||
      url.pathname.includes('.')
    ) {
      return NextResponse.next()
    }

    // Prevent infinite recursion if the path already starts with the target
    if (url.pathname.startsWith(targetPath)) {
      return NextResponse.next()
    }

    // Rewrite the path
    const newPath = `${targetPath}${url.pathname === '/' ? '' : url.pathname}`
    const response = NextResponse.rewrite(new URL(newPath, request.url))
    response.headers.set('x-optiohire-subdomain', subdomain)
    return response
  }

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
