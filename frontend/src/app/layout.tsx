import type { Metadata } from 'next'
import Script from 'next/script'
import { DM_Sans, Playfair_Display, Syne } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/use-auth'
import { ConditionalLayout } from '@/components/layout/conditional-layout'
import { CookieProvider } from '@/components/providers/cookie-provider'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { ServiceWorker } from '@/components/service-worker'
import { BottomCtaBanner } from '@/components/ui/bottom-cta-banner'
import { CaptchaProvider } from '@/components/providers/captcha-provider'
import { Toaster } from 'react-hot-toast'
import { ReferralCodeCapture } from '@/components/dashboard/referral-panel'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  preload: true,
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-syne',
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['500', '600', '700'],
  variable: '--font-playfair-display',
  display: 'swap',
  preload: true,
})

// Get metadata base URL - prioritize NEXT_PUBLIC_APP_URL, then VERCEL_URL, fallback to localhost
const getMetadataBase = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return new URL(process.env.NEXT_PUBLIC_APP_URL)
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`)
  }
  return new URL('http://localhost:3000')
}

const baseMetadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: 'AI-Powered Recruitment Platform | OptioHire',
  description: 'OptioHire is a B2B HR tech SaaS by Cres Dynamics (Nairobi, Kenya) that helps companies hire 3x faster with AI-powered smart screening, fair evaluation, and confident hiring decisions.',
  keywords: ['AI recruitment', 'automated hiring', 'candidate screening', 'HR technology', 'recruitment software', 'hiring automation', 'talent acquisition', 'AI-powered HR'],
  authors: [{ name: 'OptioHire Team' }],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/assets/logo/optiohire_mark_dark.png',
    shortcut: '/assets/logo/optiohire_mark_dark.png',
    apple: '/assets/logo/optiohire_mark_dark.png',
  },
  openGraph: {
    title: 'AI-Powered Recruitment Platform | OptioHire',
    description: 'AI-powered recruitment platform by Cres Dynamics in Nairobi. Hire 3x faster through smart screening, fair evaluation, and confident data-driven decisions.',
    type: 'website',
    siteName: 'OptioHire',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-Powered Recruitment Platform',
    description: 'Hire 3x faster with AI-powered smart screening and fair evaluation.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export function generateMetadata(): Metadata {
  return baseMetadata
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2D2DDD',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${syne.variable} ${playfairDisplay.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RFW1R1SD9P"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-RFW1R1SD9P');
          `}
        </Script>
        {/* Favicon */}
        <link rel="icon" href="/assets/logo/optiohire_mark_dark.png" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/logo/optiohire_mark_dark.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Prefetch auth routes in production only - dev HMR + prefetch causes noisy RSC fetches that feel like endless reloads */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <link rel="prefetch" href="/auth/options?mode=signin" />
            <link rel="prefetch" href="/auth/options?mode=signup" />
          </>
        )}
        {/* Prefetch logo instead of preload to avoid unused resource warning */}
        <link rel="prefetch" href="/assets/logo/optiohire_mark_dark.png" as="image" type="image/png" />
        {/* Performance hints */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${dmSans.className} antialiased bg-background text-foreground`} suppressHydrationWarning>
        <CookieProvider>
          <CaptchaProvider>
            <AuthProvider>
              <ReferralCodeCapture />
              <ErrorBoundary>
                <div className="min-h-screen bg-background">
                  <ConditionalLayout>{children}</ConditionalLayout>
                  <Toaster position="top-right" />
                  <ServiceWorker />
                </div>
              </ErrorBoundary>
            </AuthProvider>
          </CaptchaProvider>
        </CookieProvider>
      </body>
    </html>
  )
}

