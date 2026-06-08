import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * OptioHire Middleware
 * Handles hybrid routing for admin.optiohire.com and optiohire.com/admin
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Define admin subdomain (adjust if needed for your environment)
  const adminSubdomain = 'console.optiohire.com'
  
  // If the request is coming from console.optiohire.com
  if (hostname === adminSubdomain || hostname.startsWith('console.')) {
    // Skip static assets, API routes, and files
    if (
      url.pathname.startsWith('/_next') ||
      url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/assets') ||
      url.pathname.startsWith('/icon') ||
      url.pathname.includes('.')
    ) {
      return NextResponse.next()
    }

    // If the path already starts with /admin, we allow it to pass through
    // but we could also rewrite /admin/xxx to /xxx to make URLs cleaner on the subdomain
    // For now, let's just ensure that / -> /admin and /dashboard -> /admin/dashboard
    if (url.pathname.startsWith('/admin')) {
      return NextResponse.next()
    }

    // Rewrite / to /admin
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/admin', request.url))
    }

    // Rewrite everything else to /admin/path (e.g., /users -> /admin/users)
    return NextResponse.rewrite(new URL(`/admin${url.pathname}`, request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
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
