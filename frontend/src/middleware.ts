import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


const SUBDOMAIN_MAPPING: Record<string, string> = {
  'console': '/console',
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

  
    if (!url.pathname.startsWith(internalPath)) {
      const targetUrl = new URL(`${internalPath}${url.pathname === '/' ? '' : url.pathname}`, request.url)
      const response = NextResponse.rewrite(targetUrl)
      response.headers.set('x-optiohire-subdomain', subdomain)
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
