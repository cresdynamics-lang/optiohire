'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Search, Mail, Users, Send, AlertCircle, GraduationCap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'

interface Talent {
  id: string
  talent_id: string
  job_posting_id: string
  application_id: string
  applied_at: string
  candidate_name: string
  email: string
  skills_summary: string
  reasoning: string
  institution?: string
  studentId?: string
  institutionSource?: boolean
}

// Mock institution-sourced candidates injected directly into the pool
const INSTITUTION_MOCK_CANDIDATES: Talent[] = [
  {
    id: 'inst-1', talent_id: 'inst-1', job_posting_id: '', application_id: '', applied_at: '2026-07-01',
    candidate_name: 'Amina Wafula', email: 'a.wafula@strathmore.edu',
    skills_summary: 'Python, Data Analysis, SQL - B.Sc. Informatics & Business IT',
    reasoning: 'High-match candidate sourced via Strathmore University 2026 cohort.',
    institution: 'Strathmore University', studentId: 'STR/2026/0142', institutionSource: true,
  },
  {
    id: 'inst-2', talent_id: 'inst-2', job_posting_id: '', application_id: '', applied_at: '2026-07-01',
    candidate_name: 'Brian Otieno', email: 'b.otieno@strathmore.edu',
    skills_summary: 'React, Node.js, TypeScript - B.Sc. Business IT',
    reasoning: 'Strong frontend profile from Strathmore 2026 cohort, interviewing at Safaricom.',
    institution: 'Strathmore University', studentId: 'STR/2026/0143', institutionSource: true,
  },
  {
    id: 'inst-3', talent_id: 'inst-3', job_posting_id: '', application_id: '', applied_at: '2026-07-01',
    candidate_name: 'Faith Chebet', email: 'f.chebet@strathmore.edu',
    skills_summary: 'Java, Spring Boot, REST APIs - B.Sc. Informatics',
    reasoning: 'Shortlisted at Equity Bank from Strathmore 2026 cohort.',
    institution: 'Strathmore University', studentId: 'STR/2026/0144', institutionSource: true,
  },
  {
    id: 'inst-4', talent_id: 'inst-4', job_posting_id: '', application_id: '', applied_at: '2026-06-15',
    candidate_name: 'Samuel Karanja', email: 's.karanja@mmu.ac.ke',
    skills_summary: 'Network Engineering, Cisco, Linux - B.Sc. Telecommunications',
    reasoning: 'Sourced via Multimedia University of Kenya 2026 cohort.',
    institution: 'Multimedia University of Kenya', studentId: 'MMU/2026/0088', institutionSource: true,
  },
]

export default function AdminTalentPoolPage() {
  const [talents, setTalents] = useState<Talent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [poolFilter, setPoolFilter] = useState<'all' | 'institution'>('all')

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkLoading, setIsBulkLoading] = useState(false)

  // Single email modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [activeTalent, setActiveTalent] = useState<Talent | null>(null)
  const [emailDraft, setEmailDraft] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Bulk Custom HTML Modal state
  const [htmlModalOpen, setHtmlModalOpen] = useState(false)
  const [htmlContent, setHtmlContent] = useState('')
  const [htmlPrompt, setHtmlPrompt] = useState('A tech startup welcome email for our talent pool')
  const [htmlSubject, setHtmlSubject] = useState('Update from OptioHire')
  const [isGeneratingHtml, setIsGeneratingHtml] = useState(false)
  const [isSendingHtml, setIsSendingHtml] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const fetchPool = async () => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      const res = await fetch(`/api/admin/talent-pool`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to load talent pool')
      const data = await res.json()
      setTalents(data.talentPool)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPool()
  }, [])

  // Merge API pool with institution mock candidates
  const allTalents = [...INSTITUTION_MOCK_CANDIDATES, ...talents]

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredTalents.map(t => t.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id))
    }
  }

  const openEmailModal = async (talent: Talent) => {
    setActiveTalent(talent)
    setEmailModalOpen(true)
    setIsGenerating(true)
    setEmailDraft('Generating personalised email with AI...')

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      const res = await fetch(`/api/admin/talent-pool/generate-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          candidateName: talent.candidate_name,
          email: talent.email,
          skillsSummary: talent.skills_summary,
          reasoning: talent.reasoning
        })
      })

      const data = await res.json()
      if (res.ok) {
        setEmailDraft(data.draft)
      } else {
        setEmailDraft(`Error generating draft: ${data.error}`)
      }
    } catch (e: any) {
      setEmailDraft(`Error connecting to AI: ${e.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const sendSingleEmail = async () => {
    if (!activeTalent || !emailDraft) return
    setIsSending(true)
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      const res = await fetch(`/api/admin/talent-pool/bulk-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          candidates: [{
            candidateName: activeTalent.candidate_name,
            email: activeTalent.email,
            skillsSummary: activeTalent.skills_summary
          }]
        })
      })

      if (!res.ok) throw new Error('Failed to send')
      alert('Email queued successfully!')
      setEmailModalOpen(false)
    } catch (e: any) {
      alert(`Error: ${e.message}`)
    } finally {
      setIsSending(false)
    }
  }

  const handleBulkEmail = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Are you sure you want to let AI generate and send personalised emails to ${selectedIds.length} candidates?`)) return

    setIsBulkLoading(true)
    const selectedTalents = allTalents.filter(t => selectedIds.includes(t.id))

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      const res = await fetch(`/api/admin/talent-pool/bulk-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          candidates: selectedTalents.map(t => ({
            candidateName: t.candidate_name,
            email: t.email,
            skillsSummary: t.skills_summary
          }))
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      alert(`Successfully queued ${data.sentCount} emails!`)
      setSelectedIds([])
    } catch (e: any) {
      alert(`Bulk send error: ${e.message}`)
    } finally {
      setIsBulkLoading(false)
    }
  }

  const generateHtmlWithAI = async () => {
    if (!htmlPrompt) return
    setIsGeneratingHtml(true)
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      const res = await fetch(`/api/admin/talent-pool/generate-html-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: htmlPrompt })
      })
      const data = await res.json()
      if (res.ok) {
        setHtmlContent(data.html)
        setPreviewMode(true)
      } else {
        alert(data.error)
      }
    } catch (e: any) {
      alert(`Error generating HTML: ${e.message}`)
    } finally {
      setIsGeneratingHtml(false)
    }
  }

  const sendBulkCustomHtml = async () => {
    if (selectedIds.length === 0) return
    if (!htmlContent) return
    if (!confirm(`Send this HTML email to ${selectedIds.length} candidates?`)) return

    setIsSendingHtml(true)
    const selectedTalents = allTalents.filter(t => selectedIds.includes(t.id))

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      const res = await fetch(`/api/admin/talent-pool/bulk-custom-html-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          candidates: selectedTalents.map(t => ({
            candidateName: t.candidate_name,
            email: t.email
          })),
          htmlContent,
          subject: htmlSubject
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      alert(`Successfully queued ${data.sentCount} emails!`)
      setHtmlModalOpen(false)
      setSelectedIds([])
    } catch (e: any) {
      alert(`Bulk send error: ${e.message}`)
    } finally {
      setIsSendingHtml(false)
    }
  }

  const poolSource = poolFilter === 'institution'
    ? allTalents.filter(t => t.institutionSource)
    : allTalents

  const filteredTalents = poolSource.filter(t =>
    t.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.skills_summary?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Talent Pool</h1>
          <p className="text-muted-foreground">Engage with past candidates using AI-generated personalised emails.</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setHtmlModalOpen(true)}
            disabled={selectedIds.length === 0}
            variant="outline"
          >
            Custom HTML Email ({selectedIds.length})
          </Button>
          <Button
            onClick={handleBulkEmail}
            disabled={selectedIds.length === 0 || isBulkLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isBulkLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
            Bulk Email Selected ({selectedIds.length})
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          {/* Filter tabs */}
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setPoolFilter('all')}
              style={{
                padding: '7px 16px', borderRadius: 20, border: '1.5px solid',
                borderColor: poolFilter === 'all' ? '#1F4D3D' : '#DCE1D5',
                background: poolFilter === 'all' ? '#1F4D3D' : '#fff',
                color: poolFilter === 'all' ? '#fff' : '#3E5449',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              All candidates ({allTalents.length})
            </button>
            <button
              onClick={() => setPoolFilter('institution')}
              style={{
                padding: '7px 16px', borderRadius: 20, border: '1.5px solid',
                borderColor: poolFilter === 'institution' ? '#B98A2E' : '#DCE1D5',
                background: poolFilter === 'institution' ? '#F5EAD2' : '#fff',
                color: poolFilter === 'institution' ? '#B98A2E' : '#3E5449',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <GraduationCap size={14} />
              Institution Sourced ({allTalents.filter(t => t.institutionSource).length})
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or skills..."
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
                <th className="px-6 py-4 w-12">
                  <Checkbox
                    checked={selectedIds.length === filteredTalents.length && filteredTalents.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Skills Summary</th>
                <th className="px-6 py-4 font-medium">Added On</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTalents.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={selectedIds.includes(t.id)}
                      onCheckedChange={(checked) => handleSelectOne(t.id, checked as boolean)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{t.candidate_name || 'N/A'}</div>
                    <div className="text-muted-foreground">{t.email}</div>
                    {t.institutionSource && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        marginTop: 4, background: '#F5EAD2', color: '#B98A2E',
                        borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600,
                      }}>
                        <GraduationCap size={11} />
                        {t.institution} · {t.studentId}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-muted-foreground max-w-[300px] truncate" title={t.skills_summary}>
                      {t.skills_summary || 'No skills listed'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(t.applied_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEmailModal(t)}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Preview AI Email
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredTalents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No candidates in the talent pool
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Personalised AI Email</DialogTitle>
            <DialogDescription>
              Review the AI-generated follow-up email for {activeTalent?.candidate_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">To:</label>
              <Input disabled value={activeTalent?.email || ''} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Message:</label>
              <Textarea
                className="h-48"
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                disabled={isGenerating || isSending}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEmailModalOpen(false)}>Cancel</Button>
            <Button onClick={sendSingleEmail} disabled={isGenerating || isSending || !emailDraft}>
              {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom HTML Email Modal */}
      <Dialog open={htmlModalOpen} onOpenChange={setHtmlModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Custom Bulk HTML Email</DialogTitle>
            <DialogDescription>
              Write or generate an HTML email template. Use {'{{candidateName}}'} to personalize.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2">
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-medium">AI Generator Prompt</label>
                <Input
                  placeholder="e.g. A welcome email..."
                  value={htmlPrompt}
                  onChange={(e) => setHtmlPrompt(e.target.value)}
                />
              </div>
              <Button onClick={generateHtmlWithAI} disabled={isGeneratingHtml || !htmlPrompt}>
                {isGeneratingHtml ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Generate HTML
              </Button>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Email Subject</label>
              <Input
                value={htmlSubject}
                onChange={(e) => setHtmlSubject(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center mt-2">
              <label className="text-sm font-medium">HTML Content</label>
              <Button variant="ghost" size="sm" onClick={() => setPreviewMode(!previewMode)}>
                {previewMode ? 'Show Code' : 'Show Preview'}
              </Button>
            </div>

            {previewMode ? (
              <div
                className="flex-1 border rounded-md p-4 bg-white text-black overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: htmlContent || '<p class="text-gray-500">No HTML to preview.</p>' }}
              />
            ) : (
              <Textarea
                className="flex-1 font-mono text-xs"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="<html>...</html>"
              />
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setHtmlModalOpen(false)}>Cancel</Button>
            <Button onClick={sendBulkCustomHtml} disabled={isSendingHtml || !htmlContent}>
              {isSendingHtml ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send to {selectedIds.length} Candidates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
