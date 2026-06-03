'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, MessageSquare, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SupportTicket {
  ticket_id: string
  user_email: string
  subject: string
  message: string
  status: string
  priority: string
  context_data: any
  created_at: string
}

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token')
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
        const res = await fetch(`${backendUrl}/api/admin/support-tickets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) {
          throw new Error('Failed to fetch support tickets')
        }
        const data = await res.json()
        setTickets(data.tickets || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Support Tickets</h1>
        <p className="text-slate-500">View messages and issues reported by HR users.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {tickets.length === 0 && !error ? (
        <Card className="bg-slate-50 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center h-48 text-slate-500">
            <MessageSquare className="h-8 w-8 mb-4 text-slate-400" />
            <p>No support tickets found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card key={ticket.ticket_id} className="overflow-hidden">
              <CardHeader className="bg-slate-50/50 pb-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {ticket.subject}
                      <Badge variant={ticket.status === 'open' ? 'destructive' : 'secondary'} className="ml-2 uppercase text-[10px]">
                        {ticket.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1 font-medium text-slate-600">
                      From: {ticket.user_email}
                    </CardDescription>
                  </div>
                  <span className="text-sm text-slate-500">
                    {new Date(ticket.created_at).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="whitespace-pre-wrap text-sm text-slate-700 bg-white border rounded-md p-4">
                  {ticket.message}
                </div>
                
                {ticket.context_data && Object.keys(ticket.context_data).length > 0 && (
                  <div className="bg-slate-100 rounded-md p-3 text-xs overflow-x-auto">
                    <div className="font-semibold text-slate-600 mb-2">Context Data:</div>
                    <pre className="text-slate-600">
                      {JSON.stringify(ticket.context_data, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
