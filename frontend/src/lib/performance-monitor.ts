// n8n removed: no optimized webhook service

export interface PerformanceMetrics {
  operation: string
  duration: number
  timestamp: number
  success: boolean
  error?: string
  metadata?: Record<string, any>
}

export interface WebhookMetrics {
  totalSent: number
  successful: number
  failed: number
  averageResponseTime: number
  queueLength: number
  lastSent?: number
}

export interface DatabaseMetrics {
  totalQueries: number
  averageQueryTime: number
  cacheHits: number
  cacheMisses: number
  slowQueries: number
}

export interface FrontendMetrics {
  pageLoadTime: number
  componentRenderTime: number
  bundleSize: number
  memoryUsage: number
}

/**
 * Comprehensive performance monitoring service
 */
export class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = []
  private static webhookMetrics: WebhookMetrics = {
    totalSent: 0,
    successful: 0,
    failed: 0,
    averageResponseTime: 0,
    queueLength: 0
  }
  private static databaseMetrics: DatabaseMetrics = {
    totalQueries: 0,
    averageQueryTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    slowQueries: 0
  }
  private static frontendMetrics: FrontendMetrics = {
    pageLoadTime: 0,
    componentRenderTime: 0,
    bundleSize: 0,
    memoryUsage: 0
  }

  /**
   * Track operation performance
   */
  static trackOperation<T>(
    operation: string,
    operationFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now()
    
    return operationFn()
      .then(result => {
        const endTime = performance.now()
        const duration = endTime - startTime
        
        this.recordMetric({
          operation,
          duration,
          timestamp: Date.now(),
          success: true,
          metadata
        })
        
        return result
      })
      .catch(error => {
        const endTime = performance.now()
        const duration = endTime - startTime
        
        this.recordMetric({
          operation,
          duration,
          timestamp: Date.now(),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          metadata
        })
        
        throw error
      })
  }

  /**
   * Record a performance metric
   */
  static recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric)
    
    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
    
    // Log slow operations
    if (metric.duration > 1000) { // > 1 second
      console.warn(`🐌 Slow operation detected: ${metric.operation} took ${metric.duration.toFixed(2)}ms`)
    }
    
    // Log successful fast operations
    if (metric.success && metric.duration < 100) { // < 100ms
      console.log(`⚡ Fast operation: ${metric.operation} completed in ${metric.duration.toFixed(2)}ms`)
    }
  }

  /**
   * Update webhook metrics
   */
  static updateWebhookMetrics(success: boolean, responseTime: number) {
    this.webhookMetrics.totalSent++
    
    if (success) {
      this.webhookMetrics.successful++
    } else {
      this.webhookMetrics.failed++
    }
    
    // Update average response time
    const totalTime = this.webhookMetrics.averageResponseTime * (this.webhookMetrics.totalSent - 1)
    this.webhookMetrics.averageResponseTime = (totalTime + responseTime) / this.webhookMetrics.totalSent
    
    this.webhookMetrics.lastSent = Date.now()
    
    // n8n queue metrics removed
    this.webhookMetrics.queueLength = 0
  }

  /**
   * Update database metrics
   */
  static updateDatabaseMetrics(queryTime: number, cacheHit: boolean) {
    this.databaseMetrics.totalQueries++
    
    // Update average query time
    const totalTime = this.databaseMetrics.averageQueryTime * (this.databaseMetrics.totalQueries - 1)
    this.databaseMetrics.averageQueryTime = (totalTime + queryTime) / this.databaseMetrics.totalQueries
    
    if (cacheHit) {
      this.databaseMetrics.cacheHits++
    } else {
      this.databaseMetrics.cacheMisses++
    }
    
    if (queryTime > 500) { // > 500ms
      this.databaseMetrics.slowQueries++
    }
  }

  /**
   * Update frontend metrics
   */
  static updateFrontendMetrics(metrics: Partial<FrontendMetrics>) {
    this.frontendMetrics = { ...this.frontendMetrics, ...metrics }
  }

  /**
   * Get performance summary
   */
  static getPerformanceSummary() {
    const now = Date.now()
    const last5Minutes = this.metrics.filter(m => now - m.timestamp < 5 * 60 * 1000)
    const lastHour = this.metrics.filter(m => now - m.timestamp < 60 * 60 * 1000)
    
    const avgResponseTime5min = last5Minutes.length > 0 
      ? last5Minutes.reduce((sum, m) => sum + m.duration, 0) / last5Minutes.length 
      : 0
    
    const successRate5min = last5Minutes.length > 0
      ? (last5Minutes.filter(m => m.success).length / last5Minutes.length) * 100
      : 100
    
    const avgResponseTimeHour = lastHour.length > 0
      ? lastHour.reduce((sum, m) => sum + m.duration, 0) / lastHour.length
      : 0
    
    const successRateHour = lastHour.length > 0
      ? (lastHour.filter(m => m.success).length / lastHour.length) * 100
      : 100
    
    return {
      overview: {
        totalOperations: this.metrics.length,
        avgResponseTime5min: avgResponseTime5min,
        avgResponseTimeHour: avgResponseTimeHour,
        successRate5min: successRate5min,
        successRateHour: successRateHour,
        slowOperations: this.metrics.filter(m => m.duration > 1000).length
      },
      webhook: this.webhookMetrics,
      database: this.databaseMetrics,
      frontend: this.frontendMetrics,
      recentOperations: this.metrics.slice(-10)
    }
  }

  /**
   * Get operation-specific metrics
   */
  static getOperationMetrics(operation: string) {
    const operationMetrics = this.metrics.filter(m => m.operation === operation)
    
    if (operationMetrics.length === 0) {
      return null
    }
    
    const avgDuration = operationMetrics.reduce((sum, m) => sum + m.duration, 0) / operationMetrics.length
    const successRate = (operationMetrics.filter(m => m.success).length / operationMetrics.length) * 100
    const minDuration = Math.min(...operationMetrics.map(m => m.duration))
    const maxDuration = Math.max(...operationMetrics.map(m => m.duration))
    
    return {
      operation,
      totalCalls: operationMetrics.length,
      avgDuration,
      minDuration,
      maxDuration,
      successRate,
      recentCalls: operationMetrics.slice(-5)
    }
  }

  /**
   * Get slow operations report
   */
  static getSlowOperationsReport(threshold: number = 1000) {
    const slowOps = this.metrics.filter(m => m.duration > threshold)
    
    const groupedOps = slowOps.reduce((acc, metric) => {
      if (!acc[metric.operation]) {
        acc[metric.operation] = []
      }
      acc[metric.operation].push(metric)
      return acc
    }, {} as Record<string, PerformanceMetrics[]>)
    
    return Object.entries(groupedOps).map(([operation, metrics]) => ({
      operation,
      count: metrics.length,
      avgDuration: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length,
      maxDuration: Math.max(...metrics.map(m => m.duration)),
      lastOccurrence: Math.max(...metrics.map(m => m.timestamp))
    })).sort((a, b) => b.avgDuration - a.avgDuration)
  }

  /**
   * Clear all metrics
   */
  static clearMetrics() {
    this.metrics = []
    this.webhookMetrics = {
      totalSent: 0,
      successful: 0,
      failed: 0,
      averageResponseTime: 0,
      queueLength: 0
    }
    this.databaseMetrics = {
      totalQueries: 0,
      averageQueryTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      slowQueries: 0
    }
  }

  /**
   * Export metrics for analysis
   */
  static exportMetrics() {
    return {
      timestamp: Date.now(),
      summary: this.getPerformanceSummary(),
      allMetrics: this.metrics,
      webhookMetrics: this.webhookMetrics,
      databaseMetrics: this.databaseMetrics,
      frontendMetrics: this.frontendMetrics
    }
  }

  /**
   * Performance health check
   */
  static getHealthStatus() {
    const summary = this.getPerformanceSummary()
    const issues: string[] = []
    
    // Check response times
    if (summary.overview.avgResponseTime5min > 2000) {
      issues.push('High average response time (>2s)')
    }
    
    // Check success rate
    if (summary.overview.successRate5min < 95) {
      issues.push('Low success rate (<95%)')
    }
    
    // Check webhook performance
    if (this.webhookMetrics.failed > this.webhookMetrics.successful * 0.1) {
      issues.push('High webhook failure rate')
    }
    
    // Check database performance
    if (this.databaseMetrics.slowQueries > this.databaseMetrics.totalQueries * 0.05) {
      issues.push('High number of slow database queries')
    }
    
    // Check cache hit rate
    const totalCacheRequests = this.databaseMetrics.cacheHits + this.databaseMetrics.cacheMisses
    if (totalCacheRequests > 0) {
      const cacheHitRate = (this.databaseMetrics.cacheHits / totalCacheRequests) * 100
      if (cacheHitRate < 70) {
        issues.push('Low cache hit rate (<70%)')
      }
    }
    
    return {
      status: issues.length === 0 ? 'healthy' : 'warning',
      issues,
      summary: summary.overview
    }
  }
}

// Global performance monitoring
if (typeof window !== 'undefined') {
  // Monitor page load time
  window.addEventListener('load', () => {
    const loadTime = performance.now()
    PerformanceMonitor.updateFrontendMetrics({ pageLoadTime: loadTime })
    console.log(`🚀 Page loaded in ${loadTime.toFixed(2)}ms`)
  })
  
  // Monitor memory usage
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory
      PerformanceMonitor.updateFrontendMetrics({
        memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
      })
    }, 30000) // Every 30 seconds
  }
}
