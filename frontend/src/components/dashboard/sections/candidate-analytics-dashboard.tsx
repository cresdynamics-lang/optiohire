'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, Eye, FileBadge, ArrowUpRight, Trophy, Crown, Medal } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const PIE_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#06b6d4']

export function CandidateAnalyticsDashboard({ data }: { data: any }) {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/candidate/leaderboard?time=all_time&category=all', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setLeaderboard(result.leaderboard.slice(0, 3))
        }
      })
      .catch(err => console.error('Error fetching leaderboard', err))
  }, [])

  if (!data) {
    return <Skeleton className="h-[400px] w-full rounded-3xl" />
  }

  const scoreHistory = data.scoreHistory || []
  const missingSkills = data.gapAnalysis?.allMissingSkills || []
  
  // Dummy logic for Profile Completion
  const profileCompletionData = [
    { name: 'Skills', value: data.skills?.length * 10 || 40 },
    { name: 'Experience', value: 30 },
    { name: 'Missing Gaps', value: missingSkills.length * 10 || 30 },
  ]

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-amber-400" />
    if (index === 1) return <Medal className="h-5 w-5 text-slate-300" />
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="font-bold text-slate-500 w-5 text-center">{index + 1}</span>
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-1 pb-4 sm:px-0">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-3xl border border-slate-200/90 bg-white text-slate-900 shadow-xl dark:border-gray-800 dark:bg-[#12141d] dark:text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Profile Score</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold tracking-tight">{data.profile?.total_score || 0}</h3>
                  <span className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-500">
                    <TrendingUp className="mr-1 h-3 w-3" /> +12%
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <FileBadge className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Top 20% in your talent pool
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/90 bg-white text-slate-900 shadow-xl dark:border-gray-800 dark:bg-[#12141d] dark:text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Job Matches</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold tracking-tight">{data.recommendations?.length || 0}</h3>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <ArrowUpRight className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              {data.recommendations?.filter((r: any) => r.match_score >= 80).length || 0} perfect fits available
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/90 bg-white text-slate-900 shadow-xl dark:border-gray-800 dark:bg-[#12141d] dark:text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Recruiter Views</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold tracking-tight">{data.recruiterViewsCount || 0}</h3>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <Eye className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Across all employer workspaces
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-xl dark:border-gray-800 dark:bg-[#12141d]">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white">Profile Score Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreHistory.length ? scoreHistory : [{ recorded_at: 'Today', total_score: data.profile?.total_score || 0 }]}>
                  <XAxis dataKey="recorded_at" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Line type="monotone" dataKey="total_score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-xl dark:border-gray-800 dark:bg-[#12141d]">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white">Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={profileCompletionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {profileCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 flex justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                {profileCompletionData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-xl dark:border-gray-800 dark:bg-[#12141d]">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white">AI Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <TrendingUp className="h-4 w-4" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Your profile score is currently {data.profile?.total_score || 0}. You are positioned above average for entry-level candidates. Keep completing missions!
              </p>
            </div>
            {missingSkills.length > 0 && (
              <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                  <FileBadge className="h-4 w-4" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Adding a <strong>{missingSkills[0]?.skill}</strong> certificate makes you eligible for {missingSkills[0]?.count || 5} more roles. This is your highest-impact next step.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-xl dark:border-gray-800 dark:bg-[#12141d]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-indigo-500" />
              Leaderboard Top Performers
            </CardTitle>
            <Link href="/candidate/leaderboard">
              <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400 text-xs">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
              {leaderboard.length === 0 ? (
                <div className="text-sm text-slate-500">Loading leaderboard...</div>
              ) : (
                leaderboard.map((candidate, index) => {
                  const isCurrentUser = candidate.candidate_name === user?.name || candidate.candidate_name === user?.email?.split('@')[0]
                  return (
                    <div key={candidate.profile_id} className={`flex items-center justify-between p-3 rounded-xl border ${isCurrentUser ? 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-slate-50 border-slate-100 dark:bg-gray-900 dark:border-gray-800'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-6 flex justify-center">
                          {getRankIcon(index)}
                        </div>
                        <img src={candidate.avatar} alt="avatar" className="h-8 w-8 rounded-full bg-slate-200 dark:bg-gray-800" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            {candidate.candidate_name}
                            {isCurrentUser && <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full dark:bg-indigo-900 dark:text-indigo-300">YOU</span>}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {candidate.total_score} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">pts</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
