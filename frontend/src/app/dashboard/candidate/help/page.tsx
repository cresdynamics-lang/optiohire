'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Book, HelpCircle, Briefcase, FileText, Target, Calendar, UserCheck, UploadCloud, GraduationCap } from 'lucide-react'
import Link from 'next/link'

export default function CandidateHelpPage() {
  const router = useRouter()

  const quickLinks = [
    {
      title: 'Talent Profile',
      description: 'Update your skills and experience',
      icon: Target,
      link: '/dashboard/candidate',
      color: 'text-blue-600 '
    },
    {
      title: 'My Applications',
      description: 'Track your job application statuses',
      icon: Briefcase,
      link: '/dashboard/jobs',
      color: 'text-purple-600 '
    },
    {
      title: 'My Interviews',
      description: 'View and join scheduled interviews',
      icon: Calendar,
      link: '/dashboard/interviews',
      color: 'text-emerald-600 '
    },
    {
      title: 'Account Settings',
      description: 'Manage your profile and security',
      icon: UserCheck,
      link: '/dashboard/profile',
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

  return (
    <div className="min-h-screen bg-background  p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="text-neutral-500  hover:text-neutral-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground  flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-[#2D2DDD]" />
              Job Seeker Help Center
            </h1>
            <p className="text-neutral-500  mt-1">Guide to managing your applications and profile</p>
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
              <GraduationCap className="w-5 h-5" />
              Platform Features
            </CardTitle>
            <CardDescription>What you can do as a candidate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {candidateCapabilities.map((category) => (
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
            <CardDescription>Common queries about how OptioHire works for candidates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-background  rounded-xl border border-slate-100 dark:border-gray-700">
                <h4 className="font-semibold text-foreground  mb-2">How does the AI evaluate my profile?</h4>
                <p className="text-sm text-neutral-600 ">
                  The AI analyzes your uploaded CV, verified skills, and experience against the requirements of the job you are applying for. It then assigns a Match Score out of 100. A fully completed <strong>Talent Profile</strong> ensures the AI has all the data it needs to recommend you highly to employers!
                </p>
              </div>

              <div className="p-4 bg-background  rounded-xl border border-slate-100 dark:border-gray-700">
                <h4 className="font-semibold text-foreground  mb-2">How do I join a scheduled interview?</h4>
                <p className="text-sm text-neutral-600 ">
                  Once an employer schedules an interview with you, you'll receive an email notification containing the date and time. You can also see this in your <strong>My Interviews</strong> tab. At the scheduled time, simply click the provided Google Meet link to join the interview room.
                </p>
              </div>

              <div className="p-4 bg-background  rounded-xl border border-slate-100 dark:border-gray-700">
                <h4 className="font-semibold text-foreground  mb-2">What is the Skill Gap Roadmap?</h4>
                <p className="text-sm text-neutral-600 ">
                  Based on the jobs you apply for, the AI identifies skills you are missing compared to successful candidates. The <strong>Skill Gap Roadmap</strong> is a personalized, AI-generated guide that suggests specific areas, tools, or topics to learn, helping you upskill and land your dream job faster.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Info */}
        <Card className="bg-emerald-900/10 border-emerald-800/20 /20 dark:border-emerald-800/40">
          <CardHeader>
            <CardTitle className="text-emerald-900  flex items-center gap-2">
              <UploadCloud className="w-5 h-5" />
              Pro Tip for Candidates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-emerald-800 ">
            <p>
              To significantly increase your chances of being shortlisted by the AI, ensure your <strong>Talent Profile</strong> is fully complete. The AI evaluates your profile against job requirements, so missing skills or unverified experiences may result in a lower match score. Keep your CV uploaded and certificates up to date!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
