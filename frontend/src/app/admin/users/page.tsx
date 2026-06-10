'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, Search, Shield, UserX, UserCheck, ArrowLeft, Filter, CheckSquare, Eye, EyeOff } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface User {
  user_id: string
  email: string
  password_hash?: string
  name?: string | null
  username?: string | null
  company_role?: string | null
  role: string
  is_active: boolean | null
  created_at: string
  admin_approval_status?: 'pending' | 'approved' | 'rejected' | null
  admin_permissions?: Record<string, boolean> | null
  company?: {
    company_id: string
    company_name: string
    company_email: string
    hr_email: string
    hiring_manager_email: string
  } | null
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Check for admin session first
    const adminSession = typeof window !== 'undefined' ? localStorage.getItem('admin_session') : null
    if (adminSession) {
      loadUsers()
      return
    }
    // STRICT: Only admin can access
    if (!currentUser) {
      router.push('/admin/login')
      return
    }
    if (currentUser.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    loadUsers()
  }, [page, search, currentUser, router])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/admin/login')
        return
      }

      const data = await response.json()
      setUsers(data.users || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userId: string, updates: { role?: string; is_active?: boolean; admin_approval_status?: string; admin_permissions?: Record<string, boolean> }) => {
    // STRICT: Prevent admin from deactivating themselves
    if (currentUser && currentUser.id === userId && updates.is_active === false) {
      alert('You cannot deactivate your own account')
      return
    }

    // STRICT: Prevent admin from removing their own admin role
    if (currentUser && currentUser.id === userId && updates.role && updates.role !== 'admin') {
      alert('You cannot remove your own admin role')
      return
    }

    try {
      const token = localStorage.getItem('token')

      if (updates.role) {
        const response = await fetch(`/api/admin/users/${userId}/role`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role: updates.role })
        })
        const data = await response.json()
        if (response.ok) {
           alert(data.message || 'Role updated successfully.')
           loadUsers()
           return
        } else {
           alert(data.error || 'Failed to update role')
           return
        }
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (response.ok) {
        if (data.requires_approval) {
          alert('Admin role assigned. User requires approval before they can access admin features.')
        }
        loadUsers()
      } else {
        alert(data.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('An error occurred while updating the user')
    }
  }

  const approveAdmin = async (userId: string) => {
    await updateUser(userId, { admin_approval_status: 'approved' })
  }

  const rejectAdmin = async (userId: string) => {
    await updateUser(userId, { admin_approval_status: 'rejected', role: 'user' })
  }

  const deleteUser = async (userId: string) => {
    // STRICT: Prevent admin from deleting themselves
    if (currentUser && currentUser.id === userId) {
      alert('You cannot delete your own account')
      return
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        loadUsers()
      } else {
        alert(data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('An error occurred while deleting the user')
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manage Users</h1>
            <p className="text-slate-600">View and manage all system users</p>
          </div>
        </div>

        <Card className="mb-6 border-border">
          <CardContent className="p-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 relative min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10 border-border bg-white text-foreground"
                />
              </div>
              <div className="flex bg-slate-100 rounded-md p-1">
                <Button variant={roleFilter === 'all' ? 'default' : 'ghost'} onClick={() => { setRoleFilter('all'); setPage(1); }} size="sm">All</Button>
                <Button variant={roleFilter === 'admin' ? 'default' : 'ghost'} onClick={() => { setRoleFilter('admin'); setPage(1); }} size="sm">Admins</Button>
                <Button variant={roleFilter === 'hr' ? 'default' : 'ghost'} onClick={() => { setRoleFilter('hr'); setPage(1); }} size="sm">HR</Button>
                <Button variant={roleFilter === 'candidate' ? 'default' : 'ghost'} onClick={() => { setRoleFilter('candidate'); setPage(1); }} size="sm">Candidates</Button>
              </div>
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1) }}>
                <SelectTrigger className="w-[150px] border-border bg-white text-foreground">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {selectedUsers.size > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm(`Delete ${selectedUsers.size} selected users?`)) {
                      selectedUsers.forEach(id => deleteUser(id))
                      setSelectedUsers(new Set())
                    }
                  }}
                >
                  Delete Selected ({selectedUsers.size})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Users ({total})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.map((userItem) => {
                    const isCurrentUser = currentUser && currentUser.id === userItem.user_id
                    const isSelected = selectedUsers.has(userItem.user_id)
                    return (
                      <div
                        key={userItem.user_id}
                        className={`flex items-center justify-between rounded-lg border border-border bg-background p-4 hover:bg-accent ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newSelected = new Set(selectedUsers)
                              if (e.target.checked) {
                                newSelected.add(userItem.user_id)
                              } else {
                                newSelected.delete(userItem.user_id)
                              }
                              setSelectedUsers(newSelected)
                            }}
                            disabled={!!isCurrentUser}
                            className="w-4 h-4"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{userItem.email}</span>
                            {isCurrentUser && (
                              <Badge variant="outline" className="border-blue-500 text-blue-500">
                                You
                              </Badge>
                            )}
                            <Badge variant={userItem.role === 'admin' ? 'default' : 'secondary'}>
                              {userItem.role}
                            </Badge>
                            {userItem.role === 'admin' && userItem.admin_approval_status === 'pending' && (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                                Pending Approval
                              </Badge>
                            )}
                            {userItem.role === 'admin' && userItem.admin_approval_status === 'approved' && (
                              <Badge variant="outline" className="border-green-500 text-green-500">
                                Approved
                              </Badge>
                            )}
                            <Badge variant={userItem.is_active ? 'default' : 'destructive'}>
                              {userItem.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Created: {new Date(userItem.created_at).toLocaleDateString()}
                          </p>
                          {userItem.name && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              Name: {userItem.name}
                            </p>
                          )}
                          {userItem.username && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              Username: @{userItem.username}
                            </p>
                          )}
                          {userItem.company_role && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              Company Role: {userItem.company_role === 'hr' ? 'HR Manager' : 'Hiring Manager'}
                            </p>
                          )}
                          {userItem.company && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              Company: {userItem.company.company_name}
                            </p>
                          )}
                          {/* Password Hash Display */}
                          {userItem.password_hash && (
                            <div className="mt-2 rounded bg-slate-200 p-2 text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="flex items-center gap-1 text-slate-600">
                                  <Shield className="w-3 h-3" />
                                  Password Hash (Admin View):
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowPasswords(prev => ({
                                    ...prev,
                                    [userItem.user_id]: !prev[userItem.user_id]
                                  }))}
                                  className="h-5 px-2 text-xs"
                                >
                                  {showPasswords[userItem.user_id] ? (
                                    <EyeOff className="w-3 h-3" />
                                  ) : (
                                    <Eye className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                              <div className="break-all font-mono text-slate-600">
                                {showPasswords[userItem.user_id] ? userItem.password_hash : '••••••••••••••••'}
                              </div>
                            </div>
                          )}
                          {userItem.role === 'admin' && userItem.admin_permissions && Object.keys(userItem.admin_permissions).length > 0 && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Permissions: {Object.entries(userItem.admin_permissions)
                                .filter(([_, enabled]) => enabled)
                                .map(([key, _]) => key.replace('_', ' '))
                                .join(', ') || 'None'}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {/* Role Assignment UI - Only visible to super admins */}
                          {currentUser?.admin_permissions?.super_admin && (
                            <div className="flex items-center gap-2 mr-2 border-r border-border pr-4">
                              <span className="text-xs font-medium text-muted-foreground">Change Role:</span>
                              <Select 
                                value={userItem.role} 
                                onValueChange={(newRole) => {
                                  if (newRole === userItem.role) return;
                                  
                                  const confirmMsg = newRole === 'admin' 
                                    ? 'Promote this user to admin? They will require approval before accessing admin features.'
                                    : `Change this user's role to ${newRole}?`;
                                    
                                  if (confirm(confirmMsg)) {
                                    const updates: any = { role: newRole };
                                    if (newRole === 'admin') {
                                      updates.admin_permissions = {
                                        manage_users: true,
                                        manage_companies: true,
                                        manage_jobs: true,
                                        manage_applications: true,
                                        view_analytics: true
                                      };
                                    }
                                    updateUser(userItem.user_id, updates);
                                  }
                                }}
                                disabled={!!isCurrentUser}
                              >
                                <SelectTrigger className="w-[110px] h-8 text-xs border-border">
                                  <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="hr">HR</SelectItem>
                                  <SelectItem value="candidate">Candidate</SelectItem>
                                  <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {userItem.role === 'admin' && userItem.admin_approval_status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => approveAdmin(userItem.user_id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => rejectAdmin(userItem.user_id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {userItem.role === 'admin' && userItem.admin_approval_status === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const permissions = userItem.admin_permissions || {}
                                const enabledPerms = Object.entries(permissions)
                                  .filter(([_, v]) => v)
                                  .map(([k]) => k)
                                  .join(', ')
                                const newPerms = prompt(
                                  `Edit permissions (comma-separated):\nAvailable: manage_users, manage_companies, manage_jobs, manage_applications, view_analytics\nCurrent: ${enabledPerms || 'None'}\n\nEnter permissions to enable:`,
                                  enabledPerms
                                )
                                if (newPerms !== null) {
                                  const permList = newPerms.split(',').map(p => p.trim()).filter(Boolean)
                                  const allPerms = ['manage_users', 'manage_companies', 'manage_jobs', 'manage_applications', 'view_analytics']
                                  const updatedPerms: Record<string, boolean> = {}
                                  allPerms.forEach(perm => {
                                    updatedPerms[perm] = permList.includes(perm)
                                  })
                                  updateUser(userItem.user_id, { admin_permissions: updatedPerms })
                                }
                              }}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Permissions
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUser(userItem.user_id, { is_active: !userItem.is_active })}
                            disabled={isCurrentUser ? !(userItem.is_active ?? true) : false}
                            title={isCurrentUser && !(userItem.is_active ?? true) ? 'You cannot deactivate your own account' : ''}
                          >
                            {(userItem.is_active ?? true) ? (
                              <>
                                <UserX className="h-4 w-4 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteUser(userItem.user_id)}
                            disabled={isCurrentUser ? true : false}
                            title={isCurrentUser ? 'You cannot delete your own account' : ''}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {users.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    No users found
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
                    <span className="flex items-center px-4 text-muted-foreground">
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

