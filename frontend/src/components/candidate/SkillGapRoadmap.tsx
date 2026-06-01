'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Zap, Target, BookOpen, Upload, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface GapAnalysis {
  topMissingSkill: string | null
  insight: string
  allMissingSkills: { skill: string; count: number }[]
}

export function SkillGapRoadmap({ gapAnalysis, profileId }: { gapAnalysis: GapAnalysis, profileId: string }) {
  const [roadmapHtml, setRoadmapHtml] = useState<string | null>(null)
  const [loadingRoadmap, setLoadingRoadmap] = useState(false)
  const [certificateUrl, setCertificateUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  if (!gapAnalysis.topMissingSkill) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <p className="text-lg font-bold">You are a perfect match!</p>
          <p>No missing skills detected based on active job postings.</p>
        </CardContent>
      </Card>
    )
  }

  const generateRoadmap = async () => {
    setLoadingRoadmap(true)
    try {
      const res = await fetch(`/api/candidate/roadmap?skillName=${encodeURIComponent(gapAnalysis.topMissingSkill!)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (data.success) {
        setRoadmapHtml(data.html)
      } else {
        toast.error('Failed to generate roadmap')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setLoadingRoadmap(false)
    }
  }

  const handleUploadCertificate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!certificateUrl) return

    setUploading(true)
    try {
      // We pass a dummy skillId here for the prototype, in real app we'd fetch the skill_id 
      // from candidate_skills table or create it as unverified first.
      const dummySkillId = '00000000-0000-0000-0000-000000000000'
      const res = await fetch('/api/candidate/certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ skillId: dummySkillId, certificateUrl })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Certificate uploaded and sent for Admin review!')
        setCertificateUrl('')
      } else {
        toast.error(data.error || 'Failed to upload certificate')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-indigo-200 shadow-sm overflow-hidden">
        <div className="bg-indigo-50 dark:bg-indigo-950 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Skill Gap: <span className="text-indigo-600 dark:text-indigo-400">{gapAnalysis.topMissingSkill}</span>
            </h3>
          </div>
          <p className="text-slate-700 dark:text-slate-300 italic">
            "{gapAnalysis.insight}"
          </p>
          
          {!roadmapHtml && (
            <Button 
              onClick={generateRoadmap} 
              disabled={loadingRoadmap}
              className="mt-6 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900"
            >
              {loadingRoadmap ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BookOpen className="h-4 w-4 mr-2" />}
              Generate AI Learning Roadmap
            </Button>
          )}
        </div>
      </Card>

      {roadmapHtml && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h4 className="text-xl font-bold mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-indigo-600" /> 
            Your Personalized Path to Mastery
          </h4>
          <div dangerouslySetInnerHTML={{ __html: roadmapHtml }} />
          
          <Card className="mt-8 border-dashed bg-slate-50 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-lg">Already know this? Mastered it?</CardTitle>
              <CardDescription>Upload a link to your certificate to verify this skill and boost your score.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadCertificate} className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="certUrl" className="sr-only">Certificate Link (URL)</Label>
                  <Input 
                    id="certUrl" 
                    placeholder="https://coursera.org/verify/..." 
                    value={certificateUrl}
                    onChange={(e) => setCertificateUrl(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Submit to Admin
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
