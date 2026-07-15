const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: false,

  // Quality checks - can be toggled via environment variables for speed
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_IGNORE_LINT === 'true'
  },
  typescript: {
    ignoreBuildErrors: process.env.NEXT_IGNORE_TYPES === 'true'
  },

  // Performance optimizations
  compress: true,
  productionBrowserSourceMaps: false,

  // Standalone output is required for the production VPS deployment (PM2/Docker style)
  output: 'standalone',

  images: {
    formats: ['image/webp', 'image/avif'],
    qualities: [75, 85],
    dangerouslyAllowSVG: true,
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },

  experimental: {
    scrollRestoration: true,
    webVitalsAttribution: ['CLS', 'LCP'],
    optimizePackageImports: [
      'lucide-react',
      '@heroicons/react',
      'framer-motion',
      'gsap',
      'recharts',
      'date-fns',
      'three',
      '@react-three/drei',
      '@radix-ui/react-icons'
    ],
  },

  // Headers for caching and compression
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/assets/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },

  async redirects() {
    return [
      { source: '/favicon.ico', destination: '/icon', permanent: false },
      { source: '/demo', destination: '/', permanent: true },
      { source: '/refer', destination: '/', permanent: true },
      { source: '/auth/demo', destination: '/', permanent: true },
    ]
  },

  async rewrites() {
    const backendUrl =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      'http://127.0.0.1:3001'

    return [
      { source: '/api/upload/:path*', destination: `${backendUrl}/api/upload/:path*` },
      { source: '/api/applications/:path*', destination: `${backendUrl}/applications/:path*` },
      { source: '/api/job-postings/public/:path*', destination: `${backendUrl}/api/job-postings/public/:path*` },
      { source: '/api/hr/:path*', destination: `${backendUrl}/api/hr/:path*` },
      { source: '/api/candidate/:path*', destination: `${backendUrl}/api/candidate/:path*` },
      { source: '/api/institutions/:path*', destination: `${backendUrl}/api/institutions/:path*` },
      { source: '/api/admin/:path*', destination: `${backendUrl}/api/admin/:path*` },
      { source: '/api/demos/:path*', destination: `${backendUrl}/api/demos/:path*` },
      { source: '/api/webhooks/:path*', destination: `${backendUrl}/api/webhooks/:path*` },
      { source: '/api/resend/:path*', destination: `${backendUrl}/api/resend/:path*` },
      { source: '/api/analytics/:path*', destination: `${backendUrl}/api/analytics/:path*` },
      { source: '/api/user/:path*', destination: `${backendUrl}/api/user/:path*` },
      { source: '/api/universities', destination: `${backendUrl}/api/universities` },
      { source: '/api/universities/:path*', destination: `${backendUrl}/api/universities/:path*` },
      { source: '/api/roles', destination: `${backendUrl}/api/roles` },
      { source: '/api/roles/:path*', destination: `${backendUrl}/api/roles/:path*` },
      { source: '/api/announcements', destination: `${backendUrl}/api/announcements` },
      { source: '/api/announcements/:path*', destination: `${backendUrl}/api/announcements/:path*` },
      { source: '/api/referrals', destination: `${backendUrl}/api/referrals` },
      { source: '/api/referrals/:path*', destination: `${backendUrl}/api/referrals/:path*` },
      { source: '/api/templates/:path*', destination: `${backendUrl}/api/templates/:path*` },
      { source: '/api/contact', destination: `${backendUrl}/contact` },
      { source: '/api/institution-applications', destination: `${backendUrl}/institution-applications` },
      { source: '/storage/:path*', destination: `${backendUrl}/storage/:path*` }
    ]
  },

  // Webpack configuration
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /troika-three-text|bidi-js|webgl-sdf-generator/ },
      { message: /Gradient|No serializer/ },
    ]
    return config
  },
  turbopack: {},
}

module.exports = nextConfig
