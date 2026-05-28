'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { 
  Mail, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  Info,
  Type
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { TemplateEditor } from '../TemplateEditor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type TemplateType = 'SHORTLIST' | 'REJECT' | 'INTERVIEW'

interface Template {
  template_type: TemplateType
  subject: string
  body_html: string
  body_text: string
  is_custom?: boolean
}

const TEMPLATE_VARIABLES = [
  { tag: '{{candidate_name}}', description: "Candidate's full name", example: 'John Doe' },
  { tag: '{{job_title}}', description: 'The title of the job posting', example: 'Senior React Developer' },
  { tag: '{{company_name}}', description: 'Your company name', example: 'OptioHire Corp' },
  { tag: '{{hr_email}}', description: 'Contact email for HR', example: 'hr@optiohire.com' },
  { tag: '{{interview_link}}', description: 'Video meeting or location details', example: 'https://zoom.us/j/123456' },
  { tag: '{{interview_date}}', description: 'Scheduled date of interview', example: 'Monday, June 1st' },
  { tag: '{{interview_time}}', description: 'Scheduled time of interview', example: '2:00 PM' },
]

export function TemplatesSection() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedType, setSelectedType] = useState<TemplateType>('SHORTLIST')
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [currentTemplate, setCurrentTemplate] = useState({
    subject: '',
    body_html: '',
    is_custom: false
  })

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      
      const res = await fetch(`${backendUrl}/api/templates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
        
        // Find template for selected type
        const template = data.find((t: Template) => t.template_type === selectedType)
        if (template) {
          setCurrentTemplate({
            subject: template.subject,
            body_html: template.body_html,
            is_custom: template.is_custom || false
          })
        }
      }
    } catch (err) {
      console.error('Error fetching templates:', err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedType])

  useEffect(() => {
    if (user) {
      fetchTemplates()
    }
  }, [user, fetchTemplates])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)
    
    try {
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      
      const res = await fetch(`${backendUrl}/api/templates`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template_type: selectedType,
          subject: currentTemplate.subject,
          body_html: currentTemplate.body_html
        })
      })
      
      if (res.ok) {
        setSaveMessage({ type: 'success', text: 'Template saved successfully!' })
        setTimeout(() => setSaveMessage(null), 3000)
        fetchTemplates()
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save template')
      }
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message })
    } finally {
      setIsSaving(false)
    }
  }

  const renderPreview = (content: string) => {
    let result = content
    TEMPLATE_VARIABLES.forEach(v => {
      const regex = new RegExp(v.tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      result = result.replace(regex, `<span class="bg-yellow-100 text-yellow-800 px-1 rounded font-medium">${v.example}</span>`)
    })
    return result
  }

  const renderSubjectPreview = (subject: string) => {
    let result = subject
    TEMPLATE_VARIABLES.forEach(v => {
      const regex = new RegExp(v.tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      result = result.replace(regex, v.example)
    })
    return result
  }

  return (
    <div className="min-w-0 space-y-8 px-1 sm:px-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'tween', duration: 0.4, ease: 'easeOut' }}
        className="gpu-accelerated"
      >
        <h1 className="text-2xl md:text-3xl font-figtree font-extralight mb-2 text-[#2D2DDD] dark:text-white">
          Email Templates
        </h1>
        <p className="text-base md:text-lg font-figtree font-light text-gray-600 dark:text-gray-400">
          Customize the messages sent to your applicants
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Editor Area */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 pb-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Template Designer
                    </h2>
                    {currentTemplate.is_custom ? (
                      <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">Custom</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 border-slate-200">System Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure the {selectedType.toLowerCase()} email
                  </p>
                </div>
                <div className="w-full md:w-64">
                  <Select value={selectedType} onValueChange={(val: TemplateType) => setSelectedType(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SHORTLIST">Shortlist Email</SelectItem>
                      <SelectItem value="REJECT">Rejection Email</SelectItem>
                      <SelectItem value="INTERVIEW">Interview Invitation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
                <TabsList className="bg-transparent border-b-0 h-12 w-full justify-start gap-6 px-0">
                  <TabsTrigger 
                    value="edit" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#2D2DDD] data-[state=active]:text-[#2D2DDD] rounded-none h-full bg-transparent shadow-none px-2 font-medium"
                  >
                    Edit Template
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preview" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#2D2DDD] data-[state=active]:text-[#2D2DDD] rounded-none h-full bg-transparent shadow-none px-2 font-medium"
                  >
                    Live Preview
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-[#2D2DDD] mb-4" />
                  <p className="text-slate-500 animate-pulse">Loading template data...</p>
                </div>
              ) : (
                <Tabs value={activeTab} className="w-full">
                  <TabsContent value="edit" className="p-6 space-y-6 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Email Subject
                      </Label>
                      <div className="relative">
                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="subject"
                          value={currentTemplate.subject}
                          onChange={(e) => setCurrentTemplate({ ...currentTemplate, subject: e.target.value })}
                          placeholder="e.g. Good news! You've been shortlisted"
                          className="pl-10 h-11 border-slate-200 focus:ring-[#2D2DDD] focus:border-[#2D2DDD]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Email Body
                        </Label>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-[#2D2DDD] border-[#2D2DDD]/30 bg-[#2D2DDD]/5">
                          HTML Supported
                        </Badge>
                      </div>
                      <TemplateEditor 
                        content={currentTemplate.body_html} 
                        onChange={(html) => setCurrentTemplate({ ...currentTemplate, body_html: html })} 
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="mt-0 bg-slate-50/50 min-h-[500px]">
                    <div className="p-4 md:p-8 max-w-2xl mx-auto">
                      <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                        {/* Browser-like header */}
                        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-4">
                          <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                          </div>
                          <div className="bg-white rounded px-3 py-1 text-[11px] text-slate-400 flex-1 truncate font-mono">
                            Subject: {renderSubjectPreview(currentTemplate.subject || '(No Subject)')}
                          </div>
                        </div>
                        {/* Email body container */}
                        <div className="p-8 md:p-12 min-h-[400px]">
                          <div 
                            className="prose prose-slate max-w-none preview-email-content"
                            dangerouslySetInnerHTML={{ __html: renderPreview(currentTemplate.body_html || '<p class="text-slate-400 italic">No content yet...</p>') }}
                          />
                        </div>
                        {/* Email Footer */}
                        <div className="bg-slate-50 border-t p-6 text-center text-xs text-slate-400 leading-relaxed">
                          <p>Sent via OptioHire Intelligent Recruitment Platform</p>
                          <p className="mt-1">© 2026 OptioHire. All rights reserved.</p>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-[11px] text-blue-600">
                        <Info className="w-4 h-4 shrink-0" />
                        <p>Yellow highlights indicate where dynamic candidate data will be inserted during delivery.</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 pt-4 bg-slate-50/50">
              {saveMessage && (
                <div className={`flex items-center gap-2 mr-auto ${
                  saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {saveMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-xs font-medium">{saveMessage.text}</span>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => fetchTemplates()}
                disabled={isSaving || isLoading}
                className="border-slate-200 hover:bg-white"
              >
                Reset to {currentTemplate.is_custom ? 'Saved' : 'Default'}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isLoading || !currentTemplate.subject || !currentTemplate.body_html}
                className="bg-[#2D2DDD] hover:bg-[#2525c4] text-white px-8 shadow-md shadow-[#2D2DDD]/20 transition-all hover:scale-[1.02]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Template'
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Help Area */}
        <div className="space-y-6">
          <Card className="bg-[#2D2DDD]/5 border-[#2D2DDD]/10 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#2D2DDD]">
                <Info className="w-4 h-4" />
                Dynamic Variables
              </CardTitle>
              <CardDescription className="text-slate-600">
                Insert these placeholders to personalize your emails. They will be replaced with real data when the email is sent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {TEMPLATE_VARIABLES.map((v) => (
                  <div 
                    key={v.tag} 
                    className="group cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(v.tag)
                      // Optional: Toast for copied
                    }}
                  >
                    <code className="text-[13px] font-mono bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[#2D2DDD] group-hover:bg-[#2D2DDD] group-hover:text-white transition-colors">
                      {v.tag}
                    </code>
                    <p className="text-xs text-slate-500 mt-1 pl-1 italic">
                      {v.description}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-3 bg-white rounded-lg border border-[#2D2DDD]/10 text-xs text-slate-500 leading-relaxed">
                <p className="font-semibold text-[#2D2DDD] mb-1">Pro Tip:</p>
                Click a variable above to copy it, then paste it into your editor.
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">
                Default Behavior
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-3">
              <p>
                If you haven't set a custom template for a specific action, OptioHire will automatically use its professional built-in defaults.
              </p>
              <p>
                Custom templates take priority immediately once saved.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
