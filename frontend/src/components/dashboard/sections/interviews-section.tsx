'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Video, ExternalLink, Loader2, User, XCircle, Pencil, LayoutGrid, Table as TableIcon } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/hooks/use-auth'
import { createTimeoutSignal } from '@/lib/utils'
import { JobPosting } from '@/types'
import { RejectedInterviewsModal } from './rejected-interviews-modal'
import { ScheduleInterviewModal } from '@/components/modals/ScheduleInterviewModal'

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

interface RejectedCandidate {
  application_id: string
  candidate_name: string
  job_title: string
  reasoning: string
}

interface DashboardStats {
  total: number
  upcoming: number
  past: number
  rejected: number
}

export function InterviewsSection() {
  const { user } = useAuth()
  const [interviews, setInterviews] = useState<InterviewData[]>([])
  const [rejectedCandidates, setRejectedCandidates] = useState<RejectedCandidate[]>([])
  const [stats, setStats] = useState<DashboardStats>({ total: 0, upcoming: 0, past: 0, rejected: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modals state
  const [isRejectedModalOpen, setIsRejectedModalOpen] = useState(false)
  const [selectedInterviewForEdit, setSelectedInterviewForEdit] = useState<InterviewData | null>(null)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')

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

      const response = await fetch('/api/interviews', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: createTimeoutSignal(10000),
      })

      if (!response.ok) {
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
      
      if (data.stats) {
        setStats(data.stats)
      }
      if (data.rejectedCandidates) {
        setRejectedCandidates(data.rejectedCandidates)
      }

      const fetchedInterviews = data.interviews || []
      const interviewsData: InterviewData[] = fetchedInterviews.map((interview: any) => ({
        id: interview.id,
        job_title: interview.jobTitle,
        status: 'active',
        interview_date: interview.interviewTime,
        meeting_link: interview.interviewLink,
        google_calendar_link: interview.googleCalendarLink || interview.interviewLink, // Prefer googleCalendarLink if it exists
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
      const errName = err instanceof Error ? err.name : ''
      const errMessage = err instanceof Error ? err.message : ''
      const isTimeoutLike =
        errName === 'AbortError' ||
        errName === 'TimeoutError' ||
        /abort|timeout/i.test(errMessage)

      if (!options?.silent) {
        if (isTimeoutLike) {
          console.warn('Interviews request timed out, keeping existing data')
          setError('Interview data is taking longer than expected. Please retry.')
        } else {
          console.error('Error loading interviews:', err)
          setError('Failed to load interview data')
        }
      }

      if (!options?.silent && interviews.length === 0) {
        setInterviews([])
      }
    } finally {
      if (!options?.silent) {
        setIsLoading(false)
      }
    }
  }, [user, interviews.length])

  useEffect(() => {
    loadInterviews()

    const interval = setInterval(() => {
      // Skip background polling if user is actively interacting with modals
      if (isRejectedModalOpen || selectedInterviewForEdit) return
      loadInterviews({ silent: true })
    }, 30000)
    return () => clearInterval(interval)
  }, [loadInterviews, isRejectedModalOpen, selectedInterviewForEdit])

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

  const pastInterviews = interviews.filter(interview => 
    interview.interview_date && new Date(interview.interview_date) <= new Date()
  )

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_30px_80px_-56px_rgba(15,23,42,0.45)] sm:p-8 dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-100/70 to-transparent dark:from-slate-800/50" aria-hidden />
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">Scheduling</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-4xl ">
            Interviews
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base dark:text-gray-400">
            Upcoming conversations tied to your postings — stay aligned with candidates and hiring managers.
          </p>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
        >
          {error}
        </motion.div>
      )}

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
          <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-[0_22px_70px_-48px_rgba(15,23,42,0.38)] dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-xl font-figtree font-semibold flex items-center gap-3">
                <Calendar className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                Interview Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 shadow-lg shadow-slate-500/20 dark:bg-slate-100">
                    <Calendar className="w-6 h-6 text-white dark:text-slate-900" />
                  </div>
                  <h3 className="text-sm font-figtree font-medium mb-1 text-foreground">Total</h3>
                  <p className="font-figtree text-xl font-bold text-slate-900 dark:text-slate-100">{stats.total || interviews.length}</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-500/20 dark:bg-blue-500">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-figtree font-medium mb-1 text-foreground">Upcoming</h3>
                  <p className="font-figtree text-xl font-bold text-blue-600 dark:text-blue-400">{stats.upcoming || upcomingInterviews.length}</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 shadow-lg ">
                    <Clock className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <h3 className="text-sm font-figtree font-medium mb-1 text-foreground">Past</h3>
                  <p className="font-figtree text-xl font-bold text-slate-600 dark:text-slate-400">{stats.past || pastInterviews.length}</p>
                </div>
                <div 
                  className="text-center cursor-pointer group" 
                  onClick={() => setIsRejectedModalOpen(true)}
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 shadow-lg shadow-red-500/20 dark:bg-red-900/30 group-hover:scale-105 transition-transform">
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-sm font-figtree font-medium mb-1 text-red-600 dark:text-red-400 group-hover:underline">Rejected</h3>
                  <p className="font-figtree text-xl font-bold text-red-600 dark:text-red-400">{stats.rejected || rejectedCandidates.length}</p>
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
          <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-[0_22px_70px_-48px_rgba(15,23,42,0.38)] dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight">
                    <Calendar className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                    Upcoming interviews
                  </CardTitle>
                  <CardDescription>
                    Scheduled interviews for your active job postings
                  </CardDescription>
                </div>
                {!isLoading && upcomingInterviews.length > 0 && (
                  <div className="flex bg-slate-100 /50 p-1 rounded-xl border border-slate-200/50">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setViewMode('card')} 
                      className={`h-8 w-10 rounded-lg p-0 transition-all ${viewMode === 'card' ? 'bg-white shadow-sm text-[#2D2DDD]' : 'text-slate-500 hover:text-slate-900'}`}
                      title="Card View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setViewMode('table')} 
                      className={`h-8 w-10 rounded-lg p-0 transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-[#2D2DDD]' : 'text-slate-500 hover:text-slate-900'}`}
                      title="Table View"
                    >
                      <TableIcon className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
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
                viewMode === 'card' ? (
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
                        <Card className="border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl  ">
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
                                    <Clock className="w-4 h-4" />
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
                              <div className="flex flex-wrap items-stretch sm:items-center gap-2 mt-4 sm:mt-0">
                                {interview.meeting_link && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(interview.meeting_link!, '_blank')}
                                    className="min-h-[44px] touch-manipulation rounded-xl bg-slate-900 text-white hover:bg-slate-800 sm:min-h-0 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
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
                                    className="min-h-[44px] touch-manipulation rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200 sm:min-h-0  dark:text-slate-100 dark:hover:bg-slate-700"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Calendar
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedInterviewForEdit(interview)}
                                  className="min-h-[44px] touch-manipulation rounded-xl sm:min-h-0"
                                >
                                  <Pencil className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
                ) : (
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted">
                      <TableRow>
                        <TableHead className="font-bold">Interview</TableHead>
                        <TableHead className="font-bold">Candidate</TableHead>
                        <TableHead className="font-bold">Date & Time</TableHead>
                        <TableHead className="font-bold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingInterviews.map((interview) => {
                        if (!interview.interview_date) return null
                        const dateInfo = formatInterviewDate(interview.interview_date)
                        return (
                          <TableRow key={interview.id}>
                            <TableCell>
                              <div className="font-semibold text-slate-900">{interview.job_title}</div>
                              <Badge variant={dateInfo.isToday ? 'warning' : 'success'} className="mt-1">
                                {dateInfo.isToday ? 'Today' : 'Upcoming'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {interview.candidateName ? (
                                <div>
                                  <div className="font-medium">{interview.candidateName}</div>
                                  <div className="text-xs text-muted-foreground">{interview.candidateEmail}</div>
                                </div>
                              ) : <span className="text-muted-foreground">-</span>}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-sm">
                                <Clock className="w-4 h-4 text-slate-500" />
                                <span>{dateInfo.date} at {dateInfo.time}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {interview.meeting_link && (
                                  <Button variant="outline" size="sm" onClick={() => window.open(interview.meeting_link!, '_blank')}>
                                    <Video className="w-4 h-4 mr-1" /> Join
                                  </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => setSelectedInterviewForEdit(interview)}>
                                  <Pencil className="w-4 h-4" /> Edit
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                )
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Past Interviews */}
      {!isLoading && pastInterviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 opacity-80 hover:opacity-100 transition-opacity">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-semibold tracking-tight">
                <Clock className="h-5 w-5 text-slate-500" />
                Past Interviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pastInterviews.map((interview, index) => {
                  if (!interview.interview_date) return null
                  const dateInfo = formatInterviewDate(interview.interview_date)
                  return (
                    <motion.div
                      key={interview.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="border border-slate-200 bg-slate-50  dark:bg-slate-950">
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                              <div className="mb-2 flex flex-wrap items-center gap-2 gap-y-2">
                                <h3 className="text-base font-semibold font-figtree text-slate-700 dark:text-slate-300">{interview.job_title}</h3>
                                <Badge variant="secondary" className="bg-slate-200 text-slate-600  dark:text-slate-400">
                                  Completed
                                </Badge>
                              </div>
                              <div className="mb-1 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-figtree font-light">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {dateInfo.date} at {dateInfo.time}
                                </div>
                                {interview.candidateName && (
                                  <div className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {interview.candidateName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Modals */}
      <RejectedInterviewsModal
        isOpen={isRejectedModalOpen}
        onClose={() => setIsRejectedModalOpen(false)}
        rejectedCandidates={rejectedCandidates}
      />

      {selectedInterviewForEdit && (
        <ScheduleInterviewModal
          isOpen={true}
          onClose={() => setSelectedInterviewForEdit(null)}
          onSuccess={() => {
            setSelectedInterviewForEdit(null)
            loadInterviews()
          }}
          candidate={{
            id: selectedInterviewForEdit.id,
            candidate_name: selectedInterviewForEdit.candidateName || 'Candidate',
            email: selectedInterviewForEdit.candidateEmail || '',
            job_title: selectedInterviewForEdit.job_title,
          } as any}
          meetingLink={selectedInterviewForEdit.meeting_link || ''}
          existingInterview={{
            applicationId: selectedInterviewForEdit.id,
            interviewTime: selectedInterviewForEdit.interview_date || new Date().toISOString(),
            interviewLink: selectedInterviewForEdit.meeting_link || '',
            interviewType: 'online'
          }}
        />
      )}
    </div>
  )
}
