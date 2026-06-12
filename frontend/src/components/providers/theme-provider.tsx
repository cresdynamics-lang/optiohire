'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // next-themes handles SSR internally, no need for mounted check
  // This prevents hydration mismatches and ensures components render on first load
  // Removing the mounted state check allows components to render immediately
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange={false}
      storageKey="hr-recruitment-theme"
      enableColorScheme={true}
    >
      {children}
    </NextThemesProvider>
  )
}


