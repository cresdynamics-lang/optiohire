import type { MetadataRoute } from 'next'

const baseUrl = 'https://optiohire.com'

const publicRoutes = [
  '',
  '/blog',
  '/guide',
  '/tips',
  '/api-docs',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((path) => {
    const url = path === '' ? baseUrl : `${baseUrl}${path}`
    const isHome = path === ''
    return {
      url,
      lastModified: new Date(),
      changeFrequency: (isHome ? 'daily' : 'weekly') as 'daily' | 'weekly',
      priority: isHome ? 1 : 0.8,
    }
  })
}
