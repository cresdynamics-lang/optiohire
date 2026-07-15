'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Book, HelpCircle, Briefcase, Target, Calendar, UserCheck, UploadCloud, MessageSquare, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import OptimizedDashboardLayout from '@/components/dashboard/optimized-dashboard-layout'

function CandidateHelpContent() {
  const router = useRouter()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const quickLinks = [
    {
      title: 'Talent Profile',
      description: 'Update your skills and experience',
      icon: Target,
      link: '/candidate/profile',
      color: 'text-blue-600 '
    },
    {
      title: 'My Applications',
      description: 'Track your job application statuses',
      icon: Briefcase,
      link: '/candidate/jobs',
      color: 'text-purple-600 '
    },
    {
      title: 'My Interviews',
      description: 'View and join scheduled interviews',
      icon: Calendar,
      link: '/candidate/interviews',
      color: 'text-emerald-600 '
    },
    {
      title: 'Account Settings',
      description: 'Manage your profile and security',
      icon: UserCheck,
      link: '/candidate/settings',
      color: 'text-orange-600 '
    }
  ]

  const candidateCapabilities = [
    {
      category: 'Talent Profile',
      items: [
        'Upload and parse your CV to automatically build your profile',
        'Add verified skills, education, and work experience',
        'Upload certifications and portfolio links',
        'View your skill gap analysis for target roles'
      ]
    },
    {
      category: 'Job Applications',
      items: [
        'Browse and apply to new job postings',
        'Track the status of your applications in real-time',
        'Receive automated email updates when your status changes',
        'Withdraw applications if you are no longer interested'
      ]
    },
    {
      category: 'Interview Management',
      items: [
        'Accept or decline interview requests from employers',
        'View upcoming interview schedules and details',
        'Join Google Meet rooms directly from your dashboard',
        'Receive calendar invites for your scheduled interviews'
      ]
    },
    {
      category: 'AI Skill Matching',
      items: [
        'Get AI-powered job recommendations based on your profile',
        'See missing skills that you need to learn for top roles',
        'Improve your profile score by adding requested credentials'
      ]
    }
  ]

  const handleSubmitTicket = async () => {
    if (!message.trim() || status === 'sending') return
    setStatus('sending')
    setError(null)
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      const res = await fetch('/api/candidate/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject: subject.trim() || 'Candidate Support Request',
          message: message.trim(),
          source: 'candidate',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to submit ticket')
      setStatus('success')
      setSubject('')
      setMessage('')
      setTimeout(() => setStatus('idle'), 4000)
    } catch (e: any) {
      setError(e.message || 'Failed to submit')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/candidate')}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-[#2D2DDD]" />
              Job Seeker Help Center
            </h1>
            <p className="text-neutral-500 mt-1">Guide to managing your applications and profile</p>
          </div>
        </div>

        <Card className="border-border dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Book className="w-5 h-5" />
              Quick Access Links
            </CardTitle>
            <CardDescription>Navigate to essential dashboard sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link key={link.title} href={link.link}>
                    <Card className="cursor-pointer border border-border dark:border-gray-800 bg-background transition-all hover:border-primary/40 hover:shadow-md">
                      <CardContent className="p-4">
                        <Icon className={`w-5 h-5 mb-2 ${link.color}`} />
                        <h3 className="font-semibold text-sm text-foreground">{link.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#2D2DDD]/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <MessageSquare className="w-5 h-5 text-[#2D2DDD]" />
              Contact Support
            </CardTitle>
            <CardDescription>
              Submit a ticket to the OptioHire admin team. It appears in Admin → Support Tickets immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Subject (optional)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Textarea
              placeholder="Describe your issue…"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            {status === 'success' && (
              <p className="text-sm text-emerald-700 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" /> Ticket submitted - our team will respond soon.
              </p>
            )}
            <Button
              onClick={() => void handleSubmitTicket()}
              disabled={!message.trim() || status === 'sending'}
              className="bg-[#2D2DDD] hover:bg-[#2525c4] text-white"
            >
              {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit ticket
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidateCapabilities.map((cap) => (
            <Card key={cap.category} className="border-border dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-base">{cap.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
                  {cap.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-foreground">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-background rounded-xl border border-slate-100 dark:border-gray-700">
                <h4 className="font-semibold text-foreground mb-2">How does the AI evaluate my profile?</h4>
                <p className="text-sm text-neutral-600">
                  The AI analyzes your uploaded CV, verified skills, and experience against the requirements of the job you are applying for. It then assigns a Match Score out of 100. A fully completed <strong>Talent Profile</strong> ensures the AI has all the data it needs to recommend you highly to employers!
                </p>
              </div>

              <div className="p-4 bg-background rounded-xl border border-slate-100 dark:border-gray-700">
                <h4 className="font-semibold text-foreground mb-2">How do I join a scheduled interview?</h4>
                <p className="text-sm text-neutral-600">
                  Once an employer schedules an interview with you, you&apos;ll receive an email notification containing the date and time. You can also see this in your <strong>My Interviews</strong> tab. At the scheduled time, simply click the provided Google Meet link to join the interview room.
                </p>
              </div>

              <div className="p-4 bg-background rounded-xl border border-slate-100 dark:border-gray-700">
                <h4 className="font-semibold text-foreground mb-2">What is the Skill Gap Roadmap?</h4>
                <p className="text-sm text-neutral-600">
                  Based on the jobs you apply for, the AI identifies skills you are missing compared to successful candidates. The <strong>Skill Gap Roadmap</strong> is a personalized, AI-generated guide that suggests specific areas, tools, or topics to learn, helping you upskill and land your dream job faster.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-900/10 border-emerald-800/20 dark:border-emerald-800/40">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <UploadCloud className="w-5 h-5" />
              Pro Tip for Candidates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-emerald-800">
            <p>
              To significantly increase your chances of being shortlisted by the AI, ensure your <strong>Talent Profile</strong> is fully complete. The AI evaluates your profile against job requirements, so missing skills or unverified experiences may result in a lower match score. Keep your CV uploaded and certificates up to date!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CandidateHelpPage() {
  return (
    <OptimizedDashboardLayout>
      <CandidateHelpContent />
    </OptimizedDashboardLayout>
  )
}
