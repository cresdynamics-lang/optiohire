'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScheduleInterviewModal } from '@/components/modals/ScheduleInterviewModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Loader2, Trophy, Medal, Award, User, ArrowLeft, Home, Briefcase, AlertTriangle, Mail, Linkedin, Send, X, CheckSquare, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { TopNavigation } from '@/components/dashboard/top-navigation'
import type { Candidate as CandidateRowType } from '@/components/CandidateRow'
import { cleanCandidateName } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Candidate extends CandidateRowType {
  rank?: number
  reasoning?: string | null
  parsed_resume?: any
}

export default function ShortlistedPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.jobId as string
  const { user, loading: authLoading } = useAuth()

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [meetingLink, setMeetingLink] = useState<string>('')

  // Bulk messaging state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [messageSubject, setMessageSubject] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [messageSent, setMessageSent] = useState(false)

  // AI Compose
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const [showAiInput, setShowAiInput] = useState(false)

  // Status Update
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [candidateToReject, setCandidateToReject] = useState<Candidate | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // STRICT: Admin should NOT access HR dashboard
  useEffect(() => {
    if (authLoading) return
    if (user && user.role === 'admin') {
      router.push('/admin')
      return
    }
  }, [user, authLoading, router])

  const fetchCandidates = useCallback(async () => {
    if (!jobId) {
      setError('Invalid job ID')
      setLoading(false)
      return
      }
      
      const token = localStorage.getItem('token')
      if (!token) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch both candidates and meeting link in parallel
      const [candidatesResponse, meetingLinkResponse] = await Promise.all([
        fetch(`/api/hr/candidates?jobId=${jobId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`/api/job-postings/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      ])

      // Process candidates response
      if (candidatesResponse.ok) {
        let candidatesData
        try {
          const text = await candidatesResponse.text()
          if (!text) {
            console.warn('Empty response from candidates API')
            candidatesData = []
          } else {
            candidatesData = JSON.parse(text)
          }
        } catch (parseError) {
          console.error('Failed to parse candidates response:', parseError)
          candidatesData = []
        }
        setCandidates(Array.isArray(candidatesData) ? candidatesData : [])
      } else {
        // Handle error response
        const status = candidatesResponse.status
        const statusText = candidatesResponse.statusText || 'Unknown error'
        let errorMessage = `Failed to fetch candidates (${status})`
        let errorDetails: any = null
        let rawErrorText = ''
        
        try {
          // Try to get response as text first
          const textResponse = await candidatesResponse.text()
          rawErrorText = textResponse
          
          if (textResponse) {
            try {
              errorDetails = JSON.parse(textResponse)
              errorMessage = errorDetails.error || errorDetails.message || errorMessage
              if (errorDetails.details) {
                errorMessage += `: ${errorDetails.details}`
              }
            } catch (jsonError) {
              // Response is not JSON, use text as error message
              errorMessage = textResponse || errorMessage
            }
          } else {
            // Empty response, use status text
            errorMessage = statusText || errorMessage
          }
        } catch (readError) {
          // Failed to read response at all
          console.error('Failed to read error response:', readError)
          errorMessage = statusText || 'Failed to fetch candidates'
        }
        
        // Log full error details for debugging (safely)
        const errorLog: Record<string, any> = {
          status,
          statusText,
          errorMessage,
          jobId
        }
        
        if (errorDetails) {
          errorLog.errorDetails = errorDetails
        }

        if (rawErrorText) {
          errorLog.rawErrorText = rawErrorText.slice(0, 1000)
        }
        
        console.error('Candidates API error:', errorLog)
        
        throw new Error(errorMessage)
      }

      // Process meeting link response (non-blocking - don't fail if this fails)
      if (meetingLinkResponse.ok) {
        const meetingLinkData = await meetingLinkResponse.json()
        setMeetingLink(meetingLinkData.meeting_link || '')
      }
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message || 'Failed to load candidates')
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    if (!user || user.role === 'admin') return
    fetchCandidates()
  }, [jobId, user?.id, user?.role, fetchCandidates])

  // Polling while tab is visible (~10s) so new email-screened candidates appear quickly after processing
  useEffect(() => {
    if (!jobId || !user || user.role === 'admin') return
    const tick = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
      fetchCandidates()
    }
    const interval = setInterval(tick, 10000)
    return () => clearInterval(interval)
  }, [jobId, user?.id, user?.role, fetchCandidates])

  const handleScheduleClick = useCallback((candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsModalOpen(true)
  }, [])

  const handleRowClick = useCallback((candidate: Candidate) => {
    if (!jobId || !candidate?.id) {
      console.error('Missing jobId or candidate.id for navigation')
      return
    }
    try {
      router.push(`/dashboard/job/${jobId}/candidate/${candidate.id}`)
    } catch (error) {
      console.error('Navigation error:', error)
      setError('Failed to navigate to candidate details')
    }
  }, [jobId, router])

  const handleScheduleSuccess = useCallback(() => {
    fetchCandidates()
  }, [fetchCandidates])

  // Checkbox toggle
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === candidates.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(candidates.map(c => c.id)))
    }
  }, [candidates, selectedIds.size])

  // Send message handler
  const handleSendMessage = useCallback(async () => {
    if (selectedIds.size === 0 || !messageSubject.trim() || !messageBody.trim()) return
    setIsSendingMessage(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')
      const res = await fetch('/api/hr/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          candidateIds: Array.from(selectedIds),
          subject: messageSubject,
          message: messageBody,
          jobPostingId: jobId,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to send messages')
      }
      setMessageSent(true)
      setTimeout(() => {
        setIsMessageModalOpen(false)
        setMessageSent(false)
        setMessageSubject('')
        setMessageBody('')
        setSelectedIds(new Set())
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSendingMessage(false)
    }
  }, [selectedIds, messageSubject, messageBody, jobId])

  const handleUpdateStatus = useCallback(async (candidateId: string, status: 'HIRED' | 'REJECTED', reason?: string) => {
    setIsUpdatingStatus(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')
      
      const res = await fetch(`/api/hr/candidates/${candidateId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, reason }),
      })
      if (!res.ok) {
        throw new Error('Failed to update status')
      }
      
      fetchCandidates()
      if (status === 'REJECTED') {
        setIsRejectModalOpen(false)
        setRejectReason('')
        setCandidateToReject(null)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUpdatingStatus(false)
    }
  }, [fetchCandidates])

  const handleGenerateAiMessage = useCallback(async () => {
    if (!aiPrompt.trim()) return
    setIsGeneratingAi(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')
      
      const res = await fetch(`/api/hr/messages/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          prompt: aiPrompt,
          jobTitle: 'the role', 
          companyName: 'our company' 
        }),
      })
      if (!res.ok) throw new Error('Failed to generate message')
      
      const data = await res.json()
      setMessageBody(data.message || '')
      setShowAiInput(false)
      setAiPrompt('')
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsGeneratingAi(false)
    }
  }, [aiPrompt])

  // Extract LinkedIn URL from parsed resume
  const getLinkedInUrl = useCallback((candidate: Candidate): string | null => {
    try {
      const resume = candidate.parsed_resume || (candidate as any).parsed_resume_json
      if (!resume) return null
      const parsed = typeof resume === 'string' ? JSON.parse(resume) : resume
      return parsed?.linkedin || parsed?.linkedIn || parsed?.linkedin_url || parsed?.linkedinUrl || null
    } catch {
      return null
    }
  }, [])

  // Show UI immediately, only show loading spinner for data fetching
  const isLoadingData = loading && !authLoading

  const getRankIcon = useCallback((rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />
    return <span className="text-sm font-semibold text-gray-600">#{rank}</span>
  }, [])

  type StatusKey = 'SHORTLIST' | 'SHORTLISTED' | 'FLAG' | 'FLAGGED' | 'REJECT' | 'REJECTED' | 'PENDING'

  const statusMap = useMemo(() => ({
    'SHORTLIST': { variant: 'shortlisted' as const, label: 'Shortlisted' },
    'SHORTLISTED': { variant: 'shortlisted' as const, label: 'Shortlisted' },
    'FLAG': { variant: 'flagged' as const, label: 'Flagged' },
    'FLAGGED': { variant: 'flagged' as const, label: 'Flagged' },
    'REJECT': { variant: 'rejected' as const, label: 'Rejected' },
    'REJECTED': { variant: 'rejected' as const, label: 'Rejected' },
    'PENDING': { variant: 'outline' as const, label: 'Pending' },
  } as Record<StatusKey, { variant: 'shortlisted' | 'flagged' | 'rejected' | 'outline', label: string }>), [])

  const getStatusBadge = useCallback((status: string) => {
    const upperStatus = status.toUpperCase() as StatusKey
    const statusInfo = statusMap[upperStatus] || statusMap['PENDING']
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }, [statusMap])

  const renderReasoning = useCallback((reasoning: string | null | undefined) => {
    if (!reasoning) return 'No reasoning provided'
    
    try {
      const parsed = JSON.parse(reasoning)
      if (typeof parsed === 'object' && parsed !== null) {
        return (
          <div className="space-y-1">
            <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{parsed.overview}</p>
            <div className="flex gap-2 text-[10px]">
              {parsed.strengths?.length > 0 && (
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  {parsed.strengths.length} Strengths
                </span>
              )}
              {parsed.weaknesses?.length > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  {parsed.weaknesses.length} Gaps
                </span>
              )}
            </div>
          </div>
        )
      }
    } catch (e) {
      // Fallback to plain text if not JSON
    }
    
    return reasoning.length > 100 ? reasoning.substring(0, 100) + '...' : reasoning
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <TopNavigation />
            </div>
          </div>
        </div>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 text-lg font-semibold mb-2">Failed to load candidates</p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <Button
                  onClick={fetchCandidates}
                  className="bg-[#2D2DDD] hover:bg-[#2D2DDD] text-white shadow-none hover:shadow-none"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top Navigation */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <TopNavigation />
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Back Button and Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Button
            onClick={() => {
              try {
                router.push('/dashboard/jobs')
              } catch (error) {
                console.error('Navigation error:', error)
              }
            }}
            className="flex items-center gap-2 bg-[#2D2DDD] text-white hover:bg-[#2D2DDD] hover:text-white shadow-none hover:shadow-none"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Home className="w-4 h-4" />
            <span>/</span>
            <Briefcase className="w-4 h-4" />
            <span>Jobs</span>
            <span>/</span>
            <span>Candidates</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Candidates (shortlist → flagged → rejected)
                  {isLoadingData && (
                    <Loader2 className="h-4 w-4 animate-spin ml-2 text-[#2D2DDD]" />
                  )}
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Ranked from top shortlisted to last rejected. Updates every 30s.
                </p>
              </div>
              {selectedIds.size > 0 && (
                <Button
                  onClick={() => setIsMessageModalOpen(true)}
                  className="bg-[#2D2DDD] hover:bg-[#2525BB] text-white gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Message {selectedIds.size} Candidate{selectedIds.size > 1 ? 's' : ''}
                </Button>
              )}
            </div>
          </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#2D2DDD]" />
                <p className="text-gray-600 dark:text-gray-400">Loading candidates...</p>
              </div>
            </div>
          ) : (
          <div 
            className="overflow-x-auto [&::-webkit-scrollbar]:h-[2px] [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#2D2DDD] [&::-webkit-scrollbar-thumb]:rounded-full"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#2D2DDD transparent'
            }}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={candidates.length > 0 && selectedIds.size === candidates.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 accent-[#2D2DDD]"
                    />
                  </TableHead>
                  <TableHead className="w-20">Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-24 text-center">Score</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-10">LinkedIn</TableHead>
                  <TableHead className="min-w-[200px]">Score Reason</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No candidates yet on the job post
                    </TableCell>
                  </TableRow>
                ) : (
                  candidates.map((candidate) => {
                    const linkedInUrl = getLinkedInUrl(candidate)
                    return (
                    <TableRow 
                      key={candidate.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleRowClick(candidate)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(candidate.id)}
                          onChange={() => toggleSelect(candidate.id)}
                          className="rounded border-gray-300 accent-[#2D2DDD]"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {candidate.rank ? getRankIcon(candidate.rank) : '-'}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {cleanCandidateName(candidate.candidate_name)}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {candidate.email}
                      </TableCell>
                      <TableCell className="text-center">
                        {candidate.score !== null && candidate.score !== undefined && typeof candidate.score === 'number' ? (
                          <span className="font-semibold text-[#2D2DDD] dark:text-white">
                            {Number(candidate.score).toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(candidate.status)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {linkedInUrl ? (
                          <a
                            href={linkedInUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            title="View LinkedIn Profile"
                          >
                            <Linkedin className="w-5 h-5" />
                          </a>
                        ) : (
                          <span className="text-gray-300"><Linkedin className="w-4 h-4" /></span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {renderReasoning(candidate.reasoning)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-2">
                        {candidate.status !== 'HIRED' && candidate.status !== 'REJECTED' && (
                          candidate.interview_status === 'SCHEDULED' || candidate.interview_time ? (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                onClick={() => handleScheduleClick(candidate)}
                              >
                                ✏️ Edit Interview
                              </Button>
                              <Button size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 w-full" onClick={() => handleUpdateStatus(candidate.id, 'HIRED')}>
                                Mark as Hired
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleScheduleClick(candidate)}
                              className="bg-[#2D2DDD] hover:bg-[#2D2DDD] text-white shadow-none hover:shadow-none"
                            >
                              Schedule Interview
                            </Button>
                          )
                        )}
                        {candidate.status !== 'HIRED' && candidate.status !== 'REJECTED' && (
                          <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50 w-full" onClick={() => {
                            setCandidateToReject(candidate)
                            setIsRejectModalOpen(true)
                          }}>
                            Reject
                          </Button>
                        )}
                        </div>
                      </TableCell>
                    </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>

      <ScheduleInterviewModal
        isOpen={isModalOpen}
        candidate={selectedCandidate}
        meetingLink={meetingLink}
        existingInterview={selectedCandidate?.interview_time ? {
          applicationId: selectedCandidate.id,
          interviewTime: selectedCandidate.interview_time,
          interviewLink: selectedCandidate.interview_link || '',
          interviewType: 'online',
        } : null}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCandidate(null)
        }}
        onSuccess={handleScheduleSuccess}
      />

      {/* Bulk / Single Message Modal */}
      <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#2D2DDD]" />
              Message {selectedIds.size} Candidate{selectedIds.size > 1 ? 's' : ''}
            </DialogTitle>
            <DialogDescription>
              Send a custom email to the selected candidate{selectedIds.size > 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          {messageSent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages Sent!</h3>
              <p className="text-sm text-gray-600">{selectedIds.size} email{selectedIds.size > 1 ? 's' : ''} sent successfully.</p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <Input
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="e.g. Next steps for your application"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <Button variant="ghost" size="sm" onClick={() => setShowAiInput(!showAiInput)} className="text-[#2D2DDD] gap-1 h-8">
                    <Sparkles className="w-4 h-4" /> AI Compose
                  </Button>
                </div>
                {showAiInput && (
                  <div className="flex gap-2 mb-2">
                    <Input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="E.g. Tell them we want to schedule an intro call next week" />
                    <Button onClick={handleGenerateAiMessage} disabled={isGeneratingAi || !aiPrompt.trim()} size="sm" className="bg-[#2D2DDD] hover:bg-[#2525BB]">
                      {isGeneratingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                    </Button>
                  </div>
                )}
                <textarea
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Write your message here..."
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
          )}
          {!messageSent && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMessageModalOpen(false)} disabled={isSendingMessage}>
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={isSendingMessage || !messageSubject.trim() || !messageBody.trim()}
                className="bg-[#2D2DDD] hover:bg-[#2525BB] text-white gap-2"
              >
                {isSendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSendingMessage ? 'Sending...' : 'Send Email'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Candidate</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject {candidateToReject?.candidate_name}? They will be sent to the talent pool.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason (Optional)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Not enough React experience"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)} disabled={isUpdatingStatus}>Cancel</Button>
            <Button onClick={() => handleUpdateStatus(candidateToReject!.id, 'REJECTED', rejectReason)} disabled={isUpdatingStatus} className="bg-red-600 hover:bg-red-700 text-white">
              {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}

