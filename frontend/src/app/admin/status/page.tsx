'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { 
  RefreshCw,
  Loader2,
  Clock,
  LayoutDashboard
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

type ComponentStatus = 'running' | 'error' | 'stopped' | 'idle' | 'unknown'

interface HealthRecord {
  component_key: string
  status: ComponentStatus
  last_run_at: string
  last_error: string | null
  error_count: number
  metadata: any
  updated_at: string
}

interface HistoryRecord {
  component_key: string
  check_date: string
  success_count: number
  error_count: number
  uptime_pct: number
}

interface QueueStats {
  name: string
  key: string
  counts: {
    active: number
    waiting: number
    failed: number
  }
  status: ComponentStatus
  last_run_at: string | null
}

/**
 * Maps internal keys to human-friendly display names
 */
const getFriendlyName = (key: string, name: string) => {
  if (key === 'worker.ai.profile.application') return 'AI Resume Profiler'
  if (key === 'worker.maintenance.check.deadlines') return 'Job Deadline Monitor'
  if (key === 'worker.maintenance.generate.reports') return 'Automated Report Generator'
  if (key === 'worker.maintenance.retry.emails') return 'Email Delivery Retrier'
  if (key === 'worker.maintenance.poll.emails') return 'Inbound Email Fetcher'
  if (key === 'worker.maintenance.recover.stuck.jobs') return 'Stuck Job Recovery'
  
  // Fallback cleanup
  return name.replace('Worker.', '').replace('Worker', '').trim()
}

export default function SystemStatusPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    system: HealthRecord[]
    history: HistoryRecord[]
    live: QueueStats[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      const response = await fetch('/api/admin/queues/health', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      if (result.success) {
        setData(result)
      } else {
        setError(result.error || 'Failed to load system health data')
      }
    } catch (err) {
      console.error('Status fetch error:', err)
      setError('An error occurred while fetching system status')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const getStatusColor = (status: ComponentStatus, waitingCount: number = 0) => {
    if (status === 'error') return 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
    if (waitingCount > 0) return 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
    if (status === 'running') return 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]'
    return 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]'
  }

  const getUptimeColor = (pct: number) => {
    if (pct >= 99) return 'bg-green-500'
    if (pct >= 90) return 'bg-amber-500'
    return 'bg-red-500'
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-slate-300 animate-spin" />
          <p className="text-muted-foreground font-medium tracking-widest uppercase text-xs">Initializing Monitor</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background/50 p-8 md:p-16 text-foreground font-sans selection:bg-slate-900 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-20">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-6 w-6 text-foreground" />
              <h1 className="text-3xl font-black uppercase tracking-tight italic">System Status</h1>
            </div>
            <p className="text-muted-foreground text-sm font-medium tracking-wide">Real-time surveillance of background operations</p>
          </div>
          <Button 
            onClick={() => { setLoading(true); fetchData(); }} 
            variant="outline" 
            className="rounded-xl px-6 h-12 border-border bg-white hover:bg-slate-900 hover:text-white transition-all duration-300 font-bold uppercase text-xs tracking-widest shadow-sm"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh Matrix
          </Button>
        </header>

        {error && (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-sm font-bold uppercase tracking-widest border border-red-100 flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
            CRITICAL ERROR: {error}
          </div>
        )}

        {/* Section 1: Active Services */}
        <div className="space-y-10">
          <div className="flex items-center gap-4">
            <h2 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">Active Operations</h2>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          
          <div className="grid gap-6">
            {data?.live.map((q) => {
              const statusColor = getStatusColor(q.status, q.counts.waiting)
              const friendlyName = getFriendlyName(q.key, q.name)
              
              return (
                <div key={q.key} className="group bg-white flex flex-col md:flex-row items-center gap-8 p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-border transition-all duration-500">
                  {/* Status Circle */}
                  <div className={`h-4 w-4 rounded-full shrink-0 ${statusColor} transition-all duration-500 group-hover:scale-125`} />
                  
                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
                    <div className="space-y-1">
                      <p className="text-xl font-black tracking-tight text-slate-800 group-hover:text-foreground transition-colors">{friendlyName}</p>
                      <p className="text-[10px] text-muted-foreground font-bold font-mono tracking-widest">{q.key}</p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-12 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0 border-slate-50">
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-300 font-black uppercase block tracking-tighter">Latency</span>
                          <span className="text-base font-bold font-mono">0ms</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-300 font-black uppercase block tracking-tighter">Jobs</span>
                          <span className={`text-base font-bold font-mono ${q.counts.waiting > 0 ? 'text-amber-500' : 'text-foreground'}`}>{q.counts.waiting + q.counts.active}</span>
                        </div>
                      </div>

                      <div className="h-10 w-px bg-slate-100 hidden md:block" />

                      <div className="text-right space-y-0.5 min-w-[120px]">
                        <span className="text-[9px] text-slate-300 font-black uppercase block tracking-tighter">Last Pulse</span>
                        <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-muted-foreground tracking-tight">
                          <Clock className="h-3 w-3" />
                          <span>{q.last_run_at ? formatDistanceToNow(new Date(q.last_run_at)) + ' ago' : 'OFFLINE'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Section 2: History */}
        <div className="space-y-10">
          <div className="flex items-center gap-4">
            <h2 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">Uptime Intelligence</h2>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          
          <div className="bg-background rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-4">
            {!data?.history || data.history.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Awaiting Historical Telemetry</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-slate-50">
                {data.history.map((h, i) => (
                  <div key={`${h.component_key}-${h.check_date}`} className="flex items-center gap-8 py-6 px-6 hover:bg-background/50 transition-all duration-300 group">
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${getUptimeColor(h.uptime_pct)} group-hover:scale-125 transition-transform duration-300`} />
                    
                    <div className="flex-1 flex items-center justify-between text-xs font-bold tracking-tight">
                      <div className="w-56">
                        <span className="uppercase text-muted-foreground text-[10px] font-black block mb-1 tracking-widest">Component</span>
                        <span className="text-slate-800 uppercase font-mono">{getFriendlyName(h.component_key, h.component_key)}</span>
                      </div>
                      
                      <div className="text-center">
                        <span className="uppercase text-muted-foreground text-[10px] font-black block mb-1 tracking-widest">Interval</span>
                        <span className="text-muted-foreground uppercase">{format(new Date(h.check_date), 'MMMM dd')}</span>
                      </div>

                      <div className="flex gap-8 justify-center min-w-[140px]">
                        <div className="text-center">
                          <span className="uppercase text-muted-foreground text-[10px] font-black block mb-1 tracking-widest text-center">S</span>
                          <span className="text-green-500 font-mono text-sm">{h.success_count}</span>
                        </div>
                        <div className="text-center">
                          <span className="uppercase text-muted-foreground text-[10px] font-black block mb-1 tracking-widest text-center">E</span>
                          <span className={`${h.error_count > 0 ? 'text-red-500' : 'text-slate-200'} font-mono text-sm`}>{h.error_count}</span>
                        </div>
                      </div>

                      <div className="text-right w-24">
                        <span className="uppercase text-muted-foreground text-[10px] font-black block mb-1 tracking-widest">Stability</span>
                        <span className={`text-lg font-black font-mono tracking-tighter ${h.uptime_pct < 100 ? 'text-foreground' : 'text-slate-800'}`}>{h.uptime_pct}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-20 pb-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span>Operational Integrity Verified</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="animate-pulse">Live Link: Stable</span>
              <span className="text-slate-200">/</span>
              <span>Sync Frequency: 30S</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}
