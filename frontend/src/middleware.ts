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
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Extract subdomain (e.g., "console" from "console.optiohire.com")
  const isLocalhost = hostname.includes('localhost')
  let subdomain = hostname.split('.')[0].toLowerCase()
  if (isLocalhost && hostname.split('.').length < 3) {
      subdomain = '' // On localhost without subdomain
  }

  // Check if we have a mapping for this subdomain
  const targetPath = SUBDOMAIN_MAPPING[subdomain]
  
  // 1. If on the main domain (no mapped subdomain)
  if (!targetPath) {
    // If trying to access /admin, redirect to console
    if (url.pathname.startsWith('/admin')) {
      const consoleUrl = new URL(url.pathname, `https://console.optiohire.com`)
      return NextResponse.redirect(consoleUrl)
    }
    // If trying to access /candidate, redirect to candidate subdomain
    if (url.pathname.startsWith('/candidate')) {
      const candidateUrl = new URL(url.pathname, `https://applications.optiohire.com`)
      return NextResponse.redirect(candidateUrl)
    }
    return NextResponse.next()
  }

  // 2. If on a mapped subdomain (like console. or candidate.)
  if (targetPath) {
    // Skip static assets and internal Next.js routes
    if (
      url.pathname.startsWith('/_next') ||
      url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/assets') ||
      url.pathname.startsWith('/icon') ||
      url.pathname.includes('.')
    ) {
      return NextResponse.next()
    }

    // Explicit cross-subdomain blocking to enforce separation
    if (targetPath === '/admin' && (url.pathname.startsWith('/hr') || url.pathname.startsWith('/candidate'))) {
      return NextResponse.redirect(new URL('/', request.url)) // Or block
    }
    if (targetPath === '/candidate' && (url.pathname.startsWith('/hr') || url.pathname.startsWith('/admin'))) {
      return NextResponse.redirect(new URL('/', request.url))
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
