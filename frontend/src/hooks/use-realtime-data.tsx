'use client'

import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

interface UseRealtimeDataOptions {
  table: string
  onUpdate?: (payload: any) => void
  onInsert?: (payload: any) => void
  onDelete?: (payload: any) => void
  filter?: string
}

export function useRealtimeData({
  table,
  onUpdate,
  onInsert,
  onDelete,
  filter
}: UseRealtimeDataOptions) {
  const { user } = useAuth()

  const handleRealtimeUpdate = useCallback((payload: any) => {
    console.log(`Real-time update for ${table}:`, payload)
    
    switch (payload.eventType) {
      case 'UPDATE':
        onUpdate?.(payload)
        break
      case 'INSERT':
        onInsert?.(payload)
        break
      case 'DELETE':
        onDelete?.(payload)
        break
    }
  }, [table, onUpdate, onInsert, onDelete])

  useEffect(() => {
    if (!user) return

    // Set up real-time subscription
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter || undefined
        },
        handleRealtimeUpdate
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, table, filter, handleRealtimeUpdate])

  return {
    // Return any utility functions if needed
  }
}

// Specific hook for applicants data
export function useApplicantsRealtime(onDataChange?: () => void) {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('applicants_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applicants'
        },
        (payload: any) => {
          console.log('Applicants real-time update:', payload)
          onDataChange?.()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, onDataChange])
}

// Specific hook for recruitment analytics
export function useAnalyticsRealtime(onDataChange?: () => void) {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('analytics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recruitment_analytics'
        },
        (payload: any) => {
          console.log('Analytics real-time update:', payload)
          onDataChange?.()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, onDataChange])
}

// Hook for job postings updates
export function useJobsRealtime(onDataChange?: () => void) {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('jobs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_postings'
        },
        (payload: any) => {
          console.log('Jobs real-time update:', payload)
          onDataChange?.()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, onDataChange])
}
