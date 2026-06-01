'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { JobRecommendations } from '@/components/candidate/JobRecommendations'
import { SkillGapRoadmap } from '@/components/candidate/SkillGapRoadmap'
import { Trophy, TrendingUp, Target, ShieldCheck } from 'lucide-react'
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
  }[]
  recommendations: any[]
  gapAnalysis: {
    topMissingSkill: string | null
    insight: string
    allMissingSkills: any[]
  }
}

export default function CandidateDashboardPage() {
  const [data, setData] = useState<CandidateDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!data) return <div>Failed to load data</div>

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Talent Profile Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your skills, close gaps, and get hired.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-indigo-100 font-medium mb-1">Total Profile Score</p>
                <h2 className="text-4xl font-bold">{data.profile.total_score}</h2>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground font-medium mb-1">Verified Skills</p>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
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
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
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
              <CardDescription>Skills you've acquired and their scores.</CardDescription>
            </CardHeader>
            <CardContent>
              {data.skills.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No skills recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {data.skills.map(skill => (
                    <div key={skill.skill_id} className="flex justify-between items-center border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium flex items-center">
                          {skill.skill_name}
                          {skill.is_verified && <ShieldCheck className="h-3 w-3 ml-1 text-green-500" />}
                        </p>
                        <p className="text-xs text-muted-foreground">Score: {skill.proficiency_score}</p>
                      </div>
                      <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500" 
                          style={{ width: `${Math.min(100, Math.max(10, skill.proficiency_score))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
