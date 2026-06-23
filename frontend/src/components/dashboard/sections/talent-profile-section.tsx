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
import { ProfileOnboardingModal } from '@/components/candidate/ProfileOnboardingModal'
import { ReturneeUpdateModal } from '@/components/candidate/ReturneeUpdateModal'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
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
    bio?: string
    job_category?: string
    cv_url?: string | null
    is_returning?: boolean
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
  needsAlumniUpdate?: boolean
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
  const [isUploading, setIsUploading] = useState(false)
  const [missionLoading, setMissionLoading] = useState<string | null>(null)
  const [interviewType, setInterviewType] = useState<keyof typeof INTERVIEW_QUESTIONS>('Behavioural')
  const [targetRole, setTargetRole] = useState('')
  const [level, setLevel] = useState('Mid-level')
  const [answers, setAnswers] = useState<string[]>(['', '', ''])
  const [interviewLoading, setInterviewLoading] = useState(false)
  const [latestReport, setLatestReport] = useState<InterviewSession | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasPromptedOnboarding, setHasPromptedOnboarding] = useState(false)
  const [showAlumniUpdate, setShowAlumniUpdate] = useState(false)
  const [hasPromptedAlumni, setHasPromptedAlumni] = useState(false)

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/candidate/dashboard', { headers: authHeaders() })
      const result = await res.json()
      if (result.success) {
        setData(result.data)
        // Show onboarding modal if profile is incomplete and hasn't been prompted yet
        if (result.data?.profile && !result.data.profile.bio && !result.data.profile.job_category && !result.data.profile.cv_url && !hasPromptedOnboarding && !result.data.needsAlumniUpdate) {
          setShowOnboarding(true)
          setHasPromptedOnboarding(true)
        }
        
        // Show alumni update modal if candidate is a returning alumni
        if (result.data?.needsAlumniUpdate && !hasPromptedAlumni) {
          setShowAlumniUpdate(true)
          setHasPromptedAlumni(true)
        }
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
      setIsUploading(true)
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
    } finally {
      setIsUploading(false)
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
            Build proof, close skill gaps, and become easier for recruiters to shortlist.
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
            Growth score: {data.profile.total_score}
          </div>
          {(!data.profile.bio && !data.profile.job_category && !data.profile.cv_url) && !data.profile.is_returning && (
            <Button variant="outline" size="sm" onClick={() => setShowOnboarding(true)}>
              Complete Profile
            </Button>
          )}
          {data.profile.is_returning && (
            <div className="rounded-full border border-yellow-200 bg-yellow-50 px-4 py-1 text-xs font-semibold text-yellow-700">
              Alumni Bonus Active
            </div>
          )}
          {!data.profile.is_returning && (
            <Button variant="ghost" size="sm" onClick={() => setShowAlumniUpdate(true)} className="text-indigo-600 hover:text-indigo-800 text-xs mt-1 underline">
              Looking for new opportunities?
            </Button>
          )}
        </div>
      </div>
      
      <ProfileOnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
        onSuccess={fetchDashboard} 
      />

      <ReturneeUpdateModal
        isOpen={showAlumniUpdate}
        onClose={() => setShowAlumniUpdate(false)}
        onSuccess={fetchDashboard}
      />

      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="p-8 border-b lg:border-b-0 lg:border-r border-slate-100">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
                <Zap className="h-3.5 w-3.5" />
                Today&apos;s mission
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{activeMission?.mission_title || `Practice ${topSkill}`}</h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
                {activeMission?.mission_description || `Spend focused time proving ${topSkill}. This improves your profile quality and recruiter confidence.`}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {activeMission?.mission_id && activeMission.status !== 'COMPLETED' ? (
                  <Button
                    onClick={() => completeMission(activeMission.mission_id)}
                    disabled={missionLoading === activeMission.mission_id}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all active:scale-95 px-6 py-6 rounded-2xl text-base"
                  >
                    {missionLoading === activeMission.mission_id ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
                    Mark mission done
                  </Button>
                ) : (
                  <Button className="bg-slate-100 text-slate-500 cursor-not-allowed px-6 py-6 rounded-2xl text-base" disabled>
                    <Check className="mr-2 h-5 w-5" />
                    Mission complete
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-slate-50/50 p-8 flex flex-col justify-center">
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 shadow-sm border border-amber-100">
                    <Trophy className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{data.profile.total_score}</p>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Profile score</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 shadow-sm border border-emerald-100">
                    <ShieldCheck className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.verifiedSkills}</p>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Verified skills</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 shadow-sm border border-sky-100">
                    <Briefcase className="h-6 w-6 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{data.recommendations.length}</p>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Job matches</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats.rejectedCerts > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-rose-800 shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 text-rose-600" />
          <p className="text-sm font-medium">
            Fix {stats.rejectedCerts} rejected certificate{stats.rejectedCerts > 1 ? 's' : ''} to unlock up to +{stats.rejectedCerts * 50} more growth points.
          </p>
        </div>
      )}

      <Tabs defaultValue="plan" className="space-y-8">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pt-2 pb-4 border-b border-slate-100">
          <TabsList className="flex h-auto w-full max-w-2xl bg-transparent p-0 gap-8">
            <TabsTrigger value="plan" className="px-0 py-2 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none text-base font-semibold transition-all">Learning Plan</TabsTrigger>
            <TabsTrigger value="jobs" className="px-0 py-2 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none text-base font-semibold transition-all">Job Matches</TabsTrigger>
            <TabsTrigger value="skills" className="px-0 py-2 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none text-base font-semibold transition-all">Skills</TabsTrigger>
            <TabsTrigger value="analytics" className="px-0 py-2 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none text-base font-semibold transition-all">Analytics</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="plan" className="space-y-12 pt-4">
          <div className="max-w-4xl space-y-12">
            <section>
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="h-8 w-1 bg-indigo-600 rounded-full" />
                Strategic Skill Gap
              </h3>
              <SkillGapRoadmap gapAnalysis={data.gapAnalysis} profileId={data.profile.profile_id} />
            </section>

            <section>
              <div className="flex flex-col gap-1 mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="h-8 w-1 bg-indigo-600 rounded-full" />
                  Mission Queue
                </h3>
                <p className="text-sm text-slate-500 ml-4">Small actions that compound into better recruiter signals.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {(data.missions || []).map((mission) => (
                  <div key={mission.mission_id} className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="font-bold text-slate-900 text-lg group-hover:text-indigo-700 transition-colors">{mission.mission_title}</p>
                          <p className="mt-1 text-sm text-slate-600 leading-relaxed">{mission.mission_description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {mission.target_skill}
                          </span>
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${mission.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
                        {mission.status === 'COMPLETED' ? 'Done' : 'Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
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
            isUploading={isUploading}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard icon={Trophy} label="Growth score" value={data.profile.total_score} />
            <MetricCard icon={ShieldCheck} label="Verified skills" value={stats.verifiedSkills} />
            <MetricCard icon={Target} label="Open gaps" value={stats.gapSkills} />
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
  isUploading,
}: {
  skills: CandidateSkill[]
  uploadingSkillId: string | null
  setUploadingSkillId: (id: string | null) => void
  certUrl: string
  setCertUrl: (url: string) => void
  certFile: File | null
  setCertFile: (file: File | null) => void
  handleUpload: (skillId: string) => void
  isUploading: boolean
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
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="h-[350px] w-full rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-900">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skills}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill_name" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Skills" dataKey="proficiency_score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
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
                            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Upload file (Drag & Drop)</Label>
                            <div className="flex w-full items-center justify-center">
                              <label
                                htmlFor={`dropzone-file-${skill.skill_id}`}
                                className="dark:hover:bg-bray-800 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                              >
                                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                  <UploadCloud className="mb-2 h-6 w-6 text-gray-500 dark:text-gray-400" />
                                  <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">PDF, PNG, JPG (MAX. 5MB)</p>
                                </div>
                                <input
                                  id={`dropzone-file-${skill.skill_id}`}
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.png,.jpg,.jpeg"
                                  onChange={(event) => {
                                    if (event.target.files?.[0]) {
                                      setCertFile(event.target.files[0])
                                      setCertUrl('')
                                    }
                                  }}
                                />
                              </label>
                            </div>
                            {certFile && <p className="text-sm text-green-600 mt-2">Selected: {certFile.name}</p>}
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                          <Button variant="ghost" disabled={isUploading} onClick={() => setUploadingSkillId(null)}>Cancel</Button>
                          <Button disabled={(!certUrl && !certFile) || isUploading} onClick={() => { handleUpload(skill.skill_id); }} className="bg-[#2D2DDD] text-white hover:bg-[#2525c4]">
                            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isUploading ? 'Uploading...' : 'Submit to Admin'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )
            })}
            </div>
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
