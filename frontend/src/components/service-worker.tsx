'use client'

import { useEffect } from 'react'

export function ServiceWorker() {
  useEffect(() => {
    // Disable service worker completely to prevent any auto-refresh behavior
    // Unregister any existing service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().then(() => {
            console.log('Service Worker unregistered to prevent auto-refresh')
          })
        })
      })
    }
    
    // Original service worker registration disabled
    /* Only register service worker in production to avoid dev refresh issues
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope)

          // Handle updates silently - don't auto-reload
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available - will be used on next page load
                  console.log('New service worker available - will activate on next page load')
                  // Don't auto-reload - let user continue browsing
                }
              })
            }
          })
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error)
        })
    } else {
      // In development, unregister any existing service workers to prevent refresh loops
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister().then(() => {
              console.log('Service Worker unregistered in development mode')
            })
          })
        })
      }
    }
    */
  }, [])

  return null
}
