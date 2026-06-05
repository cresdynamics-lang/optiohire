'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, AlertTriangle, Users } from 'lucide-react'
import { TopNavigation } from '@/components/dashboard/top-navigation'

interface Decision {
  id: string
  candidate_name: string | null
  email: string
  status: string
  reasoning: string | null
  updated_at: string
  jobTitle: string
  companyName: string
}

export default function CandidateDecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'HIRED' | 'REJECTED'>('ALL')

  useEffect(() => {
    const fetchDecisions = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Not authenticated')

        const res = await fetch('/api/admin/candidate-decisions', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) throw new Error('Failed to fetch decisions')
        
        const data = await res.json()
        setDecisions(data.decisions || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchDecisions()
  }, [])

  const filteredDecisions = decisions.filter(d => filter === 'ALL' || d.status === filter)

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 font-semibold">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background ">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground ">Candidate Decisions</h1>
          <div className="flex bg-background rounded-lg p-1 border shadow-sm">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-[#2D2DDD] text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('HIRED')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'HIRED' ? 'bg-green-600 text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Hired
            </button>
            <button
              onClick={() => setFilter('REJECTED')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'REJECTED' ? 'bg-red-600 text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Rejected
            </button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Decisions Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#2D2DDD]" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Job & Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reasoning / Notes</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDecisions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No decisions found matching the filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDecisions.map(decision => (
                      <TableRow key={decision.id}>
                        <TableCell>
                          <div className="font-medium">{decision.candidate_name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{decision.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{decision.jobTitle}</div>
                          <div className="text-sm text-muted-foreground">{decision.companyName}</div>
                        </TableCell>
                        <TableCell>
                          {decision.status === 'HIRED' ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Hired</Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Rejected</Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm">
                          {decision.reasoning || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(decision.updated_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
