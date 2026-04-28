'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  Star,
  Mail,
  Calendar,
  ExternalLink,
  Loader2,
  RefreshCw,
  Eye,
  Download
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { N8NCandidateData } from '@/types'

interface CandidateWithJob extends N8NCandidateData {
  job_posting_id: string
  job_title: string
  created_at: string
}

export function RealCandidatesSection() {
  const { user } = useAuth()
  const [candidates, setCandidates] = useState<CandidateWithJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithJob | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const loadRealCandidates = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Get company for this user
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (companyError) {
        throw companyError
      }
      
      // Get real candidates with job details
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('applicants')
        .select(`
          *,
          job_postings!inner(
            id,
            job_title,
            company_id,
            created_at
          )
        `)
        .eq('job_postings.company_id', company.id)
        .not('ai_reasoning', 'is', null)
        .order('processed_at', { ascending: false })
      
      if (candidatesError) {
        throw candidatesError
      }
      
      // Transform data to match n8n candidate structure
      const transformedCandidates: CandidateWithJob[] = candidatesData?.map((applicant: any) => ({
        candidate_name: applicant.name || 'Unknown',
        email: applicant.email,
        score: applicant.matching_score || 0,
        status: applicant.status === 'shortlisted' ? 'SHORTLIST' : 
                applicant.status === 'rejected' ? 'REJECT' : 'FLAG TO HR',
        company_name: 'Microsoft', // This will be updated from job data
        company_email_address: 'info@microsoft.com', // This will be updated from job data
        reasoning: applicant.ai_reasoning || 'No reasoning provided',
        job_posting_id: applicant.job_posting_id,
        job_title: applicant.job_postings.job_title,
        created_at: applicant.processed_at || applicant.created_at
      })) || []
      
      setCandidates(transformedCandidates)
      setLastUpdated(new Date())
      
      console.log(`✅ Loaded ${transformedCandidates.length} real candidates from n8n workflow`)
    } catch (err) {
      console.error('Error loading real candidates:', err)
      setError('Failed to load candidate data')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadRealCandidates()
  }, [loadRealCandidates])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SHORTLIST': return 'text-green-600 bg-green-50 border-green-200'
      case 'REJECT': return 'text-red-600 bg-red-50 border-red-200'
      case 'FLAG TO HR': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SHORTLIST': return <UserCheck className="w-4 h-4" />
      case 'REJECT': return <UserX className="w-4 h-4" />
      case 'FLAG TO HR': return <AlertTriangle className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const exportCandidates = () => {
    const csvContent = [
      ['Name', 'Email', 'Score', 'Status', 'Job Title', 'Reasoning'].join(','),
      ...candidates.map(c => [
        c.candidate_name,
        c.email,
        c.score,
        c.status,
        c.job_title,
        `"${c.reasoning.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `candidates-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-w-0 space-y-8 px-1 sm:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="mb-2 text-2xl font-figtree font-extralight text-[#2D2DDD] md:text-3xl dark:text-white">
              Real Candidates from N8N
            </h1>
            <p className="text-base font-figtree font-light text-gray-600 md:text-lg dark:text-gray-400">
              AI-processed candidates from your n8n workflow
            </p>
            <p className="text-sm text-muted-foreground font-figtree font-light">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
            <Button
              type="button"
              onClick={loadRealCandidates}
              variant="outline"
              disabled={isLoading}
              className="min-h-[44px] w-full touch-manipulation sm:min-h-10 sm:w-auto"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin-smooth' : ''}`} />
              Refresh
            </Button>
            <Button
              type="button"
              onClick={exportCandidates}
              variant="outline"
              className="min-h-[44px] w-full touch-manipulation sm:min-h-10 sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
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
            <p className="text-muted-foreground">Loading real candidates from n8n...</p>
          </div>
        </motion.div>
      )}

      {/* Candidates Grid */}
      {!isLoading && (
        <div className="space-y-6">
          {candidates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No candidates processed yet</h3>
              <p className="text-muted-foreground mb-6">
                Candidates will appear here after your n8n workflow processes job applications
              </p>
            </motion.div>
          ) : (
            candidates.map((candidate, index) => (
              <motion.div
                key={`${candidate.email}-${candidate.job_posting_id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'tween', duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
                className="gpu-accelerated"
              >
                <Card className="group transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-4 sm:p-6">
                    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2 gap-y-2">
                          <h3 className="text-lg font-semibold font-figtree">{candidate.candidate_name}</h3>
                          <Badge className={`${getStatusColor(candidate.status)} flex items-center gap-1`}>
                            {getStatusIcon(candidate.status)}
                            {candidate.status}
                          </Badge>
                          <div className={`flex items-center gap-1 ${getScoreColor(candidate.score)}`}>
                            <Star className="h-4 w-4" />
                            <span className="font-semibold">{candidate.score}/100</span>
                          </div>
                        </div>
                        
                        <div className="mb-3 flex flex-col gap-2 text-sm text-muted-foreground font-figtree font-light sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
                          <div className="flex min-w-0 items-center gap-1">
                            <Mail className="h-4 w-4 shrink-0" />
                            <span className="break-all">{candidate.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 shrink-0" />
                            {new Date(candidate.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h5 className="text-sm font-semibold text-gray-700 mb-2 font-figtree">AI Analysis</h5>
                          <p className="text-sm text-gray-600 font-figtree font-light leading-relaxed">
                            {candidate.reasoning}
                          </p>
                        </div>
                        
                        <div className="text-sm text-muted-foreground font-figtree font-light">
                          <strong>Job:</strong> {candidate.job_title}
                        </div>
                      </div>
                      
                      <div className="flex shrink-0 items-center gap-2 sm:ml-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCandidate(candidate)}
                          className="min-h-[44px] min-w-[44px] touch-manipulation sm:min-h-9 sm:min-w-0 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
                          aria-label="View candidate details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={() => setSelectedCandidate(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-h-[min(90dvh,40rem)] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-lg sm:p-6 sm:pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold sm:text-xl">Candidate Details</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedCandidate(null)}
                className="min-h-[44px] shrink-0 touch-manipulation sm:min-h-9"
              >
                Close
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Basic Information</h4>
                <div className="grid grid-cols-1 gap-3 text-sm min-[400px]:grid-cols-2 min-[400px]:gap-4">
                  <div>
                    <span className="font-medium">Name:</span> {selectedCandidate.candidate_name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedCandidate.email}
                  </div>
                  <div>
                    <span className="font-medium">Score:</span> 
                    <span className={`ml-1 font-semibold ${getScoreColor(selectedCandidate.score)}`}>
                      {selectedCandidate.score}/100
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge className={`ml-1 ${getStatusColor(selectedCandidate.status)}`}>
                      {selectedCandidate.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Job Information</h4>
                <div className="text-sm">
                  <div><span className="font-medium">Position:</span> {selectedCandidate.job_title}</div>
                  <div><span className="font-medium">Company:</span> {selectedCandidate.company_name}</div>
                  <div><span className="font-medium">Processed:</span> {new Date(selectedCandidate.created_at).toLocaleString()}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">AI Analysis</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedCandidate.reasoning}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
