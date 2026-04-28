'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2, Search, ArrowLeft, Trash2, Eye } from 'lucide-react'

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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            className="text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manage Companies</h1>
            <p className="text-slate-600">View and manage all companies</p>
          </div>
        </div>

        <Card className="mb-6 border-slate-200 bg-white">
          <CardContent className="p-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 relative min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search companies by name, domain, or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10 border-slate-300 bg-white text-slate-900"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="bg-red-900/20 border-red-500 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-red-400">{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-300"
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
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle>Companies ({total})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {companies.map((company) => (
                    <div
                      key={company.company_id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="h-5 w-5 text-blue-400" />
                          <span className="font-semibold text-lg">{company.company_name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                          <div>
                            <span className="text-slate-500">Domain:</span> {company.company_domain}
                          </div>
                          <div>
                            <span className="text-slate-500">Email:</span> {company.company_email || 'N/A'}
                          </div>
                          <div>
                            <span className="text-slate-500">HR Email:</span> {company.hr_email}
                          </div>
                          <div>
                            <span className="text-slate-500">Created:</span> {new Date(company.created_at).toLocaleDateString()}
                          </div>
                          {typeof company.jobs_count === 'number' && (
                            <div>
                              <span className="text-slate-500">Jobs:</span> {company.jobs_count}
                            </div>
                          )}
                          {typeof company.applications_count === 'number' && (
                            <div>
                              <span className="text-slate-500">Applications:</span> {company.applications_count}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/companies/${company.company_id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteCompany(company.company_id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {companies.length === 0 && (
                  <div className="py-12 text-center text-slate-500">
                    No companies found
                  </div>
                )}

                {total > 20 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-slate-500">
                      Page {page} of {Math.ceil(total / 20)}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page >= Math.ceil(total / 20)}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

