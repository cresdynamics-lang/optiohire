'use client'

import { useEffect, useState } from 'react'
import NextImage from 'next/image'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage?: number
}

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  useEffect(() => {
    const startTime = performance.now()
    
    // Measure initial load time
    const measureLoadTime = () => {
      const loadTime = performance.now() - startTime
      
      // Get memory usage if available
      const memoryUsage = (performance as any).memory?.usedJSHeapSize
      
      setMetrics({
        loadTime,
        renderTime: performance.now() - startTime,
        memoryUsage,
      })
    }

    // Measure after page load
    if (document.readyState === 'complete') {
      measureLoadTime()
    } else {
      window.addEventListener('load', measureLoadTime)
    }

    return () => {
      window.removeEventListener('load', measureLoadTime)
    }
  }, [])

  return metrics
}

// Intersection Observer for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        ...options,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, options])

  return isIntersecting
}

// Preload critical resources hook
export function usePreloadCriticalResources() {
  useEffect(() => {
    // Preload critical fonts
    const fontLink = document.createElement('link')
    fontLink.rel = 'preload'
    fontLink.href = '/fonts/figtree.woff2'
    fontLink.as = 'font'
    fontLink.type = 'font/woff2'
    fontLink.crossOrigin = 'anonymous'
    document.head.appendChild(fontLink)

    // Preload critical images
    const criticalImages = [
      '/images/hero-bg.webp',
      '/images/logo.webp',
    ]

    criticalImages.forEach(src => {
      const img = new Image()
      img.src = src
    })

    return () => {
      document.head.removeChild(fontLink)
    }
  }, [])
}

// Performance monitoring component
export function PerformanceMonitor() {
  const metrics = usePerformanceMetrics()

  if (process.env.NODE_ENV !== 'development' || !metrics) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
      <div>Load: {metrics.loadTime.toFixed(0)}ms</div>
      <div>Render: {metrics.renderTime.toFixed(0)}ms</div>
      {metrics.memoryUsage && (
        <div>Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
      )}
    </div>
  )
}

// Lazy loading wrapper component
export function LazyWrapper({ 
  children, 
  fallback = <div className="animate-pulse bg-gray-200 rounded h-48" />,
  threshold = 0.1 
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
}) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null)
  const isIntersecting = useIntersectionObserver({ current: ref }, { threshold })

  return (
    <div ref={setRef}>
      {isIntersecting ? children : fallback}
    </div>
  )
}

// Image optimization component - use Next.js Image for better performance
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  ...props
}: {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  [key: string]: any
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <NextImage
        src={src}
        alt={alt}
        width={width ?? 1200}
        height={height ?? 800}
        priority={priority}
        onLoadingComplete={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 600px"
        {...props}
      />
    </div>
  )
}
