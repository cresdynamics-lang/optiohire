import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_DEFAULT = 'http://localhost:3001'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = (env.VITE_API_URL || BACKEND_DEFAULT).replace(/\/$/, '')

  return {
    plugins: [react()],
    publicDir: path.resolve(__dirname, '../frontend/public'),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../frontend/src'),
        'next/link': path.resolve(__dirname, 'src/shims/next-link.tsx'),
        'next/navigation': path.resolve(__dirname, 'src/shims/next-navigation.tsx'),
        'next/image': path.resolve(__dirname, 'src/shims/next-image.tsx'),
        'next/script': path.resolve(__dirname, 'src/shims/next-script.tsx'),
        'next/dynamic': path.resolve(__dirname, 'src/shims/next-dynamic.tsx'),
        'next/headers': path.resolve(__dirname, 'src/shims/next-headers.ts'),
      },
    },
    define: {
      'process.env.NEXT_PUBLIC_BACKEND_URL': JSON.stringify(apiUrl),
      'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(apiUrl),
      'process.env.NEXT_PUBLIC_APP_URL': JSON.stringify(env.VITE_APP_URL || 'http://localhost:5173'),
      'process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID || ''),
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    server: {
      port: 5173,
      proxy: {
        // Mirror Next.js rewrites from frontend/next.config.js
        '/api/upload': { target: apiUrl, changeOrigin: true },
        '/api/applications': {
          target: apiUrl,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/applications/, '/applications'),
        },
        '/api/job-postings': { target: apiUrl, changeOrigin: true },
        '/api/hr': { target: apiUrl, changeOrigin: true },
        '/api/candidate': { target: apiUrl, changeOrigin: true },
        '/api/admin': { target: apiUrl, changeOrigin: true },
        '/api/demos': { target: apiUrl, changeOrigin: true },
        '/api/webhooks': { target: apiUrl, changeOrigin: true },
        '/api/resend': { target: apiUrl, changeOrigin: true },
        '/api/analytics': { target: apiUrl, changeOrigin: true },
        '/api/user': { target: apiUrl, changeOrigin: true },
        '/api/templates': { target: apiUrl, changeOrigin: true },
        '/api/contact': {
          target: apiUrl,
          changeOrigin: true,
          rewrite: () => '/contact',
        },
        '/api/institution-applications': {
          target: apiUrl,
          changeOrigin: true,
          rewrite: () => '/institution-applications',
        },
        '/api/auth': { target: apiUrl, changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/auth/, '/auth') },
        '/api/jobs': { target: apiUrl, changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/jobs/, '/jobs') },
        '/api/companies': { target: apiUrl, changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/companies/, '/companies') },
        '/api/interviews': { target: apiUrl, changeOrigin: true },
        '/api/schedule-interview': { target: apiUrl, changeOrigin: true },
        '/api/update-interview': { target: apiUrl, changeOrigin: true },
        '/api/report': { target: apiUrl, changeOrigin: true },
        '/storage': { target: apiUrl, changeOrigin: true },
        '/auth': { target: apiUrl, changeOrigin: true },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
    },
  }
})
