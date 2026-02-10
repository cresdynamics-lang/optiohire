'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  ToggleLeft, 
  ToggleRight,
  Save,
  Loader2, 
  RefreshCw,
  Flag,
  Workflow,
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface SystemSetting {
  setting_id: string
  setting_key: string
  setting_value: any
  setting_type: 'string' | 'number' | 'boolean' | 'json' | 'array'
  category: string
  description?: string
  is_public: boolean
}

interface Workflow {
  workflow_id: string
  workflow_name: string
  workflow_type: string
  is_active: boolean
  config: any
  description?: string
}

export default function SystemSettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'settings' | 'features' | 'workflows'>('settings')

  useEffect(() => {
    // Check for admin session first
    const adminSession = localStorage.getItem('admin_session')
    if (adminSession) {
      return // Admin session exists, allow access
    }
    
    // Fallback to regular auth check
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/admin/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadSettings()
      loadWorkflows()
    }
  }, [user])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to load settings')

      const data = await response.json()
      setSettings(data.settings || [])
    } catch (err: any) {
      console.error('Error loading settings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadWorkflows = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/admin/workflows`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) return

      const data = await response.json()
      setWorkflows(data.workflows || [])
    } catch (err) {
      console.error('Error loading workflows:', err)
    }
  }

  const updateSetting = async (settingKey: string, value: any) => {
    try {
      setSaving(settingKey)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/admin/settings/${settingKey}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settingValue: value })
      })

      if (!response.ok) throw new Error('Failed to update setting')

      await loadSettings()
    } catch (err: any) {
      alert(err.message || 'Failed to update setting')
    } finally {
      setSaving(null)
    }
  }

  const updateFeatureFlag = async (flagKey: string, value: boolean) => {
    try {
      setSaving(flagKey)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/admin/settings/feature-flags/${flagKey}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value })
      })

      if (!response.ok) throw new Error('Failed to update feature flag')

      await loadSettings()
    } catch (err: any) {
      alert(err.message || 'Failed to update feature flag')
    } finally {
      setSaving(null)
    }
  }

  const updateWorkflow = async (workflowId: string, updates: Partial<Workflow>) => {
    try {
      setSaving(workflowId)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/admin/workflows/${workflowId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) throw new Error('Failed to update workflow')

      await loadWorkflows()
    } catch (err: any) {
      alert(err.message || 'Failed to update workflow')
    } finally {
      setSaving(null)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D2DDD]" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  const featureFlags = settings.filter(s => s.category === 'features')
  const generalSettings = settings.filter(s => s.category !== 'features')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              System Settings & Flow Control
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure system settings, feature flags, and workflows
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Button variant="outline" onClick={() => { loadSettings(); loadWorkflows() }} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === 'settings' ? 'default' : 'outline'}
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant={activeTab === 'features' ? 'default' : 'outline'}
                onClick={() => setActiveTab('features')}
              >
                <Flag className="w-4 h-4 mr-2" />
                Feature Flags
              </Button>
              <Button
                variant={activeTab === 'workflows' ? 'default' : 'outline'}
                onClick={() => setActiveTab('workflows')}
              >
                <Workflow className="w-4 h-4 mr-2" />
                Workflows
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {generalSettings.map((setting) => (
              <Card key={setting.setting_id}>
                <CardHeader>
                  <CardTitle className="text-lg">{setting.setting_key}</CardTitle>
                  {setting.description && (
                    <CardDescription>{setting.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {setting.setting_type === 'boolean' ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant={setting.setting_value ? 'default' : 'outline'}
                          onClick={() => updateSetting(setting.setting_key, !setting.setting_value)}
                          disabled={saving === setting.setting_key}
                        >
                          {setting.setting_value ? (
                            <>
                              <ToggleRight className="w-4 h-4 mr-2" />
                              Enabled
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 mr-2" />
                              Disabled
                            </>
                          )}
                        </Button>
                      </div>
                    ) : setting.setting_type === 'number' ? (
                      <Input
                        type="number"
                        value={setting.setting_value}
                        onChange={(e) => {
                          const newSettings = settings.map(s =>
                            s.setting_id === setting.setting_id
                              ? { ...s, setting_value: Number(e.target.value) }
                              : s
                          )
                          setSettings(newSettings)
                        }}
                        onBlur={() => updateSetting(setting.setting_key, setting.setting_value)}
                        className="max-w-xs"
                      />
                    ) : (
                      <Input
                        value={setting.setting_value}
                        onChange={(e) => {
                          const newSettings = settings.map(s =>
                            s.setting_id === setting.setting_id
                              ? { ...s, setting_value: e.target.value }
                              : s
                          )
                          setSettings(newSettings)
                        }}
                        onBlur={() => updateSetting(setting.setting_key, setting.setting_value)}
                        className="max-w-xs"
                      />
                    )}
                    {saving === setting.setting_key && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    <Badge variant="outline">{setting.category}</Badge>
                    {setting.is_public && (
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        Public
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Feature Flags Tab */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            {featureFlags.map((flag) => (
              <Card key={flag.setting_id}>
                <CardHeader>
                  <CardTitle className="text-lg">{flag.setting_key}</CardTitle>
                  {flag.description && (
                    <CardDescription>{flag.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {flag.setting_value ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-medium">
                        {flag.setting_value ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <Button
                      variant={flag.setting_value ? 'default' : 'outline'}
                      onClick={() => updateFeatureFlag(flag.setting_key, !flag.setting_value)}
                      disabled={saving === flag.setting_key}
                    >
                      {saving === flag.setting_key ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : flag.setting_value ? (
                        <>
                          <ToggleRight className="w-4 h-4 mr-2" />
                          Disable
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 mr-2" />
                          Enable
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <Card key={workflow.workflow_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{workflow.workflow_name}</CardTitle>
                      {workflow.description && (
                        <CardDescription>{workflow.description}</CardDescription>
                      )}
                    </div>
                    <Badge
                      variant={workflow.is_active ? 'default' : 'outline'}
                      className={workflow.is_active ? 'bg-green-500' : ''}
                    >
                      {workflow.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Type:</span>
                      <Badge variant="outline">{workflow.workflow_type}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={workflow.is_active ? 'outline' : 'default'}
                        onClick={() => updateWorkflow(workflow.workflow_id, { is_active: !workflow.is_active })}
                        disabled={saving === workflow.workflow_id}
                      >
                        {saving === workflow.workflow_id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : workflow.is_active ? (
                          'Deactivate'
                        ) : (
                          'Activate'
                        )}
                      </Button>
                    </div>
                    {workflow.config && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono">
                        {JSON.stringify(workflow.config, null, 2)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

