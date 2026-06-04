const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set workspace root to frontend directory to silence lockfile warning
  outputFileTracingRoot: path.join(__dirname),

  // Disable Strict Mode to prevent double-mount in dev (can feel like auto-refresh)
  reactStrictMode: false,

  // Performance optimizations
  // Note: swcMinify is deprecated in Next.js 16 (enabled by default)
  compress: true,

  // Reduce build memory (avoids Bus error on small droplets)
  productionBrowserSourceMaps: false,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    qualities: [75, 85],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Allow local images under /assets (e.g. /assets/logo/optiohirelogo.png?v=2027)
    localPatterns: [
      {
        pathname: '/assets/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Experimental features for better performance
  experimental: {
    // optimizeCss: false, // Disabled due to critters dependency issue
    scrollRestoration: true,
    webVitalsAttribution: ['CLS', 'LCP'],
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
    // webpackMemoryOptimizations: true, // Lower peak memory during build (small droplets)
  },

  // Performance optimizations
  // Note: optimizeFonts and swcMinify are deprecated in Next.js 16 (enabled by default)
  // Removed swcMinify and optimizeFonts as they're enabled by default in Next.js 16

  // Headers for caching and compression
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/assets/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Bundle analyzer (optional - can be enabled for analysis)
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.optimization.splitChunks.cacheGroups = {
  //       ...config.optimization.splitChunks.cacheGroups,
  //       vendor: {
  //         test: /[\\/]node_modules[\\/]/,
  //         name: 'vendors',
  //         chunks: 'all',
  //       },
  //     }
  //   }
  //   return config
  // },

  async redirects() {
    return [
      {
        source: '/favicon.ico',
        destination: '/icon',
        permanent: false,
      },
    ]
  },

  async rewrites() {
    return [
      {
        source: '/api/upload/:path*',
        destination: 'http://127.0.0.1:3001/api/upload/:path*'
      },
      {
        source: '/api/applications/:path*',
        destination: 'http://127.0.0.1:3001/applications/:path*'
      },
      {
        source: '/api/job-postings/public/:path*',
        destination: 'http://127.0.0.1:3001/api/job-postings/public/:path*'
      },
      {
        source: '/api/hr/:path*',
        destination: 'http://127.0.0.1:3001/api/hr/:path*'
      },
      {
        source: '/api/candidate/:path*',
        destination: 'http://127.0.0.1:3001/api/candidate/:path*'
      },
      {
        source: '/api/admin/candidates/:path*',
        destination: 'http://127.0.0.1:3001/api/admin/candidates/:path*'
      },
      {
        source: '/api/admin/talent-pool/:path*',
        destination: 'http://127.0.0.1:3001/api/admin/talent-pool/:path*'
      },
      {
        source: '/api/admin/support-tickets',
        destination: 'http://127.0.0.1:3001/api/admin/support-tickets'
      }
    ]
  },

  // Output optimization
  output: 'standalone',
  poweredByHeader: false,

  // Reduce bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/{{member}}',
    },
    '@headlessui/react': {
      transform: '{{member}}',
    },
  },

  // Webpack configuration for ESM dependencies
  webpack: (config) => {
    // Suppress known harmless warnings
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /troika-three-text/ },
      { module: /bidi-js/ },
      { module: /webgl-sdf-generator/ },
      { message: /Gradient has outdated direction syntax/ },
      { message: /No serializer registered for Warning/ },
    ]
    return config
  },

  // Turbopack config (empty to use webpack explicitly)
  turbopack: {},
}

module.exports = nextConfig