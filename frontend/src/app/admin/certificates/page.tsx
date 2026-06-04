'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, FileText } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PendingCertificate {
  approval_id: string
  skill_id: string
  certificate_url: string
  status: string
  skill_name: string
  user_id: string
  candidate_name: string
  candidate_email: string
  submitted_at: string
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<PendingCertificate[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/admin/certificates/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await res.json()
      if (data.success) {
        setCertificates(data.data)
      } else {
        toast.error('Failed to load certificates')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [])

  const handleReview = async (approvalId: string, status: 'APPROVED' | 'REJECTED') => {
    let rejectionReason = ''
    if (status === 'REJECTED') {
      const reason = window.prompt('Please enter a reason for rejecting this certificate (this will be sent to the candidate):')
      if (reason === null) return // User cancelled
      rejectionReason = reason || 'Did not meet requirements'
    }

    try {
      const res = await fetch('/api/admin/certificates/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ approvalId, status, rejectionReason })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Certificate ${status.toLowerCase()} successfully!`)
        setCertificates(certificates.filter(c => c.approval_id !== approvalId))
      } else {
        toast.error(data.error || 'Failed to review certificate')
      }
    } catch (err) {
      toast.error('Network error')
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Certificate Approvals Queue</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
            <p className="text-lg">You are all caught up! No pending certificates.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {certificates.map(cert => (
            <Card key={cert.approval_id}>
              <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{cert.candidate_name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{cert.candidate_email}</p>
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground">
                    Target Skill: {cert.skill_name}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Submitted: {new Date(cert.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex gap-4 items-center w-full md:w-auto">
                  <a 
                    href={cert.certificate_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Certificate
                  </a>
                  
                  <Button 
                    variant="default" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleReview(cert.approval_id, 'APPROVED')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  
                  <Button 
                    variant="destructive"
                    onClick={() => handleReview(cert.approval_id, 'REJECTED')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
