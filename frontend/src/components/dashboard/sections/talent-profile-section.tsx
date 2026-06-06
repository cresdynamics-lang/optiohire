'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { JobRecommendations } from '@/components/candidate/JobRecommendations'
import { SkillGapRoadmap } from '@/components/candidate/SkillGapRoadmap'
import { Trophy, TrendingUp, Target, ShieldCheck, Check, Clock, X, AlertCircle, UploadCloud, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CandidateDashboardData {
  profile: {
    profile_id: string
    total_score: number
  }
  skills: {
    skill_id: string
    skill_name: string
    proficiency_score: number
    is_verified: boolean
    certificate_status?: string | null
    certificate_rejection_reason?: string | null
  }[]
  recommendations: any[]
  gapAnalysis: {
    topMissingSkill: string | null
    insight: string
    allMissingSkills: any[]
  }
}

export function TalentProfileSection() {
  const [data, setData] = useState<CandidateDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingSkillId, setUploadingSkillId] = useState<string | null>(null)
  const [certUrl, setCertUrl] = useState('')

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/candidate/dashboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      } else {
        toast.error('Failed to load dashboard data')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const [certFile, setCertFile] = useState<File | null>(null)

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
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })
      const result = await res.json()
      if (result.success || res.ok) {
        toast.success('Certificate uploaded successfully!')
        setUploadingSkillId(null)
        setCertUrl('')
        setCertFile(null)
        fetchDashboard()
      } else {
        toast.error(result.error || 'Failed to upload certificate')
      }
    } catch (err) {
      toast.error('Network error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D2DDD]"></div>
      </div>
    )
  }

  if (!data) return <div className="p-8 text-center text-slate-600 bg-white rounded-3xl border border-slate-200">Failed to load talent profile data. Please try refreshing.</div>

  const rejectedCount = data.skills.filter(s => s.certificate_status === 'REJECTED').length

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Talent Profile Dashboard</h1>
        <p className="text-slate-600 mt-1">Track your skills, close gaps, and get hired.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-md relative overflow-hidden">
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-indigo-100 font-medium mb-1">Total Profile Score</p>
                <h2 className="text-4xl font-bold">{data.profile.total_score}</h2>
                <p className="text-sm text-green-300 flex items-center mt-2 font-medium">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Approved certificates add +50 growth points
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground font-medium mb-1">Verified Skills</p>
                <h2 className="text-3xl font-bold text-foreground">
                  {data.skills.filter(s => s.is_verified).length}
                </h2>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground font-medium mb-1">Perfect Job Matches</p>
                <h2 className="text-3xl font-bold text-foreground">
                  {data.recommendations.length}
                </h2>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {rejectedCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 text-blue-600" />
          <p className="text-sm">
            Your growth score improves your shortlist ranking. Fix the {rejectedCount} rejected certificate{rejectedCount > 1 ? 's' : ''} to unlock +{rejectedCount * 50} more points and move up in the rankings.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Target className="mr-2 h-6 w-6 text-indigo-500" />
              AI Job Recommendations
            </h2>
            <JobRecommendations recommendations={data.recommendations} />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <TrendingUp className="mr-2 h-6 w-6 text-indigo-500" />
              Skill Gap Analysis
            </h2>
            <SkillGapRoadmap gapAnalysis={data.gapAnalysis} profileId={data.profile.profile_id} />
          </section>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Skills Inventory</CardTitle>
              <CardDescription>Upload certificates to verify your skills and earn growth points</CardDescription>
            </CardHeader>
            <CardContent>
              {data.skills.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No skills recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {data.skills.map(skill => {
                    const isApproved = skill.certificate_status === 'APPROVED' || skill.is_verified
                    const isPending = skill.certificate_status === 'PENDING'
                    const isRejected = skill.certificate_status === 'REJECTED'
                    const hasNoCert = !isApproved && !isPending && !isRejected

                    return (
                      <div 
                        key={skill.skill_id} 
                        className={`p-4 rounded-xl border ${isRejected ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-slate-900">{skill.skill_name}</p>
                            <p className="text-xs text-muted-foreground">Self-assessed • Score: {skill.proficiency_score}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {isApproved && (
                              <>
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">+ 50 pts</span>
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center font-medium">
                                  <Check className="h-3 w-3 mr-1" /> Approved
                                </span>
                              </>
                            )}
                            {isPending && (
                              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full flex items-center font-medium">
                                <Clock className="h-3 w-3 mr-1" /> Pending review
                              </span>
                            )}
                            {isRejected && (
                              <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full flex items-center font-medium">
                                <X className="h-3 w-3 mr-1" /> Rejected
                              </span>
                            )}
                            {hasNoCert && uploadingSkillId !== skill.skill_id && (
                              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setUploadingSkillId(skill.skill_id)}>
                                <UploadCloud className="h-3 w-3 mr-2" /> Upload certificate
                              </Button>
                            )}
                          </div>
                        </div>

                        {isRejected && (
                          <div className="mt-4 p-3 bg-red-100/50 rounded border border-red-200">
                            <p className="text-sm font-medium text-red-800 flex items-center mb-1">
                              <AlertCircle className="h-4 w-4 mr-1" /> Rejection reason
                            </p>
                            <p className="text-sm text-red-900 mb-3">{skill.certificate_rejection_reason || 'Certificate did not meet requirements.'}</p>
                            
                            {uploadingSkillId !== skill.skill_id ? (
                              <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50" onClick={() => setUploadingSkillId(skill.skill_id)}>
                                <UploadCloud className="h-4 w-4 mr-2" /> Re-upload certificate
                              </Button>
                            ) : null}
                          </div>
                        )}

                        {uploadingSkillId === skill.skill_id && (
                          <div className="mt-4 flex flex-col gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-sm font-medium text-slate-700">Choose one option to verify your skill:</p>
                            <div className="flex flex-col md:flex-row gap-4">
                              <div className="flex-1 space-y-1">
                                <Label className="text-xs text-slate-500">Option 1: Link</Label>
                                <Input 
                                  placeholder="Certificate URL (e.g., https://coursera.org/...)" 
                                  value={certUrl}
                                  onChange={(e) => {
                                    setCertUrl(e.target.value);
                                    if (e.target.value) setCertFile(null);
                                  }}
                                  className="h-9 text-sm bg-white"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <Label className="text-xs text-slate-500">Option 2: Upload File</Label>
                                <Input 
                                  type="file"
                                  accept=".pdf,.png,.jpg,.jpeg"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      setCertFile(e.target.files[0]);
                                      setCertUrl('');
                                    }
                                  }}
                                  className="h-9 text-sm bg-white cursor-pointer"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end mt-2">
                              <Button variant="ghost" size="sm" onClick={() => { setUploadingSkillId(null); setCertUrl(''); setCertFile(null); }}>Cancel</Button>
                              <Button size="sm" disabled={!certUrl && !certFile} onClick={() => handleUpload(skill.skill_id)}>Submit to Admin</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
