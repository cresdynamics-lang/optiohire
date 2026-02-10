// Service Worker for OptioHire
const CACHE_NAME = 'optiohire-v1.0.0'
const STATIC_CACHE = 'optiohire-static-v1.0.0'

// Assets to cache immediately
// Only cache assets that definitely exist
const STATIC_ASSETS = [
  '/',
  '/manifest.json'
  // Logo and favicon will be cached on-demand when fetched
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        // Cache assets individually with error handling
        // This prevents one failed asset from blocking the entire cache
        const cachePromises = STATIC_ASSETS.map((url) => {
          return fetch(url)
            .then((response) => {
              if (response.ok) {
                return cache.put(url, response)
              } else {
                console.warn(`Skipping cache for ${url}: response not ok`)
              }
            })
            .catch((err) => {
              console.warn(`Failed to cache ${url}:`, err.message)
              // Continue even if one asset fails
            })
        })
        
        return Promise.allSettled(cachePromises)
      })
      .then(() => {
        console.log('Service Worker: Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch((err) => {
        console.error('Service Worker install failed:', err)
        // Continue anyway - don't block installation
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response.ok) return response

            // Cache API responses for 5 minutes
            if (event.request.url.includes('/api/')) {
              const responseClone = response.clone()
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone)
                })
            }

            // Cache static assets
            if (event.request.url.includes('/_next/static/') ||
                event.request.url.includes('/assets/')) {
              const responseClone = response.clone()
              caches.open(STATIC_CACHE)
                .then((cache) => {
                  cache.put(event.request, responseClone)
                })
            }

            return response
          })
          .catch(() => {
            // Return offline fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/')
            }
          })
      })
  )
})

// Message event for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
