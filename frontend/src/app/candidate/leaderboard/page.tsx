'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Medal, Crown, Loader2, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import Image from 'next/image'

export default function CandidateLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('all_time')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const { user } = useAuth()

  useEffect(() => {
    fetchLeaderboard()
  }, [timeFilter, categoryFilter])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const authHeaders = (): Record<string, string> => {
        const token = localStorage.getItem('auth_token')
        return token ? { Authorization: `Bearer ${token}` } : {}
      }
      
      const res = await fetch(`/api/candidate/leaderboard?time=${timeFilter}&category=${categoryFilter}`, {
        headers: authHeaders(),
      })
      const result = await res.json()
      if (result.success) {
        setLeaderboard(result.leaderboard)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-6 w-6 text-amber-400" />
    if (index === 1) return <Medal className="h-6 w-6 text-slate-300" />
    if (index === 2) return <Medal className="h-6 w-6 text-amber-600" />
    return <span className="text-lg font-bold text-slate-500 w-6 text-center">{index + 1}</span>
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Trophy className="h-8 w-8 text-indigo-600" /> 
            Global Leaderboard
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Compete with candidates globally. Complete missions and skill assessments to rank up.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200 dark:border-gray-800">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time Period</label>
          <div className="flex flex-wrap gap-2">
            {['all_time', 'this_month', 'this_week'].map((time) => (
              <Button
                key={time}
                variant={timeFilter === time ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeFilter(time)}
                className={timeFilter === time ? 'bg-indigo-600 text-white' : ''}
              >
                {time.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
          <div className="flex flex-wrap gap-2">
            {['all', 'tech', 'finance', 'marketing'].map((cat) => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className={categoryFilter === cat ? 'bg-indigo-600 text-white' : ''}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <Card className="rounded-3xl border border-slate-200/90 shadow-xl dark:border-gray-800 bg-white dark:bg-[#12141d]">
        <CardHeader className="border-b border-slate-100 dark:border-gray-800">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-slate-500">
              No data available for these filters.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-gray-800">
              {leaderboard.map((candidate, index) => {
                const isCurrentUser = candidate.candidate_name === user?.name || candidate.candidate_name === user?.email?.split('@')[0]
                
                return (
                  <div 
                    key={candidate.profile_id} 
                    className={`flex items-center justify-between p-4 sm:p-6 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${
                      isCurrentUser ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="flex w-8 justify-center">
                        {getRankIcon(index)}
                      </div>
                      
                      <div className="relative h-12 w-12 shrink-0 rounded-full bg-slate-100 border-2 border-white dark:border-gray-800 shadow-sm overflow-hidden">
                        <img
                          src={candidate.avatar}
                          alt={candidate.candidate_name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {candidate.candidate_name}
                          </h3>
                          {isCurrentUser && (
                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-gray-400 flex items-center gap-1">
                          Score: <span className="font-bold text-indigo-600 dark:text-indigo-400">{candidate.total_score}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
                      <div className="flex flex-col items-end">
                        <span className="text-slate-900 dark:text-white">{candidate.total_score} pts</span>
                        <span className="text-xs text-emerald-600 flex items-center">
                          <ArrowUpRight className="h-3 w-3 mr-0.5" /> top {((index + 1) / Math.max(leaderboard.length, 1) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
