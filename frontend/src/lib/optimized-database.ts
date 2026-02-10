import { supabase } from './supabase'
import { JobPosting, JobPostingFormData } from '@/types'

export interface OptimizedJobWithStats extends JobPosting {
  applicantStats: {
    total: number
    shortlisted: number
    flagged: number
    rejected: number
    pending: number
  }
}

export interface DashboardMetrics {
  activeJobs: number
  totalJobs: number
  totalReports: number
  readyReports: number
  totalApplicants: number
  shortlistedApplicants: number
  flaggedApplicants: number
  rejectedApplicants: number
}

/**
 * Optimized database operations for maximum performance
 */
export class OptimizedDatabaseService {
  private static cache = new Map<string, { data: any; timestamp: number }>()
  private static readonly CACHE_TTL = 30000 // 30 seconds

  /**
   * Get cached data or fetch fresh data
   */
  private static getCachedOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.CACHE_TTL
  ): Promise<T> {
    const cached = this.cache.get(key)
    const now = Date.now()

    if (cached && (now - cached.timestamp) < ttl) {
      return Promise.resolve(cached.data)
    }

    return fetchFn().then(data => {
      this.cache.set(key, { data, timestamp: now })
      return data
    })
  }

  /**
   * Clear cache for specific key or all cache
   */
  static clearCache(key?: string) {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  /**
   * Optimized job creation with single transaction
   */
  static async createJobOptimized(
    jobData: JobPostingFormData,
    userId: string
  ): Promise<{ job: JobPosting; company: any }> {
    const startTime = performance.now()
    
    try {
      // Use a single RPC call for atomic job creation
      const { data, error } = await supabase.rpc('create_job_with_company', {
        p_user_id: userId,
        p_company_name: jobData.company_name,
        p_company_email: jobData.company_email,
        p_hr_email: jobData.hr_email,
        p_job_title: jobData.job_title,
        p_job_description: jobData.job_description,
        p_required_skills: jobData.required_skills,
        p_interview_date: null,
        p_interview_meeting_link: jobData.interview_meeting_link || null,
        p_google_calendar_link: null,
        p_status: 'active'
      })

      if (error) {
        throw error
      }

      const endTime = performance.now()
      console.log(`🚀 Job creation optimized: ${(endTime - startTime).toFixed(2)}ms`)

      // Clear relevant cache
      this.clearCache(`jobs_${userId}`)
      this.clearCache(`metrics_${userId}`)

      return {
        job: data.job,
        company: data.company
      }
    } catch (error) {
      console.error('Optimized job creation failed:', error)
      throw error
    }
  }

  /**
   * Optimized job loading with single query and aggregated stats
   */
  static async loadJobsOptimized(userId: string): Promise<OptimizedJobWithStats[]> {
    const cacheKey = `jobs_${userId}`
    
    return this.getCachedOrFetch(cacheKey, async () => {
      const startTime = performance.now()
      
      try {
        // Single optimized query with aggregated applicant stats
        const { data, error } = await supabase.rpc('get_jobs_with_applicant_stats', {
          p_user_id: userId
        })

        if (error) {
          throw error
        }

        const endTime = performance.now()
        console.log(`🚀 Jobs loading optimized: ${(endTime - startTime).toFixed(2)}ms`)

        return data || []
      } catch (error) {
        console.error('Optimized jobs loading failed:', error)
        throw error
      }
    })
  }

  /**
   * Optimized dashboard metrics with single query
   */
  static async loadDashboardMetricsOptimized(userId: string): Promise<DashboardMetrics> {
    const cacheKey = `metrics_${userId}`
    
    return this.getCachedOrFetch(cacheKey, async () => {
      const startTime = performance.now()
      
      try {
        // Single RPC call for all dashboard metrics
        const { data, error } = await supabase.rpc('get_dashboard_metrics', {
          p_user_id: userId
        })

        if (error) {
          throw error
        }

        const endTime = performance.now()
        console.log(`🚀 Metrics loading optimized: ${(endTime - startTime).toFixed(2)}ms`)

        return data || {
          activeJobs: 0,
          totalJobs: 0,
          totalReports: 0,
          readyReports: 0,
          totalApplicants: 0,
          shortlistedApplicants: 0,
          flaggedApplicants: 0,
          rejectedApplicants: 0
        }
      } catch (error) {
        console.error('Optimized metrics loading failed:', error)
        throw error
      }
    })
  }

  /**
   * Optimized interview data loading
   */
  static async loadInterviewsOptimized(userId: string) {
    const cacheKey = `interviews_${userId}`
    
    return this.getCachedOrFetch(cacheKey, async () => {
      const startTime = performance.now()
      
      try {
        const { data, error } = await supabase.rpc('get_interviews_with_stats', {
          p_user_id: userId
        })

        if (error) {
          throw error
        }

        const endTime = performance.now()
        console.log(`🚀 Interviews loading optimized: ${(endTime - startTime).toFixed(2)}ms`)

        return data || []
      } catch (error) {
        console.error('Optimized interviews loading failed:', error)
        throw error
      }
    })
  }

  /**
   * Batch update webhook status for multiple jobs
   */
  static async batchUpdateWebhookStatus(jobIds: string[], webhookSent: boolean) {
    const startTime = performance.now()
    
    try {
      const { error } = await supabase
        .from('job_postings')
        .update({ n8n_webhook_sent: webhookSent })
        .in('id', jobIds)

      if (error) {
        throw error
      }

      const endTime = performance.now()
      console.log(`🚀 Batch webhook update optimized: ${(endTime - startTime).toFixed(2)}ms`)
    } catch (error) {
      console.error('Batch webhook update failed:', error)
      throw error
    }
  }

  /**
   * Preload critical data for instant UI rendering
   */
  static async preloadCriticalData(userId: string) {
    const startTime = performance.now()
    
    try {
      // Preload all critical data in parallel
      await Promise.all([
        this.loadJobsOptimized(userId),
        this.loadDashboardMetricsOptimized(userId),
        this.loadInterviewsOptimized(userId)
      ])

      const endTime = performance.now()
      console.log(`🚀 Critical data preloaded: ${(endTime - startTime).toFixed(2)}ms`)
    } catch (error) {
      console.error('Critical data preloading failed:', error)
      throw error
    }
  }
}
