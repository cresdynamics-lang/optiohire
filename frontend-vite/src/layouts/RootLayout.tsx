import Script from 'next/script'
import { AuthProvider } from '@/hooks/use-auth'
import { ConditionalLayout } from '@/components/layout/conditional-layout'
import { CookieProvider } from '@/components/providers/cookie-provider'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { ServiceWorker } from '@/components/service-worker'
import { CaptchaProvider } from '@/components/providers/captcha-provider'
import { Toaster } from 'react-hot-toast'
import { Outlet } from 'react-router-dom'
import { SubdomainRouter } from '../components/SubdomainRouter'
import '@/app/globals.css'

export function RootLayout() {
  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-RFW1R1SD9P" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-RFW1R1SD9P');
        `}
      </Script>

      <CookieProvider>
        <CaptchaProvider>
          <AuthProvider>
            <ErrorBoundary>
              <div className="min-h-screen bg-background font-sans antialiased text-foreground">
                <SubdomainRouter>
                  <ConditionalLayout>
                    <Outlet />
                  </ConditionalLayout>
                </SubdomainRouter>
                <Toaster position="top-right" />
                <ServiceWorker />
              </div>
            </ErrorBoundary>
          </AuthProvider>
        </CaptchaProvider>
      </CookieProvider>
    </>
  )
}
