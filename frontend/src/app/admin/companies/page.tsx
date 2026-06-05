'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2, Search, ArrowLeft, Trash2, Eye, Mail, Globe, Calendar, Briefcase, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
interface Company {
  company_id: string
  company_name: string
  company_email: string
  hr_email: string
  hiring_manager_email: string
  company_domain: string
  created_at: string
  jobs_count?: number
  applications_count?: number
}

export default function AdminCompaniesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for admin session first (from admin login)
    const adminSession = typeof window !== 'undefined' ? localStorage.getItem('admin_session') : null
    if (adminSession) {
      // Admin session exists, allow access
      loadCompanies()
      return
    }
    // STRICT: Only admin can access
    if (user && user.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    if (!user) {
      router.push('/admin/login')
      return
    }
    loadCompanies()
  }, [page, search, user, router])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search })
      })

      const response = await fetch(`/api/admin/companies?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/admin/login')
        return
      }

      const data = await response.json()
      setCompanies(data.companies || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteCompany = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company? This will delete all associated jobs and applications.')) return

    try {
      setError(null)
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) {
        setError('Not authenticated. Please log in again.')
        router.push('/admin/login')
        return
      }

      console.log('Deleting company with ID:', companyId)

      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const responseData = await response.json().catch(() => ({}))

      if (!response.ok) {
        const errorMessage = responseData?.error || `Failed to delete company (${response.status})`
        console.error('Delete failed:', response.status, errorMessage, responseData)
        
        if (response.status === 401 || response.status === 403) {
          setError('Admin access required. Please log in again.')
          router.push('/admin/login')
          return
        }
        
        // If company not found, still remove from UI (might have been deleted already)
        if (response.status === 404) {
          console.log('Company not found, removing from UI anyway')
          setCompanies(prev => prev.filter(company => company.company_id !== companyId))
          setTotal(prev => Math.max(0, prev - 1))
          setError(null) // Don't show error if it's just not found
          return
        }
        
        setError(errorMessage)
        return
      }

      // Success - remove from UI immediately
      console.log('Delete successful, removing from UI')
      setCompanies(prev => prev.filter(company => company.company_id !== companyId))
      setTotal(prev => Math.max(0, prev - 1))
      
      // Reload to ensure consistency (use setTimeout to ensure state update happens first)
      setTimeout(() => {
        loadCompanies()
      }, 100)
    } catch (error) {
      console.error('Error deleting company:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete company. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-transparent p-6 text-slate-900 dark:text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            className="text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manage Companies</h1>
            <p className="text-slate-600 dark:text-gray-400">View and manage all companies</p>
          </div>
        </div>

        <Card className="mb-6 border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <CardContent className="p-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 relative min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500" />
                <Input
                  placeholder="Search companies by name, domain, or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10 border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-red-800 dark:text-red-300">{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Companies ({total})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {companies.map((company) => (
                <Dialog key={company.company_id}>
                  <Card className="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer group flex flex-col h-full relative">
                    <DialogTrigger asChild>
                      <div className="p-5 flex flex-col h-full w-full text-left outline-none">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-slate-100 dark:bg-gray-800 p-1.5 rounded-full text-slate-500 dark:text-gray-400">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-center justify-center shrink-0">
                            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate" title={company.company_name}>
                              {company.company_name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-gray-400 truncate" title={company.company_domain}>
                              {company.company_domain}
                            </p>
                          </div>
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-2 text-xs">
                          {typeof company.jobs_count === 'number' && (
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-gray-400 border border-slate-100 dark:border-gray-800 rounded-md p-2 bg-slate-50 dark:bg-gray-800/50">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                              <span className="font-medium">{company.jobs_count}</span> Jobs
                            </div>
                          )}
                          {typeof company.applications_count === 'number' && (
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-gray-400 border border-slate-100 dark:border-gray-800 rounded-md p-2 bg-slate-50 dark:bg-gray-800/50">
                              <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                              <span className="font-medium">{company.applications_count}</span> Apps
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogTrigger>

                    {/* Expandable Details Modal */}
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Company Details</DialogTitle>
                        <DialogDescription>Full company information and administrative actions</DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6 pt-4">
                        <div className="flex items-start gap-4 pb-4 border-b border-slate-100 dark:border-gray-800">
                          <div className="w-14 h-14 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-center justify-center shrink-0">
                            <Building2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                              {company.company_name}
                            </h3>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-sm">
                              <Globe className="w-4 h-4" />
                              <span>{company.company_domain}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-start gap-3 text-slate-600 dark:text-gray-400">
                            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                              <Mail className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="truncate">
                              <p className="text-[10px] uppercase font-semibold text-slate-400">Primary Email</p>
                              <p className="text-slate-900 dark:text-white font-medium truncate">{company.company_email || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 text-slate-600 dark:text-gray-400">
                            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                              <Mail className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="truncate">
                              <p className="text-[10px] uppercase font-semibold text-slate-400">HR Email</p>
                              <p className="text-slate-900 dark:text-white font-medium truncate">{company.hr_email}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 text-slate-600 dark:text-gray-400">
                            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                              <Mail className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="truncate">
                              <p className="text-[10px] uppercase font-semibold text-slate-400">Hiring Manager Email</p>
                              <p className="text-slate-900 dark:text-white font-medium truncate">{company.hiring_manager_email || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 text-slate-600 dark:text-gray-400">
                            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                              <Calendar className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-semibold text-slate-400">Registered</p>
                              <p className="text-slate-900 dark:text-white font-medium">{new Date(company.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {typeof company.jobs_count === 'number' && (
                            <div className="rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/50 p-4 text-center">
                              <Briefcase className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                              <p className="text-2xl font-bold text-slate-900 dark:text-white">{company.jobs_count}</p>
                              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Jobs Posted</p>
                            </div>
                          )}
                          {typeof company.applications_count === 'number' && (
                            <div className="rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/50 p-4 text-center">
                              <FileText className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                              <p className="text-2xl font-bold text-slate-900 dark:text-white">{company.applications_count}</p>
                              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Applications</p>
                            </div>
                          )}
                        </div>

                        {/* Actions Row */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100 dark:border-gray-800">
                          <Button
                            onClick={() => router.push(`/admin/companies/${company.company_id}`)}
                            className="bg-primary hover:bg-blue-700"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Dashboard
                          </Button>
                          <Button
                            variant="destructive"
                            className="ml-auto"
                            onClick={() => deleteCompany(company.company_id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Company
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Card>
                </Dialog>
              ))}
            </div>

            {companies.length === 0 && (
              <div className="py-12 text-center">
                <Building2 className="w-16 h-16 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-gray-400">No companies found</p>
              </div>
            )}

            {total > 20 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-slate-500 dark:text-gray-400 font-medium">
                  Page {page} of {Math.ceil(total / 20)}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= Math.ceil(total / 20)}
                  onClick={() => setPage(p => p + 1)}
                  className="border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

