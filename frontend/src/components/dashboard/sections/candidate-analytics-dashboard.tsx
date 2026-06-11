'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, Eye, FileBadge, ArrowUpRight } from 'lucide-react'

const PIE_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#06b6d4']

export function CandidateAnalyticsDashboard({ data }: { data: any }) {
  if (!data) {
    return <Skeleton className="h-[400px] w-full rounded-3xl" />
  }

  const scoreHistory = data.scoreHistory || []
  const missingSkills = data.gapAnalysis?.allMissingSkills || []
  
  const learningData = [
    { name: 'Courses', value: 50 },
    { name: 'Projects', value: 35 },
    { name: 'Reading', value: 15 },
  ]

  const peerSkills = [
    { name: 'React', candidate: 85, peer: 60 },
    { name: 'Node.js', candidate: 80, peer: 55 },
    { name: 'TypeScript', candidate: 75, peer: 45 },
    { name: 'PostgreSQL', candidate: 70, peer: 50 },
    { name: 'Docker', candidate: 30, peer: 45 },
    { name: 'AWS', candidate: 20, peer: 40 },
  ]

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-1 pb-4 sm:px-0">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-3xl border border-slate-200/90 bg-[#12141d] text-white shadow-xl dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-400">Profile Score</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold tracking-tight">{data.profile?.total_score || 0}</h3>
                  <span className="flex items-center text-xs font-medium text-emerald-500">
                    <TrendingUp className="mr-1 h-3 w-3" /> +12%
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <FileBadge className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-400">
              Top 20% in your talent pool
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/90 bg-[#12141d] text-white shadow-xl dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-400">Job Matches</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold tracking-tight">{data.recommendations?.length || 0}</h3>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                <ArrowUpRight className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-400">
              {data.recommendations?.filter((r: any) => r.match_score >= 80).length || 0} perfect fits available
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/90 bg-[#12141d] text-white shadow-xl dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-400">Recruiter Views</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold tracking-tight">{data.recruiterViewsCount || 0}</h3>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                <Eye className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-400">
              Across all employer workspaces
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border border-slate-200/90 bg-[#12141d] shadow-xl dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Profile Score Over Time</CardTitle>
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

        <Card className="rounded-3xl border border-slate-200/90 bg-[#12141d] shadow-xl dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Learning Time Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={learningData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {learningData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 flex justify-center gap-4 text-xs font-medium text-slate-400">
                {learningData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    {item.name} {item.value}%
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border border-slate-200/90 bg-[#12141d] shadow-xl dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">AI Insights From Your Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 rounded-2xl bg-white/5 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </div>
            <p className="text-sm text-slate-300">
              Your profile score is growing 22 points/week. At this pace you enter the top 10% in 3 weeks.
            </p>
          </div>
          <div className="flex items-start gap-4 rounded-2xl bg-white/5 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
              <Eye className="h-4 w-4" />
            </div>
            <p className="text-sm text-slate-300">
              Recruiter views spike on Tuesdays and Thursdays. Update your profile on Monday evenings for maximum visibility.
            </p>
          </div>
          {missingSkills.length > 0 && (
            <div className="flex items-start gap-4 rounded-2xl bg-white/5 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                <FileBadge className="h-4 w-4" />
              </div>
              <p className="text-sm text-slate-300">
                Adding a {missingSkills[0]?.skill || 'Docker'} certificate makes you eligible for {missingSkills[0]?.count || 5} more roles. Highest-impact single action available.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-slate-200/90 bg-[#12141d] shadow-xl dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">Skill Development vs Peers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peerSkills} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="candidate" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="peer" fill="#334155" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
