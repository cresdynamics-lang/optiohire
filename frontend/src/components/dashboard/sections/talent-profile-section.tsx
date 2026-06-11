'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JobRecommendations } from '@/components/candidate/JobRecommendations'
import { SkillGapRoadmap } from '@/components/candidate/SkillGapRoadmap'
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Briefcase,
  Check,
  Clock,
  GraduationCap,
  Loader2,
  Mic,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UploadCloud,
  X,
  Zap,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CandidateSkill {
  skill_id: string
  skill_name: string
  proficiency_score: number
  is_verified: boolean
  certificate_status?: string | null
  certificate_rejection_reason?: string | null
}

interface CandidateMission {
  mission_id: string
  mission_title: string
  mission_description: string
  target_skill: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  learning_resources?: any[]
}

interface InterviewSession {
  session_id?: string | null
  interview_type: string
  target_role?: string | null
  level?: string | null
  overall_score: number
  clarity_score?: number
  relevance_score?: number
  depth_score?: number
  feedback?: string | null
  recommendations?: string[] | any
  created_at: string
}

interface CandidateDashboardData {
  profile: {
    profile_id: string
    total_score: number
  }
  skills: CandidateSkill[]
  recommendations: any[]
  gapAnalysis: {
    topMissingSkill: string | null
    insight: string
    allMissingSkills: { skill: string; count: number }[]
  }
  missions?: CandidateMission[]
  interviewSessions?: InterviewSession[]
}

const INTERVIEW_QUESTIONS: Record<string, string[]> = {
  Behavioural: [
    'Tell me about a project where you had to learn something quickly. What was your approach?',
    'Describe a time you received difficult feedback. What changed after that?',
    'Walk me through a measurable achievement you would want a recruiter to remember.',
  ],
  Technical: [
    'Explain a technical problem you solved recently and the trade-offs you considered.',
    'How would you debug a production issue that only happens for some users?',
    'What skill gap are you actively closing, and how are you proving progress?',
  ],
  'HR Round': [
    'Why are you interested in this role and company?',
    'What kind of team environment helps you do your best work?',
    'What salary or growth expectations would you communicate in a first HR call?',
  ],
}

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

function normalizeRecommendations(value: any): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export function TalentProfileSection() {
  const [data, setData] = useState<CandidateDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingSkillId, setUploadingSkillId] = useState<string | null>(null)
  const [certUrl, setCertUrl] = useState('')
  const [certFile, setCertFile] = useState<File | null>(null)
  const [missionLoading, setMissionLoading] = useState<string | null>(null)
  const [interviewType, setInterviewType] = useState<keyof typeof INTERVIEW_QUESTIONS>('Behavioural')
  const [targetRole, setTargetRole] = useState('')
  const [level, setLevel] = useState('Mid-level')
  const [answers, setAnswers] = useState<string[]>(['', '', ''])
  const [interviewLoading, setInterviewLoading] = useState(false)
  const [latestReport, setLatestReport] = useState<InterviewSession | null>(null)

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/candidate/dashboard', { headers: authHeaders() })
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      } else {
        toast.error(result.error || 'Failed to load talent profile data')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  useEffect(() => {
    setAnswers(INTERVIEW_QUESTIONS[interviewType].map(() => ''))
  }, [interviewType])

  const stats = useMemo(() => {
    const skills = data?.skills || []
    const sessions = data?.interviewSessions || []
    const avgInterview = sessions.length
      ? Math.round(sessions.reduce((sum, session) => sum + Number(session.overall_score || 0), 0) / sessions.length)
      : 0

    return {
      verifiedSkills: skills.filter((skill) => skill.is_verified || skill.certificate_status === 'APPROVED').length,
      gapSkills: skills.filter((skill) => !skill.is_verified && skill.certificate_status !== 'APPROVED').length,
      rejectedCerts: skills.filter((skill) => skill.certificate_status === 'REJECTED').length,
      avgInterview,
    }
  }, [data])

  const completeMission = async (missionId: string) => {
    setMissionLoading(missionId)
    try {
      const res = await fetch(`/api/candidate/missions/${missionId}/complete`, {
        method: 'POST',
        headers: authHeaders(),
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to complete mission')
      toast.success('Mission completed. Growth score updated.')
      await fetchDashboard()
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete mission')
    } finally {
      setMissionLoading(null)
    }
  }

  const handleUpload = async (skillId: string) => {
    if (!certUrl && !certFile) {
      toast.error('Please enter a certificate URL or upload a file')
      return
    }

    try {
      const formData = new FormData()
      formData.append('skillId', skillId)
      if (certUrl) formData.append('certificateUrl', certUrl)
      if (certFile) formData.append('certificate', certFile)

      const res = await fetch('/api/candidate/certificate', {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      })
      const result = await res.json()
      if (result.success || res.ok) {
        toast.success('Certificate uploaded successfully.')
        setUploadingSkillId(null)
        setCertUrl('')
        setCertFile(null)
        fetchDashboard()
      } else {
        toast.error(result.error || 'Failed to upload certificate')
      }
    } catch {
      toast.error('Network error')
    }
  }

  const submitInterview = async () => {
    if (answers.every((answer) => !answer.trim())) {
      toast.error('Answer at least one question before submitting.')
      return
    }

    setInterviewLoading(true)
    try {
      const res = await fetch('/api/candidate/mock-interview', {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewType,
          targetRole: targetRole || data?.recommendations?.[0]?.job_title || null,
          level,
          answers,
        }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to submit interview')
      setLatestReport(result.session)
      toast.success('Mock interview report generated.')
      await fetchDashboard()
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit interview')
    } finally {
      setInterviewLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#2D2DDD]" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-900 dark:text-white">
        Failed to load talent profile data. Please try refreshing.
      </div>
    )
  }

  const activeMission = data.missions?.find((mission) => mission.status !== 'COMPLETED') || data.missions?.[0]
  const topSkill = data.gapAnalysis.topMissingSkill || data.skills[0]?.skill_name || 'interview confidence'

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">Candidate workspace</p>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Talent Profile Dashboard</h1>
          <p className="mt-1 max-w-2xl text-slate-900 dark:text-white">
            Build proof, close skill gaps, practice interviews, and become easier for recruiters to shortlist.
          </p>
        </div>
        <div className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
          Growth score: {data.profile.total_score}
        </div>
      </div>

      <Card className="overflow-hidden border-indigo-100 bg-gradient-to-br from-indigo-600 via-slate-900 to-purple-700 text-white">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <Zap className="h-3.5 w-3.5" />
              Today's mission
            </div>
            <h2 className="text-2xl font-bold">{activeMission?.mission_title || `Practice ${topSkill}`}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100">
              {activeMission?.mission_description || `Spend focused time proving ${topSkill}. This improves your profile quality and recruiter confidence.`}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {activeMission?.mission_id && activeMission.status !== 'COMPLETED' ? (
                <Button
                  onClick={() => completeMission(activeMission.mission_id)}
                  disabled={missionLoading === activeMission.mission_id}
                  className="bg-white text-indigo-700 hover:bg-indigo-50"
                >
                  {missionLoading === activeMission.mission_id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Mark mission done
                </Button>
              ) : (
                <Button className="bg-white text-indigo-700 hover:bg-indigo-50" disabled>
                  <Check className="mr-2 h-4 w-4" />
                  Mission complete
                </Button>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                    <Mic className="mr-2 h-4 w-4" />
                    Practice interview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>AI Mock Interview Practice</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3 sm:grid-cols-3 mt-4">
                    <div className="space-y-2">
                      <Label>Interview type</Label>
                      <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={interviewType} onChange={(event) => setInterviewType(event.target.value as keyof typeof INTERVIEW_QUESTIONS)}>
                        {Object.keys(INTERVIEW_QUESTIONS).map((type) => <option key={type}>{type}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Level</Label>
                      <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={level} onChange={(event) => setLevel(event.target.value)}>
                        <option>Junior</option>
                        <option>Mid-level</option>
                        <option>Senior</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target role</Label>
                      <Input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="e.g. React Developer" />
                    </div>
                  </div>

                  {INTERVIEW_QUESTIONS[interviewType].map((question, index) => (
                    <div key={question} className="space-y-2 mt-2">
                      <Label>Question {index + 1}</Label>
                      <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 dark:text-white">{question}</p>
                      <Textarea
                        value={answers[index] || ''}
                        onChange={(event) => {
                          const next = [...answers]
                          next[index] = event.target.value
                          setAnswers(next)
                        }}
                        placeholder="Type your answer. Use examples, metrics, and trade-offs."
                        rows={4}
                      />
                    </div>
                  ))}

                  <Button onClick={submitInterview} disabled={interviewLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4">
                    {interviewLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate interview report
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <Trophy className="mb-3 h-5 w-5 text-amber-200" />
              <p className="text-3xl font-bold">{data.profile.total_score}</p>
              <p className="text-xs text-indigo-100">Profile score</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <ShieldCheck className="mb-3 h-5 w-5 text-green-200" />
              <p className="text-3xl font-bold">{stats.verifiedSkills}</p>
              <p className="text-xs text-indigo-100">Verified skills</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <Briefcase className="mb-3 h-5 w-5 text-sky-200" />
              <p className="text-3xl font-bold">{data.recommendations.length}</p>
              <p className="text-xs text-indigo-100">Job matches</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <Mic className="mb-3 h-5 w-5 text-purple-200" />
              <p className="text-3xl font-bold">{stats.avgInterview || '-'}</p>
              <p className="text-xs text-indigo-100">Avg interview</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats.rejectedCerts > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
          <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
          <p className="text-sm">
            Fix {stats.rejectedCerts} rejected certificate{stats.rejectedCerts > 1 ? 's' : ''} to unlock up to +{stats.rejectedCerts * 50} more growth points.
          </p>
        </div>
      )}

      <Tabs defaultValue="plan" className="space-y-5">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="plan">Learning Plan</TabsTrigger>
          <TabsTrigger value="interview">Mock Interview</TabsTrigger>
          <TabsTrigger value="jobs">Job Matches</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <SkillGapRoadmap gapAnalysis={data.gapAnalysis} profileId={data.profile.profile_id} />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  Mission Queue
                </CardTitle>
                <CardDescription>Small actions that compound into better recruiter signals.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {(data.missions || []).map((mission) => (
                  <div key={mission.mission_id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{mission.mission_title}</p>
                        <p className="mt-1 text-sm text-slate-900 dark:text-white">{mission.mission_description}</p>
                        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-indigo-600">{mission.target_skill}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${mission.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {mission.status === 'COMPLETED' ? 'Done' : 'Open'}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interview" className="space-y-6" id="mock-interview-panel">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-indigo-600" />
                  AI Mock Interview Practice
                </CardTitle>
                <CardDescription>Answer three focused questions and get a scored readiness report.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Interview type</Label>
                    <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={interviewType} onChange={(event) => setInterviewType(event.target.value as keyof typeof INTERVIEW_QUESTIONS)}>
                      {Object.keys(INTERVIEW_QUESTIONS).map((type) => <option key={type}>{type}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Level</Label>
                    <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={level} onChange={(event) => setLevel(event.target.value)}>
                      <option>Junior</option>
                      <option>Mid-level</option>
                      <option>Senior</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target role</Label>
                    <Input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="e.g. React Developer" />
                  </div>
                </div>

                {INTERVIEW_QUESTIONS[interviewType].map((question, index) => (
                  <div key={question} className="space-y-2">
                    <Label>Question {index + 1}</Label>
                    <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 dark:text-white">{question}</p>
                    <Textarea
                      value={answers[index] || ''}
                      onChange={(event) => {
                        const next = [...answers]
                        next[index] = event.target.value
                        setAnswers(next)
                      }}
                      placeholder="Type your answer. Use examples, metrics, and trade-offs."
                      rows={4}
                    />
                  </div>
                ))}

                <Button onClick={submitInterview} disabled={interviewLoading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  {interviewLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate interview report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interview Report</CardTitle>
                <CardDescription>Your latest practice score and coaching notes.</CardDescription>
              </CardHeader>
              <CardContent>
                {latestReport ? (
                  <InterviewReport session={latestReport} />
                ) : data.interviewSessions?.length ? (
                  <InterviewReport session={data.interviewSessions[0]} />
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-900 dark:text-white">
                    Complete a mock interview to generate your first report.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Past Sessions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {(data.interviewSessions || []).map((session) => (
                <div key={session.session_id || session.created_at} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{session.interview_type}</p>
                      <p className="text-xs text-slate-900 dark:text-white">{new Date(session.created_at).toLocaleString()}</p>
                    </div>
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700">{session.overall_score}%</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-900 dark:text-white">{session.feedback}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <JobRecommendations recommendations={data.recommendations} />
        </TabsContent>

        <TabsContent value="skills">
          <SkillInventory
            skills={data.skills}
            uploadingSkillId={uploadingSkillId}
            setUploadingSkillId={setUploadingSkillId}
            certUrl={certUrl}
            setCertUrl={setCertUrl}
            certFile={certFile}
            setCertFile={setCertFile}
            handleUpload={handleUpload}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard icon={Trophy} label="Growth score" value={data.profile.total_score} />
            <MetricCard icon={ShieldCheck} label="Verified skills" value={stats.verifiedSkills} />
            <MetricCard icon={Target} label="Open gaps" value={stats.gapSkills} />
            <MetricCard icon={BarChart3} label="Avg mock score" value={stats.avgInterview || '-'} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InterviewReport({ session }: { session: InterviewSession }) {
  const recommendations = normalizeRecommendations(session.recommendations)
  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-5xl font-bold text-indigo-600">{session.overall_score}%</p>
        <p className="mt-1 text-sm text-slate-900 dark:text-white">overall readiness</p>
      </div>
      <div className="space-y-3">
        <ScoreBar label="Clarity" value={session.clarity_score || session.overall_score} />
        <ScoreBar label="Relevance" value={session.relevance_score || session.overall_score} />
        <ScoreBar label="Depth" value={session.depth_score || session.overall_score} />
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 dark:text-white">
        {session.feedback || 'Practice report generated.'}
      </div>
      {recommendations.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">Next practice actions</p>
          <ul className="space-y-2 text-sm text-slate-900 dark:text-white">
            {recommendations.map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 text-green-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-medium text-slate-900 dark:text-white">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-indigo-600" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <Icon className="mb-3 h-5 w-5 text-indigo-600" />
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-900 dark:text-white">{label}</p>
      </CardContent>
    </Card>
  )
}

function SkillInventory({
  skills,
  uploadingSkillId,
  setUploadingSkillId,
  certUrl,
  setCertUrl,
  certFile,
  setCertFile,
  handleUpload,
}: {
  skills: CandidateSkill[]
  uploadingSkillId: string | null
  setUploadingSkillId: (id: string | null) => void
  certUrl: string
  setCertUrl: (url: string) => void
  certFile: File | null
  setCertFile: (file: File | null) => void
  handleUpload: (skillId: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-indigo-600" />
          Skills Inventory
        </CardTitle>
        <CardDescription>Upload certificates to verify skills and earn growth points.</CardDescription>
      </CardHeader>
      <CardContent>
        {skills.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No skills recorded yet.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {skills.map((skill) => {
              const isApproved = skill.certificate_status === 'APPROVED' || skill.is_verified
              const isPending = skill.certificate_status === 'PENDING'
              const isRejected = skill.certificate_status === 'REJECTED'
              const hasNoCert = !isApproved && !isPending && !isRejected

              return (
                <div key={skill.skill_id} className={`rounded-xl border p-4 ${isRejected ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{skill.skill_name}</p>
                      <ScoreBar label="Proficiency" value={skill.proficiency_score} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {isApproved && <StatusPill tone="green" icon={Check} label="Verified" />}
                      {isPending && <StatusPill tone="amber" icon={Clock} label="Pending" />}
                      {isRejected && <StatusPill tone="red" icon={X} label="Rejected" />}
                      {hasNoCert && (
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setUploadingSkillId(skill.skill_id)}>
                          <UploadCloud className="mr-2 h-3 w-3" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>

                  {isRejected && (
                    <div className="mt-4 rounded border border-red-200 bg-red-100/50 p-3">
                      <p className="mb-1 flex items-center text-sm font-medium text-red-800">
                        <AlertCircle className="mr-1 h-4 w-4" />
                        Rejection reason
                      </p>
                      <p className="mb-3 text-sm text-red-900">{skill.certificate_rejection_reason || 'Certificate did not meet requirements.'}</p>
                      <Button variant="outline" size="sm" className="bg-white" onClick={() => setUploadingSkillId(skill.skill_id)}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Re-upload certificate
                      </Button>
                    </div>
                  )}

                  <Dialog open={uploadingSkillId === skill.skill_id} onOpenChange={(open) => setUploadingSkillId(open ? skill.skill_id : null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Verify Skill: {skill.skill_name}</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 space-y-4">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Choose one option to verify your skill:</p>
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Certificate link</Label>
                            <Input
                              placeholder="https://coursera.org/..."
                              value={certUrl}
                              onChange={(event) => {
                                setCertUrl(event.target.value)
                                if (event.target.value) setCertFile(null)
                              }}
                            />
                          </div>
                          <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">OR</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Upload file</Label>
                            <Input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              onChange={(event) => {
                                if (event.target.files?.[0]) {
                                  setCertFile(event.target.files[0])
                                  setCertUrl('')
                                }
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                          <Button variant="ghost" onClick={() => setUploadingSkillId(null)}>Cancel</Button>
                          <Button disabled={!certUrl && !certFile} onClick={() => { handleUpload(skill.skill_id); setUploadingSkillId(null); }} className="bg-[#2D2DDD] text-white hover:bg-[#2525c4]">Submit to Admin</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatusPill({ tone, icon: Icon, label }: { tone: 'green' | 'amber' | 'red'; icon: any; label: string }) {
  const classes = {
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${classes[tone]}`}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </span>
  )
}
