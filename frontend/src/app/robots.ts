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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/auth/', '/api/'],
      },
    ],
    host: baseUrl,
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
