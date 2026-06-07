'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Book, HelpCircle, MessageSquare, FileText, Settings, Users, Building2, Briefcase, FileText as FileTextIcon, Mail, BarChart3, LogIn, Shield } from 'lucide-react'
import Link from 'next/link'

export default function AdminHelpPage() {
  const router = useRouter()

  const quickLinks = [
    {
      title: 'Manage Users',
      description: 'View all users, passwords, company info, and activity',
      icon: Users,
      link: '/admin/users',
      color: 'text-blue-600 '
    },
    {
      title: 'Manage Companies',
      description: 'View and manage all registered companies',
      icon: Building2,
      link: '/admin/companies',
      color: 'text-green-600 '
    },
    {
      title: 'Manage Jobs',
      description: 'View and manage all job postings across companies',
      icon: Briefcase,
      link: '/admin/jobs',
      color: 'text-purple-600 '
    },
    {
      title: 'View Applications',
      description: 'View all applications with AI scores and status',
      icon: FileTextIcon,
      link: '/admin/applications',
      color: 'text-orange-600 '
    },
    {
      title: 'Login Activity',
      description: 'Track all user login history and activity logs',
      icon: LogIn,
      link: '/admin/logins',
      color: 'text-indigo-600 '
    },
    {
      title: 'Email Logs',
      description: 'View email sending history and resend failed emails',
      icon: Mail,
      link: '/admin/emails',
      color: 'text-pink-600 '
    },
    {
      title: 'Analytics',
      description: 'View system-wide analytics and statistics',
      icon: BarChart3,
      link: '/admin/analytics',
      color: 'text-cyan-600 '
    },
    {
      title: 'System Settings',
      description: 'Configure system settings and feature flags',
      icon: Settings,
      link: '/admin/settings',
      color: 'text-muted-foreground '
    }
  ]

  const adminCapabilities = [
    {
      category: 'User Management',
      items: [
        'View all users with email, name, username, and password hash',
        'See user company associations and roles',
        'View user activity history and login logs',
        'Activate/deactivate user accounts',
        'Change user roles (including promoting to admin)',
        'Delete users (with safety checks)',
        'View pending signups and approve/reject them'
      ]
    },
    {
      category: 'Company Management',
      items: [
        'View all companies with full details',
        'See company emails (company, HR, hiring manager)',
        'View company domains and settings',
        'Edit company information',
        'Delete companies (cascades to jobs/applications)',
        'View company statistics (jobs, applications)'
      ]
    },
    {
      category: 'Job Management',
      items: [
        'View all job postings across all companies',
        'Filter by company, status, or search terms',
        'See job details, deadlines, and status',
        'Delete job postings',
        'View job analytics and performance'
      ]
    },
    {
      category: 'Application Management',
      items: [
        'View all applications from all companies',
        'See AI scores and status (SHORTLIST, FLAG, REJECT)',
        'Filter by job, company, or AI status',
        'View candidate details and application data',
        'Delete applications'
      ]
    },
    {
      category: 'System Monitoring',
      items: [
        'View all user login/logout activity',
        'Track API calls and response times',
        'Monitor page views and user sessions',
        'View IP addresses and user agents',
        'See system statistics and health',
        'View email logs and delivery status',
        'Access performance metrics'
      ]
    },
    {
      category: 'Admin Actions',
      items: [
        'All admin actions are logged for audit',
        'Cannot delete your own account',
        'Cannot remove your own admin role',
        'Cannot delete the last active admin',
        'Bulk operations for signup approval',
        'System-wide settings management'
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
            onClick={() => router.push('/admin')}
            className="text-slate-600  hover:text-foreground dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground  flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-[#2D2DDD]" />
              Admin Help & Documentation
            </h1>
            <p className="text-muted-foreground  mt-1">Complete guide to admin capabilities and quick access</p>
          </div>
        </div>

        {/* Quick Links */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="w-5 h-5" />
              Quick Access Links
            </CardTitle>
            <CardDescription>Navigate to different admin sections</CardDescription>
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
                            <p className="text-sm text-muted-foreground ">
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

        {/* Admin Capabilities */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin Capabilities Overview
            </CardTitle>
            <CardDescription>What you can do as an administrator</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {adminCapabilities.map((category) => (
                <div key={category.category} className="border-l-4 border-[#2D2DDD] pl-4">
                  <h3 className="text-lg font-semibold text-foreground  mb-3">
                    {category.category}
                  </h3>
                  <ul className="space-y-2">
                    {category.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-600 ">
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

        {/* Important Notes */}
        <Card className="bg-blue-900/20 border-blue-800/40">
          <CardHeader>
            <CardTitle className="text-blue-900  flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-blue-800 ">
            <div className="flex items-start gap-2">
              <span className="font-semibold">Security:</span>
              <span>All admin actions are logged for audit purposes. Be careful when deleting users or companies as these actions cascade to related data.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">Safety Checks:</span>
              <span>You cannot delete your own account, remove your own admin role, or delete the last active admin. These protections prevent accidental lockouts.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">Password Access:</span>
              <span>As an admin, you can view password hashes (not plain text passwords) for all users. This is useful for account recovery and verification.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">Login Tracking:</span>
              <span>All user logins, API calls, and page views are tracked in the time_tracking table. You can view this data in the Login Activity section.</span>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground ">Need More Help?</CardTitle>
            <CardDescription>Contact support or view documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                View Full Documentation
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/support')} className="flex items-center gap-2">
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
