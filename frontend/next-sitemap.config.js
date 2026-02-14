/** @type {import('next-sitemap').IConfig} */
const siteUrl = process.env.NEXT_PUBLIC_APP_URL
  ? (process.env.NEXT_PUBLIC_APP_URL.startsWith('http') ? process.env.NEXT_PUBLIC_APP_URL : `https://${process.env.NEXT_PUBLIC_APP_URL}`)
  : 'https://optiohire.com'

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/admin/*', '/dashboard/*', '/auth/*', '/api/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/auth/', '/api/']
      }
    ],
    additionalSitemaps: [`${siteUrl}/server-sitemap.xml`],
  },
  transform: async (config, path) => {
    // Custom transform for specific pages
    const defaultTransform = {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }

    // Higher priority for main pages
    if (path === '/') {
      return {
        ...defaultTransform,
        priority: 1.0,
        changefreq: 'daily',
      }
    }

    if (['/how-it-works', '/why-optiohire', '/use-cases', '/trust-security'].includes(path)) {
      return {
        ...defaultTransform,
        priority: 0.9,
        changefreq: 'weekly',
      }
    }

    return defaultTransform
  },
}
