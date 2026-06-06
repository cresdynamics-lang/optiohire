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
    return [{ source: '/favicon.ico', destination: '/icon', permanent: false }]
  },

  async rewrites() {
    return [
      { source: '/api/upload/:path*', destination: 'http://127.0.0.1:3001/api/upload/:path*' },
      { source: '/api/applications/:path*', destination: 'http://127.0.0.1:3001/applications/:path*' },
      { source: '/api/job-postings/public/:path*', destination: 'http://127.0.0.1:3001/api/job-postings/public/:path*' },
      { source: '/api/hr/:path*', destination: 'http://127.0.0.1:3001/api/hr/:path*' },
      { source: '/api/candidate/:path*', destination: 'http://127.0.0.1:3001/api/candidate/:path*' },
      { source: '/api/admin/:path*', destination: 'http://127.0.0.1:3001/api/admin/:path*' },
      { source: '/api/demos/:path*', destination: 'http://127.0.0.1:3001/api/demos/:path*' }
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
