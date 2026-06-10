'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Book, HelpCircle, MessageSquare, Briefcase, FileText, Settings, Target, Calendar, Mail, BarChart3, Users, Star } from 'lucide-react'
import Link from 'next/link'

export default function HRHelpPage() {
  const router = useRouter()

  const quickLinks = [
    {
      title: 'Job Postings',
      description: 'Create and manage your job listings',
      icon: Briefcase,
      link: '/hr/jobs',
      color: 'text-blue-600 '
    },
    {
      title: 'Analytics',
      description: 'View pipeline insights and performance',
      icon: BarChart3,
      link: '/hr/reports',
      color: 'text-purple-600 '
    },
    {
      title: 'Interviews',
      description: 'Manage and schedule your interviews',
      icon: Calendar,
      link: '/hr/interviews',
      color: 'text-emerald-600 '
    },
    {
      title: 'Email Templates',
      description: 'Customize outreach messages',
      icon: Mail,
      link: '/hr/templates',
      color: 'text-orange-600 '
    }
  ]

  const hrCapabilities = [
    {
      category: 'Job Management',
      items: [
        'Create rich job descriptions with required skills',
        'Edit and update active job listings',
        'Close or archive filled positions',
        'Set custom screening criteria'
      ]
    },
    {
      category: 'Applicant Tracking & AI',
      items: [
        'AI automatically screens incoming applicants',
        'View candidates sorted by AI score and fit',
        'Review detailed AI explanations for match scores',
        'Move candidates between Shortlisted, Flagged, and Rejected states'
      ]
    },
    {
      category: 'Interview Scheduling',
      items: [
        'Schedule interviews directly from the dashboard',
        'Automated Google Meet link generation (when connected)',
        'Send calendar invites and notifications automatically',
        'Reschedule or cancel interviews'
      ]
    },
    {
      category: 'Communication',
      items: [
        'Create custom email templates for different application stages',
        'Automated acceptance and rejection emails',
        'AI HR Assistant can help draft communications'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background  p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/hr')}
            className="text-neutral-500  hover:text-neutral-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground  flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-[#2D2DDD]" />
              Employer Help Center
            </h1>
            <p className="text-neutral-500  mt-1">Guide to your HR capabilities and quick tools</p>
          </div>
        </div>

        {/* Quick Links */}
        <Card className="border-border dark:border-gray-800 ">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground ">
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
                    <Card className="cursor-pointer border border-border dark:border-gray-800 bg-background  transition-all hover:border-primary/40 hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Icon className={`w-6 h-6 ${link.color} flex-shrink-0 mt-1`} />
                          <div>
                            <h3 className="font-semibold text-foreground  mb-1">
                              {link.title}
                            </h3>
                            <p className="text-sm text-neutral-500 ">
                              {link.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Capabilities */}
        <Card className="border-border dark:border-gray-800 ">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground ">
              <Target className="w-5 h-5" />
              HR Capabilities Overview
            </CardTitle>
            <CardDescription>What you can do as an employer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {hrCapabilities.map((category) => (
                <div key={category.category} className="border-l-4 border-[#2D2DDD] pl-4">
                  <h3 className="text-lg font-semibold text-foreground  mb-3">
                    {category.category}
                  </h3>
                  <ul className="space-y-2">
                    {category.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-neutral-600 ">
                        <span className="text-[#2D2DDD] mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQs & Guides */}
        <Card className="border-border dark:border-gray-800 ">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground ">
              <FileText className="w-5 h-5" />
              Frequently Asked Questions & Guides
            </CardTitle>
            <CardDescription>Common queries about how OptioHire works</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-background  rounded-xl border border-slate-100 dark:border-gray-700">
                <h4 className="font-semibold text-foreground  mb-2">How does the AI candidate screening work?</h4>
                <p className="text-sm text-neutral-600 ">
                  When a candidate applies, our AI agent immediately parses their CV and profile data. It cross-references their skills, experience, and education against your Job Description. It assigns a score out of 100. Candidates scoring 80+ are typically <span className="font-medium text-emerald-600">Shortlisted</span>, 50-79 are <span className="font-medium text-yellow-600">Flagged</span> for manual review, and below 50 are <span className="font-medium text-red-600">Rejected</span>.
                </p>
              </div>

              <div className="p-4 bg-background  rounded-xl border border-slate-100 dark:border-gray-700">
                <h4 className="font-semibold text-foreground  mb-2">How do I schedule an interview with a candidate?</h4>
                <p className="text-sm text-neutral-600 ">
                  Navigate to the "Interviews" tab or view a Shortlisted candidate's profile. Click "Schedule Interview," pick a date and time, and confirm. The system will automatically generate a Google Meet link (if your calendar is connected) and instantly dispatch an email invitation to the candidate.
                </p>
              </div>

              <div className="p-4 bg-background  rounded-xl border border-slate-100 dark:border-gray-700">
                <h4 className="font-semibold text-foreground  mb-2">What is the "Automated Screening Digest" email?</h4>
                <p className="text-sm text-neutral-600 ">
                  To keep you updated without spamming your inbox, OptioHire batches new applications. After every 5 candidates are processed for a specific job, the system sends an Automated Screening Digest to the HR email. This digest includes the top recommended lead, AI reasoning, and a pipeline breakdown.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Need Help */}
        <Card className="border-border dark:border-gray-800 ">
          <CardHeader>
            <CardTitle className="text-foreground ">Need More Help?</CardTitle>
            <CardDescription>Reach out to the support team or your AI Agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => document.dispatchEvent(new CustomEvent('open-hr-assistant', { detail: { tab: 'chat' } }))} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                <Star className="w-4 h-4" />
                Ask AI Agent
              </Button>
              <Button variant="outline" onClick={() => document.dispatchEvent(new CustomEvent('open-hr-assistant', { detail: { tab: 'support' } }))} className="flex items-center gap-2 ">
                <MessageSquare className="w-4 h-4" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
