import type { MetadataRoute } from 'next'

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const u = process.env.NEXT_PUBLIC_APP_URL
    return u.startsWith('http') ? u : `https://${u}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'https://optiohire.com'
}
const baseUrl = getBaseUrl()

/** Public marketing/SEO routes only (no admin, dashboard, auth, api). */
const publicRoutes = [
  '',
  '/about',
  '/contact',
  '/features',
  '/how-it-works',
  '/pricing',
  '/privacy',
  '/trust-security',
  '/use-cases',
  '/why-optiohire',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((path) => {
    const url = path === '' ? baseUrl : `${baseUrl}${path}`
    const isHome = path === ''
    return {
      url,
      lastModified: new Date(),
      changeFrequency: (isHome ? 'daily' : 'weekly') as 'daily' | 'weekly',
      priority: isHome ? 1 : path === '/how-it-works' || path === '/why-optiohire' || path === '/use-cases' || path === '/trust-security' ? 0.9 : 0.7,
    }
  })
}
