import { headers } from 'next/headers'
import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/footer/footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export async function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const headersList = await headers()
  const subdomain = headersList.get('x-optiohire-subdomain')
  const host = headersList.get('host') || ''
  const pathname = headersList.get('x-invoke-path') || '' // Fallback if needed, though middleware rewrites might mask this.

  const isSubdomain = !!subdomain || host.startsWith('console.') || host.startsWith('admin.') || host.startsWith('candidate.') || host.startsWith('applications.')
  const isDashboardPath = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/candidate') || 
    pathname.startsWith('/hr') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/console') ||
    pathname === '/privacy'

  // Hide navbar and footer for dashboard, auth, admin, setup and privacy pages, and ALL subdomains
  if (isSubdomain || isDashboardPath) {
    return <>{children}</>
  }

  // Always render Navbar + Footer on public pages.
  // The pt-20 reserves space for the fixed navbar so content never jumps.
  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-[60vh]">{children}</main>
      <Footer />
    </>
  )
}
