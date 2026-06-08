/**
 * Rolling Window utility for tracking events within a specific time frame.
 * Useful for rate limiting and health monitoring.
 */
export class RollingWindow {
  private events: { timestamp: number; success: boolean }[] = []
  private windowSizeMs: number

  constructor(windowSizeMs: number = 60000) { // Default 1 minute
    this.windowSizeMs = windowSizeMs
  }

  /**
   * Record an event in the window
   */
  record(success: boolean = true) {
    this.events.push({ timestamp: Date.now(), success })
    this.cleanup()
  }

  /**
   * Remove events outside the current window
   */
  private cleanup() {
    const now = Date.now()
    const cutoff = now - this.windowSizeMs
    
    // Efficiently find the first event that is within the window
    let firstValidIndex = 0
    while (firstValidIndex < this.events.length && this.events[firstValidIndex].timestamp < cutoff) {
      firstValidIndex++
    }
    
    if (firstValidIndex > 0) {
      this.events.splice(0, firstValidIndex)
    }
  }

  /**
   * Get stats for the current window
   */
  getStats() {
    this.cleanup()
    const total = this.events.length
    const successes = this.events.filter(e => e.success).length
    const failures = total - successes
    const successRate = total > 0 ? successes / total : 1
    
    return {
      total,
      successes,
      failures,
      successRate,
      isHealthy: total === 0 || successRate > 0.5 // Healthy if no events or >50% success
    }
  }

  /**
   * Check if we are within rate limits
   */
  canAccept(limit: number): boolean {
    this.cleanup()
    return this.events.length < limit
  }
}
