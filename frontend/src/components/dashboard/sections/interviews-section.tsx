'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Video, ExternalLink, Loader2, MapPin, User } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { createTimeoutSignal } from '@/lib/utils'
import { JobPosting } from '@/types'

interface InterviewData extends JobPosting {
  interview_date?: string
  meeting_link?: string
  google_calendar_link?: string
  candidateName?: string
  candidateEmail?: string
  applicantCount: number
  upcomingInterviews: number
  applicantStats: {
    total: number
    shortlisted: number
    flagged: number
    rejected: number
    pending: number
  }
}

export function InterviewsSection() {
  const { user } = useAuth()
  const [interviews, setInterviews] = useState<InterviewData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadInterviews = useCallback(async (options?: { silent?: boolean }) => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      const silent = options?.silent === true
      if (!silent) setIsLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        if (!silent) setIsLoading(false)
        return
      }

      // Fetch scheduled interviews from API
      const response = await fetch('/api/interviews', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: createTimeoutSignal(10000),
      })

      if (!response.ok) {
        // If endpoint doesn't exist yet, return empty array
        if (response.status === 404) {
          setInterviews([])
          if (!silent) setIsLoading(false)
          return
        }
        setInterviews([])
        if (!silent) setIsLoading(false)
        return
      }

      const data = await response.json()
      const scheduledInterviews = data.interviews || []

      // Transform scheduled interviews to InterviewData format
      const interviewsData: InterviewData[] = scheduledInterviews.map((interview: any) => ({
        id: interview.id,
        job_title: interview.jobTitle,
        status: 'active',
        interview_date: interview.interviewTime,
        meeting_link: interview.interviewLink,
        google_calendar_link: interview.interviewLink,
        applicantCount: 1,
        upcomingInterviews: 1,
        candidateName: interview.candidateName,
        candidateEmail: interview.candidateEmail,
        applicantStats: {
          total: 1,
          shortlisted: 1,
          flagged: 0,
          rejected: 0,
          pending: 0
        }
      }))

      setInterviews(interviewsData)
    } catch (err) {
      console.error('Error loading interviews:', err)
      setError('Failed to load interview data')
      setInterviews([])
    } finally {
      if (!options?.silent) {
        setIsLoading(false)
      }
    }
  }, [user])

  useEffect(() => {
    loadInterviews()

    // Refresh every 30 seconds without blocking the UI
    const interval = setInterval(() => {
      loadInterviews({ silent: true })
    }, 30000)
    return () => clearInterval(interval)
  }, [loadInterviews])

  const formatInterviewDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUpcoming: date > new Date(),
      isToday: date.toDateString() === new Date().toDateString()
    }
  }

  const upcomingInterviews = interviews.filter(interview => 
    interview.interview_date && new Date(interview.interview_date) > new Date()
  )

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-[0_28px_90px_-54px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:p-8 dark:border-gray-800 dark:bg-gray-900/90"
      >
        <div className="pointer-events-none absolute right-0 top-0 h-36 w-44 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.11),transparent_68%)]" aria-hidden />
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-400">Scheduling</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
            Interviews
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base dark:text-gray-400">
            Upcoming conversations tied to your postings — stay aligned with candidates and hiring managers.
          </p>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <div className="text-center">
            <Loader2 className="animate-spin-smooth rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading interview schedule...</p>
          </div>
        </motion.div>
      )}

      {/* Interview Summary */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-[0_22px_70px_-48px_rgba(15,23,42,0.38)] dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="text-xl font-figtree font-semibold flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Interview Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 sm:gap-6">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/25 dark:bg-blue-600">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-sm font-figtree font-medium mb-1 text-gray-900 dark:text-white">Total Interviews</h3>
                  <p className="font-figtree text-xl font-bold text-blue-700 dark:text-blue-300">{interviews.length}</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/25 dark:bg-blue-600">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-sm font-figtree font-medium mb-1 text-gray-900 dark:text-white">Upcoming</h3>
                  <p className="font-figtree text-xl font-bold text-blue-700 dark:text-blue-300">{upcomingInterviews.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Upcoming Interviews */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-[0_22px_70px_-48px_rgba(15,23,42,0.38)] dark:border-gray-800 dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Upcoming interviews
              </CardTitle>
              <CardDescription>
                Scheduled interviews for your active job postings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingInterviews.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No upcoming interviews</h3>
                  <p className="text-muted-foreground mb-6">
                    Interviews will appear here when you schedule them for your job postings
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingInterviews.map((interview, index) => {
                    if (!interview.interview_date) return null
                    const dateInfo = formatInterviewDate(interview.interview_date)
                    return (
                      <motion.div
                        key={interview.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <Card className="hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-2 gap-y-2">
                                  <h3 className="text-lg font-semibold font-figtree">{interview.job_title}</h3>
                                  <Badge variant={dateInfo.isToday ? 'warning' : 'success'}>
                                    {dateInfo.isToday ? 'Today' : 'Upcoming'}
                                  </Badge>
                                </div>
                                <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground font-figtree font-light">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {dateInfo.date} at {dateInfo.time}
                                  </div>
                                  {interview.candidateName && (
                                    <div className="flex items-center gap-1">
                                      <User className="w-4 h-4" />
                                      {interview.candidateName}
                                    </div>
                                  )}
                                </div>
                                {interview.candidateEmail && (
                                  <p className="text-sm text-muted-foreground font-figtree font-light">
                                    {interview.candidateEmail}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 sm:mt-0">
                                {interview.meeting_link && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(interview.meeting_link!, '_blank')}
                                    className="min-h-[44px] w-full touch-manipulation rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700 sm:min-h-0 sm:w-auto"
                                  >
                                    <Video className="w-4 h-4 mr-1" />
                                    Join Meeting
                                  </Button>
                                )}
                                {interview.google_calendar_link && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => interview.google_calendar_link && window.open(interview.google_calendar_link, '_blank')}
                                    className="min-h-[44px] w-full touch-manipulation rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700 sm:min-h-0 sm:w-auto"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Calendar
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
