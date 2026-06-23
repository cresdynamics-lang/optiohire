'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Search, RotateCcw, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Candidate {
  id: string
  candidate_name: string
  email: string
  jobTitle: string
  companyName: string
  status: string
  reasoning: string
  hr_rejection_reason: string
  hired_at: string
  rejected_at: string
  created_at: string
  interview_status: string
}

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      const res = await fetch(`/api/admin/candidates`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to load candidates')
      const data = await res.json()
      setCandidates(data.candidates)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  const handleRevert = async (id: string) => {
    if (!confirm('Revert this candidate back to SHORTLIST?')) return
    setActionLoading(id)
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      const res = await fetch(`/api/admin/candidates/${id}/revert`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to revert')
      await fetchCandidates()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRescore = async (id: string) => {
    if (!confirm('Send this candidate back to the AI queue for re-profiling? They will receive new emails once finished.')) return
    setActionLoading(`rescore-${id}`)
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      const res = await fetch(`/api/admin/audit/rescore`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ application_id: id })
      })
      if (!res.ok) throw new Error('Failed to queue re-profiling')
      alert('Candidate successfully sent back for AI Re-Profiling!')
      await fetchCandidates()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredCandidates = candidates.filter(c => 
    c.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HIRED': return <Badge className="bg-green-100 text-green-800 border-green-200">Hired</Badge>
      case 'REJECTED': return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      case 'SHORTLIST': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Shortlisted</Badge>
      case 'FLAG': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Flagged</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates Pipeline</h1>
          <p className="text-muted-foreground">View and manage all candidate decisions across all jobs.</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or company..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="bg-background rounded-lg border shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-background text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Job / Company</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Interview</th>
                <th className="px-6 py-4 font-medium">HR Decision Reason</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCandidates.map((c) => (
                <tr key={c.id} className="hover:bg-background">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{c.candidate_name || 'N/A'}</div>
                    <div className="text-muted-foreground">{c.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{c.jobTitle}</div>
                    <div className="text-muted-foreground">{c.companyName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      {getStatusBadge(c.status)}
                      <div className="text-xs text-muted-foreground max-w-[200px] truncate" title={c.reasoning}>
                        AI: {c.reasoning?.substring(0, 40)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {c.interview_status === 'SCHEDULED' ? (
                      <Badge variant="outline" className="text-blue-600 border-blue-200">Scheduled</Badge>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {c.hr_rejection_reason ? (
                      <span className="text-red-600 text-xs">{c.hr_rejection_reason}</span>
                    ) : c.status === 'HIRED' ? (
                      <span className="text-green-600 text-xs">Hired manually</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">No decision yet</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRescore(c.id)}
                        disabled={actionLoading === `rescore-${c.id}`}
                      >
                        {actionLoading === `rescore-${c.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                        Re-Profile (AI)
                      </Button>
                      {(c.status === 'HIRED' || c.status === 'REJECTED') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRevert(c.id)}
                          disabled={actionLoading === c.id}
                        >
                          {actionLoading === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                          Revert HR
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No candidates found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
