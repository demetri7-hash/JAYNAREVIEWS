'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Users, 
  Plus, 
  Search, 
  Shield, 
  UserCheck, 
  UserX,
  Archive,
  RotateCcw,
  Link,
  CheckCircle,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'

// Types combining both systems
interface UnifiedUser {
  id: string
  name: string
  email: string
  role: 'staff' | 'manager' | 'admin'
  department?: string
  employee_status: 'active' | 'inactive' | 'pending' | 'archived'
  toast_employee_id?: string
  created_at: string
  last_login?: string
  archived_at?: string
  employee_links?: Array<{
    toast_employee_id: string
    employee_name: string
    employee_email: string
    linked_at: string
    is_active: boolean
  }>
}

interface ToastEmployee {
  id: string
  name: string
  email: string
  jobTitle: string
  phoneNumber: string
  externalId: string
  isActive: boolean
}

interface PermissionOverride {
  id: string
  user_id: string
  department: string
  access_granted: boolean
  granted_at: string
  user: { name: string; email: string }
  granted_by_user: { name: string }
}

export default function UnifiedUserManagement() {
  const { data: session } = useSession()
  
  // State management
  const [users, setUsers] = useState<UnifiedUser[]>([])
  const [toastEmployees, setToastEmployees] = useState<ToastEmployee[]>([])
  const [permissionOverrides, setPermissionOverrides] = useState<PermissionOverride[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [showArchived, setShowArchived] = useState(false)
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<UnifiedUser | null>(null)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [selectedPermissionDepartment, setSelectedPermissionDepartment] = useState('')
  const [permissionAccess, setPermissionAccess] = useState<boolean | null>(null)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false)
  
  // Add new user form
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'staff' as 'staff' | 'manager' | 'admin',
    department: '',
    send_invitation: true
  })

  const departments = ['FOH', 'BOH', 'CLEANING', 'ADMIN', 'MANAGEMENT', 'KITCHEN']
  const roles = ['staff', 'manager', 'admin']

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch users and permissions from employee management API
      const response = await fetch('/api/employee-management')
      if (!response.ok) throw new Error('Failed to fetch user data')
      
      const data = await response.json()
      setUsers(data.users || [])
      setPermissionOverrides(data.overrides || [])
      
      // Fetch TOAST employees
      try {
        const toastResponse = await fetch('/api/toast-employees')
        const toastData = await toastResponse.json()
        if (toastData.success) {
          setToastEmployees(toastData.employees || [])
        }
      } catch (toastError) {
        console.warn('TOAST employees could not be loaded:', toastError)
      }
      
    } catch (err) {
      setError('Failed to load user data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  // API action handler
  const performAction = async (action: string, userId: string, data: Record<string, unknown> = {}) => {
    try {
      setActionLoading(`${action}-${userId}`)
      setError(null)
      
      const response = await fetch('/api/employee-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userId,
          data: {
            ...data,
            performedBy: session?.user?.id
          }
        })
      })

      if (response.ok) {
        await fetchAllData()
        setShowLinkModal(false)
        setShowPermissionModal(false)
        setSelectedUser(null)
        setSuccessMessage(`Action ${action} completed successfully`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Action failed')
      }
    } catch (error) {
      console.error('Action error:', error)
      setError('Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  // User management functions
  const updateUserRole = async (userId: string, newRole: string) => {
    await performAction('update_role', userId, { role: newRole })
  }

  const updateUserStatus = async (userId: string, newStatus: string) => {
    await performAction('update_status', userId, { status: newStatus })
  }

  const handleArchiveUser = async (userId: string) => {
    if (confirm('Are you sure you want to archive this user?')) {
      await performAction('archive_user', userId)
    }
  }

  const handleRestoreUser = async (userId: string) => {
    await performAction('restore_user', userId)
  }

  const handleLinkEmployee = async () => {
    if (!selectedUser || !selectedEmployee) return
    await performAction('link_employee', selectedUser.id, { 
      toast_employee_id: selectedEmployee 
    })
  }

  const handlePermissionChange = async () => {
    if (!selectedUser || !selectedPermissionDepartment) return
    await performAction('update_permissions', selectedUser.id, {
      department: selectedPermissionDepartment,
      accessGranted: permissionAccess
    })
  }

  const handleAddUser = async () => {
    try {
      setActionLoading('add_user')
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })

      if (response.ok) {
        await fetchAllData()
        setShowAddUserModal(false)
        setNewUser({
          name: '',
          email: '',
          role: 'staff',
          department: '',
          send_invitation: true
        })
        setSuccessMessage('User added successfully')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to add user')
      }
    } catch (_error) {
      setError('Failed to add user')
    } finally {
      setActionLoading(null)
    }
  }

  // Helper functions
  const getLinkedEmployee = (user: UnifiedUser) => {
    return user.employee_links?.find(link => link.is_active)
  }

  const getUserPermissions = (userId: string) => {
    return permissionOverrides.filter(override => override.user_id === userId)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />
      case 'manager':
        return <UserCheck className="h-4 w-4 text-blue-500" />
      default:
        return <UserX className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Filter logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.employee_status === selectedStatus
    const matchesDepartment = selectedDepartment === 'all' || user.department === selectedDepartment
    const matchesArchived = showArchived || user.employee_status !== 'archived'
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment && matchesArchived
  })

  // Stats calculations
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.employee_status === 'active').length
  const linkedUsers = users.filter(u => u.toast_employee_id).length
  const archivedUsers = users.filter(u => u.employee_status === 'archived').length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            User Management
          </h2>
          <p className="text-slate-600 mt-1">
            Manage user accounts, roles, permissions, and TOAST integration
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showArchived 
                ? 'bg-slate-100 text-slate-700 border-slate-300' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {showArchived ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-sm mt-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{successMessage}</p>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="text-green-600 hover:text-green-800 text-sm mt-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Link className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Linked to TOAST</p>
              <p className="text-2xl font-bold text-gray-900">{linkedUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Archive className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Archived</p>
              <p className="text-2xl font-bold text-gray-900">{archivedUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              {showArchived && <option value="archived">Archived</option>}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedRole('all')
                setSelectedStatus('all')
                setSelectedDepartment('all')
              }}
              className="w-full px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Users ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  TOAST Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user) => {
                const linkedEmployee = getLinkedEmployee(user)
                const userPermissions = getUserPermissions(user.id)
                
                return (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-900">{user.name}</span>
                        </div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                        {userPermissions.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {userPermissions.map((perm, idx) => (
                              <span
                                key={idx}
                                className={`text-xs px-2 py-1 rounded ${
                                  perm.access_granted
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {perm.department}: {perm.access_granted ? 'Granted' : 'Denied'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="border border-slate-300 rounded px-2 py-1 text-sm focus:border-blue-500"
                          disabled={user.id === session?.user?.id || actionLoading === `update_role-${user.id}`}
                        >
                          <option value="staff">Staff</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.employee_status}
                        onChange={(e) => updateUserStatus(user.id, e.target.value)}
                        className={`border rounded px-2 py-1 text-sm ${getStatusColor(user.employee_status)}`}
                        disabled={user.id === session?.user?.id || actionLoading?.includes(user.id)}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {user.department || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {linkedEmployee ? (
                        <div>
                          <span className="text-green-700 font-medium">{linkedEmployee.employee_name}</span>
                          <div className="text-xs text-slate-500">{linkedEmployee.employee_email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Not linked</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowUserDetailsModal(true)
                          }}
                          className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowLinkModal(true)
                            setSelectedEmployee(linkedEmployee?.toast_employee_id || '')
                          }}
                          disabled={actionLoading === `link_employee-${user.id}`}
                          className="p-2 text-slate-400 hover:text-purple-500 transition-colors disabled:opacity-50"
                          title="Link TOAST Employee"
                        >
                          <Link className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowPermissionModal(true)
                          }}
                          className="p-2 text-slate-400 hover:text-orange-500 transition-colors"
                          title="Manage Permissions"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        
                        {user.employee_status === 'active' ? (
                          <button
                            onClick={() => handleArchiveUser(user.id)}
                            disabled={actionLoading === `archive_user-${user.id}` || user.id === session?.user?.id}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Archive User"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestoreUser(user.id)}
                            disabled={actionLoading === `restore_user-${user.id}`}
                            className="p-2 text-slate-400 hover:text-green-500 transition-colors disabled:opacity-50"
                            title="Restore User"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No users found</h3>
            <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'staff' | 'manager' | 'admin' })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newUser.send_invitation}
                    onChange={(e) => setNewUser({ ...newUser, send_invitation: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Send invitation email</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                disabled={actionLoading === 'add_user'}
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={!newUser.name || !newUser.email || actionLoading === 'add_user'}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading === 'add_user' ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Employee Modal */}
      {showLinkModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Link TOAST Employee
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Link {selectedUser.name} to a TOAST employee account for data synchronization.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select TOAST Employee
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select an employee...</option>
                {toastEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkEmployee}
                disabled={!selectedEmployee || actionLoading === `link_employee-${selectedUser.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading === `link_employee-${selectedUser.id}` ? 'Linking...' : 'Link Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Modal */}
      {showPermissionModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Manage Department Permissions
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Customize permissions for {selectedUser.name}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={selectedPermissionDepartment}
                  onChange={(e) => setSelectedPermissionDepartment(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Level
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="permission"
                      value="grant"
                      checked={permissionAccess === true}
                      onChange={() => setPermissionAccess(true)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Grant Access</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="permission"
                      value="deny"
                      checked={permissionAccess === false}
                      onChange={() => setPermissionAccess(false)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Deny Access</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePermissionChange}
                disabled={!selectedPermissionDepartment || permissionAccess === null}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Update Permission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">User Details</h3>
              <button
                onClick={() => setShowUserDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedUser.name}</h4>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Role</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedUser.employee_status}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Department</label>
                  <p className="text-sm text-gray-900">{selectedUser.department || 'Not assigned'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Last Login</label>
                  <p className="text-sm text-gray-900">
                    {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Created</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedUser.created_at).toLocaleDateString()}
                </p>
              </div>
              
              {getLinkedEmployee(selectedUser) && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Linked TOAST Employee</label>
                  <div className="text-sm text-gray-900">
                    <p>{getLinkedEmployee(selectedUser)?.employee_name}</p>
                    <p className="text-gray-600">{getLinkedEmployee(selectedUser)?.employee_email}</p>
                  </div>
                </div>
              )}
              
              {getUserPermissions(selectedUser.id).length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Department Permissions</label>
                  <div className="space-y-1 mt-1">
                    {getUserPermissions(selectedUser.id).map((perm, idx) => (
                      <div
                        key={idx}
                        className={`text-xs px-2 py-1 rounded inline-block mr-2 ${
                          perm.access_granted
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {perm.department}: {perm.access_granted ? 'Granted' : 'Denied'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}