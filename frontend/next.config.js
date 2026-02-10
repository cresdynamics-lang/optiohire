/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  // Note: swcMinify is deprecated in Next.js 16 (enabled by default)
  compress: true,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Experimental features for better performance
  experimental: {
    optimizeCss: false, // Disabled due to critters dependency issue
    scrollRestoration: true,
    webVitalsAttribution: ['CLS', 'LCP'],
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
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
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Suppress warnings for troika-three-text ESM imports (handled client-side)
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        { module: /troika-three-text/ },
        { module: /bidi-js/ },
        { module: /webgl-sdf-generator/ }
      ]
    }
    return config
  },

  // Turbopack config (empty to use webpack explicitly)
  turbopack: {},
}

module.exports = nextConfig