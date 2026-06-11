'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Trophy, CheckCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface LeaderboardCandidate {
  user_id: string
  name: string
  email: string
  total_score: number
  profile_id: string
  verified_skills_count: number
}

export default function LeaderboardPage() {
  const [candidates, setCandidates] = useState<LeaderboardCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/hr-candidates/leaderboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const data = await res.json()
        if (data.success) {
          setCandidates(data.data)
        } else {
          toast.error('Failed to load leaderboard')
        }
      } catch (error) {
        toast.error('Network error')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
            <Trophy className="h-8 w-8 mr-3 text-amber-500" />
            Talent Pool Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2">Discover the top-ranked candidates across our platform based on verified skills and assessments.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search candidates..." 
            className="pl-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24" />
            </Card>
          ))}
        </div>
      ) : filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No candidates found matching your search.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-t-xl border border-slate-200 dark:border-slate-800 border-b-0">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-5 md:col-span-4">Candidate</div>
            <div className="col-span-3 hidden md:block text-center">Verified Skills</div>
            <div className="col-span-3 text-right pr-4">Total Score</div>
            <div className="col-span-3 md:col-span-2 text-right">Action</div>
          </div>
          <div className="grid gap-0 border border-slate-200 dark:border-slate-800 rounded-b-xl overflow-hidden shadow-sm">
            {filteredCandidates.map((candidate, idx) => (
              <div 
                key={candidate.user_id} 
                className="grid grid-cols-12 gap-4 items-center px-6 py-4 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="col-span-1 text-center font-bold text-slate-400">
                  {idx === 0 ? <Trophy className="h-5 w-5 mx-auto text-amber-500" /> : 
                   idx === 1 ? <Trophy className="h-5 w-5 mx-auto text-slate-400" /> : 
                   idx === 2 ? <Trophy className="h-5 w-5 mx-auto text-amber-700" /> : 
                   `#${idx + 1}`}
                </div>
                <div className="col-span-5 md:col-span-4 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{candidate.name}</p>
                  <p className="text-xs text-slate-500 truncate">{candidate.email}</p>
                </div>
                <div className="col-span-3 hidden md:flex items-center justify-center">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    {candidate.verified_skills_count}
                  </div>
                </div>
                <div className="col-span-3 text-right pr-4">
                  <span className="inline-flex items-center justify-center font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400">
                    {candidate.total_score}
                  </span>
                </div>
                <div className="col-span-3 md:col-span-2 text-right">
                  <Link href={`/hr/profile/${candidate.profile_id}`} className="text-sm font-medium text-[#2D2DDD] hover:underline">
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
