'use client'

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

export function CaptchaProvider({ children }: { children: React.ReactNode }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6Le5lgwtAAAAAMpm9GgWfY3jrCS6maXw-WZoBhgX'
  
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: 'head',
        nonce: undefined,
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  )
}
