'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { RefreshCw, Database, CheckCircle, XCircle } from 'lucide-react'

export function DatabaseDebugger() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runDebugTest = async () => {
    if (!user) {
      setError('No user found')
      return
    }

    setIsLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      console.log('🔍 Starting database debug test...')
      
      const debugResults: any = {
        user: {
          id: user.id,
          email: user.email
        },
        timestamp: new Date().toISOString()
      }

      // Test 1: Check companies table
      console.log('📊 Testing companies table...')
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
      
      debugResults.companies = {
        data: companies,
        error: companiesError,
        count: companies?.length || 0
      }

      if (companiesError) {
        console.error('❌ Companies error:', companiesError)
      } else {
        console.log('✅ Companies found:', companies?.length || 0)
      }

      // Test 2: Check job_postings table
      if (companies && companies.length > 0) {
        console.log('📋 Testing job_postings table...')
        const { data: jobs, error: jobsError } = await supabase
          .from('job_postings')
          .select('*')
          .eq('company_id', companies[0].id)
          .order('created_at', { ascending: false })
        
        debugResults.job_postings = {
          data: jobs,
          error: jobsError,
          count: jobs?.length || 0
        }

        if (jobsError) {
          console.error('❌ Jobs error:', jobsError)
        } else {
          console.log('✅ Jobs found:', jobs?.length || 0)
        }

        // Test 3: Check applicants table
        if (jobs && jobs.length > 0) {
          console.log('👥 Testing applicants table...')
          const { data: applicants, error: applicantsError } = await supabase
            .from('applicants')
            .select('*')
            .eq('job_posting_id', jobs[0].id)
          
          debugResults.applicants = {
            data: applicants,
            error: applicantsError,
            count: applicants?.length || 0
          }

          if (applicantsError) {
            console.error('❌ Applicants error:', applicantsError)
          } else {
            console.log('✅ Applicants found:', applicants?.length || 0)
          }
        }
      }

      // Test 4: Check recruitment_analytics table
      console.log('📈 Testing recruitment_analytics table...')
      const { data: analytics, error: analyticsError } = await supabase
        .from('recruitment_analytics')
        .select('*')
        .limit(5)
      
      debugResults.recruitment_analytics = {
        data: analytics,
        error: analyticsError,
        count: analytics?.length || 0
      }

      if (analyticsError) {
        console.error('❌ Analytics error:', analyticsError)
      } else {
        console.log('✅ Analytics found:', analytics?.length || 0)
      }

      setDebugInfo(debugResults)
      console.log('🎉 Debug test completed:', debugResults)

    } catch (err) {
      console.error('❌ Debug test failed:', err)
      setError(`Debug test failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Debug Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button 
            onClick={runDebugTest}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin-smooth' : ''}`} />
            Run Debug Test
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {debugInfo && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <strong>Debug Test Completed</strong>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Debug Results:</h4>
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
