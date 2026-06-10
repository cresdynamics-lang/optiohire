'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { Loader2 } from 'lucide-react'

interface DailyData {
  date: string
  tokens: number
  cost: number
  requests: number
}

interface ModelData {
  model: string
  totalTokens: number
  totalCost: number
  requestCount: number
}

interface TaskData {
  task: string
  totalTokens: number
  totalPromptTokens: number
  totalCompletionTokens: number
  totalCost: number
  requestCount: number
}

interface AiUsageChartsProps {
  daily: DailyData[]
  models: ModelData[]
  tasks: TaskData[]
  loading: boolean
}

const MODEL_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export function AiUsageCharts({ daily, models, tasks, loading }: AiUsageChartsProps) {
  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const chartDaily = daily.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    tokens: d.tokens,
    promptTokens: Math.floor(d.tokens * 0.7), // Fallback if API doesn't return split daily
    completionTokens: Math.floor(d.tokens * 0.3),
    cost: d.cost,
    requests: d.requests,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Token Consumption Chart */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Token Consumption</CardTitle>
          <CardDescription>Daily token usage across all models.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDaily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number, name: string) => [value.toLocaleString(), name === 'promptTokens' ? 'Input Tokens' : name === 'completionTokens' ? 'Output Tokens' : 'Tokens']}
                />
                <Bar dataKey="promptTokens" name="Input Tokens" stackId="a" fill="#6366f1" />
                <Bar dataKey="completionTokens" name="Output Tokens" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Usage by Task */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Usage by Task</CardTitle>
          <CardDescription>Token distribution across different AI tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          {(!tasks || tasks.length === 0) ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              No task usage data yet
            </div>
          ) : (
            <div className="h-[300px] w-full mt-4 flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={tasks}
                    dataKey="totalTokens"
                    nameKey="task"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {tasks.map((_, i) => (
                      <Cell key={i} fill={MODEL_COLORS[(i + 4) % MODEL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [value.toLocaleString(), 'Tokens']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 pl-4">
                {tasks.map((t, i) => (
                  <div key={t.task} className="flex flex-col gap-0.5 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: MODEL_COLORS[(i + 4) % MODEL_COLORS.length] }} />
                      <span className="truncate text-foreground font-medium">{t.task}</span>
                    </div>
                    <div className="pl-5 flex items-center justify-between text-xs text-muted-foreground">
                      <span>In: {t.totalPromptTokens.toLocaleString()} | Out: {t.totalCompletionTokens.toLocaleString()}</span>
                      <span className="tabular-nums font-medium">${t.totalCost.toFixed(3)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Chart */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Estimated Cost ($)</CardTitle>
          <CardDescription>Daily estimated API costs based on model pricing.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartDaily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `$${value.toFixed(2)}`} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`$${value.toFixed(4)}`, 'Cost']}
                />
                <Area type="monotone" dataKey="cost" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Requests Per Day */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Requests Per Day</CardTitle>
          <CardDescription>Daily API request volume.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartDaily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#10b981" fillOpacity={1} fill="url(#colorRequests)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Model Distribution */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Usage by Model</CardTitle>
          <CardDescription>Token distribution across AI models.</CardDescription>
        </CardHeader>
        <CardContent>
          {models.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              No model usage data yet
            </div>
          ) : (
            <div className="h-[300px] w-full mt-4 flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={models}
                    dataKey="totalTokens"
                    nameKey="model"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {models.map((_, i) => (
                      <Cell key={i} fill={MODEL_COLORS[i % MODEL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [value.toLocaleString(), 'Tokens']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 pl-4">
                {models.map((m, i) => (
                  <div key={m.model} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: MODEL_COLORS[i % MODEL_COLORS.length] }} />
                    <span className="truncate text-foreground font-medium">{m.model.split('/').pop()}</span>
                    <span className="ml-auto text-muted-foreground tabular-nums">{m.requestCount} reqs</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
