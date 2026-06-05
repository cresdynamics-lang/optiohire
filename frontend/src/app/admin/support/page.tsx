'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, MessageSquare, AlertCircle, Calendar, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface Demo {
  id: string
  hr_email: string
  company_name: string
  demo_time: string
  meeting_link: string
  status: string
  created_at: string
}

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [demos, setDemos] = useState<Demo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      
      const [ticketsRes, demosRes] = await Promise.all([
        fetch(`${backendUrl}/api/admin/support-tickets`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${backendUrl}/api/demos/admin`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (!ticketsRes.ok || !demosRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const ticketsData = await ticketsRes.json()
      const demosData = await demosRes.json()

      setTickets(ticketsData.tickets || [])
      setDemos(demosData.demos || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const markTicketSeen = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const res = await fetch(`${backendUrl}/api/admin/support-tickets/${id}/seen`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to update ticket')
      fetchData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const markDemoSeen = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const res = await fetch(`${backendUrl}/api/demos/admin/${id}/seen`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to update demo')
      fetchData()
    } catch (err: any) {
      setError(err.message)
    }
  }

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
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Support & Demos</h1>
        <p className="text-muted-foreground">View messages, issues, and demo requests from HR users.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="tickets" className="flex gap-2">
            <MessageSquare className="h-4 w-4" /> Support Tickets
          </TabsTrigger>
          <TabsTrigger value="demos" className="flex gap-2">
            <Calendar className="h-4 w-4" /> Scheduled Demos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          {tickets.length === 0 ? (
            <Card className="bg-background border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-4 text-muted-foreground" />
                <p>No support tickets found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tickets.map((ticket) => (
                <Card key={ticket.ticket_id} className="overflow-hidden">
                  <CardHeader className="bg-background/50 pb-4 border-b">
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
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleString()}
                        </span>
                        {ticket.status === 'open' && (
                          <Button size="sm" onClick={() => markTicketSeen(ticket.ticket_id)} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" /> Mark as Seen
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="whitespace-pre-wrap text-sm text-slate-700 bg-background border rounded-md p-4">
                      {ticket.message}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="demos">
          {demos.length === 0 ? (
            <Card className="bg-background border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Calendar className="h-8 w-8 mb-4 text-muted-foreground" />
                <p>No demos scheduled.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {demos.map((demo) => (
                <Card key={demo.id} className="overflow-hidden">
                  <CardHeader className="bg-background/50 pb-4 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          Demo Request
                          <Badge variant={demo.status === 'open' ? 'destructive' : 'secondary'} className="ml-2 uppercase text-[10px]">
                            {demo.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1 font-medium text-slate-600">
                          From: {demo.hr_email} ({demo.company_name || 'N/A'})
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm text-muted-foreground font-semibold text-blue-600">
                          Time: {new Date(demo.demo_time).toLocaleString()}
                        </span>
                        {demo.status === 'open' && (
                          <Button size="sm" onClick={() => markDemoSeen(demo.id)} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" /> Mark as Seen
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {demo.meeting_link && (
                      <div className="whitespace-pre-wrap text-sm text-slate-700 bg-background border rounded-md p-4">
                        Meeting Link: <a href={demo.meeting_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{demo.meeting_link}</a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
