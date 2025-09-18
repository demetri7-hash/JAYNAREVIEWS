'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  UserGroupIcon, 
  PencilIcon, 
  ArchiveBoxIcon, 
  ArrowPathIcon,
  LinkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface User {
  id: string
  email: string
  name: string
  role: 'manager' | 'employee'
  employee_status: 'active' | 'archived'
  toast_employee_id?: string
  archived_at?: string
  created_at: string
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

export default function EmployeeManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [users, setUsers] = useState<User[]>([])
  const [toastEmployees, setToastEmployees] = useState<ToastEmployee[]>([])
  const [permissionOverrides, setPermissionOverrides] = useState<PermissionOverride[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [permissionAccess, setPermissionAccess] = useState<boolean | null>(null)

  const departments = ['FOH', 'BOH', 'CLEANING', 'ADMIN']

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user?.role !== 'manager') {
      router.push('/my-tasks')
      return
    }

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch users and permissions
      const response = await fetch('/api/employee-management')
      const data = await response.json()
      
      setUsers(data.users || [])
      setPermissionOverrides(data.overrides || [])
      
      // Fetch TOAST employees
      const toastResponse = await fetch('/api/toast-employees')
      const toastData = await toastResponse.json()
      
      if (toastData.success) {
        setToastEmployees(toastData.employees || [])
      }
      
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const performAction = async (action: string, userId: string, data: Record<string, unknown>) => {
    try {
      setActionLoading(`${action}-${userId}`)
      
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
        await fetchData()
        setShowLinkModal(false)
        setShowPermissionModal(false)
        setSelectedUser(null)
      } else {
        alert('Action failed')
      }
    } catch (error) {
      console.error('Action error:', error)
      alert('Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string, oldRole: string) => {
    if (confirm(`Change user role from ${oldRole} to ${newRole}?`)) {
      await performAction('update_role', userId, { role: newRole, oldRole })
    }
  }

  const handleArchiveUser = async (userId: string) => {
    const reason = prompt('Reason for archiving (optional):')
    if (reason !== null) {
      await performAction('archive_user', userId, { reason })
    }
  }

  const handleRestoreUser = async (userId: string) => {
    if (confirm('Restore this user?')) {
      await performAction('restore_user', userId, {})
    }
  }

  const handleLinkEmployee = async () => {
    if (!selectedUser || !selectedEmployee) return
    
    const employee = toastEmployees.find(e => e.id === selectedEmployee)
    if (!employee) return

    await performAction('link_employee', selectedUser.id, {
      toastEmployeeId: employee.id,
      employeeName: employee.name,
      employeeEmail: employee.email
    })
  }

  const handlePermissionChange = async () => {
    if (!selectedUser || !selectedDepartment) return

    await performAction('update_permissions', selectedUser.id, {
      department: selectedDepartment,
      accessGranted: permissionAccess
    })
  }

  const getUserPermissions = (userId: string) => {
    return permissionOverrides.filter(override => override.user_id === userId)
  }

  const getLinkedEmployee = (user: User) => {
    return user.employee_links?.find(link => link.is_active)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            Employee Management Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Manage user roles, permissions, and TOAST employee data linking
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.employee_status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <LinkIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Linked to TOAST</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.toast_employee_id).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ArchiveBoxIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Archived</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.employee_status === 'archived').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TOAST Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const linkedEmployee = getLinkedEmployee(user)
                  
                  return (
                    <tr key={user.id} className={user.employee_status === 'archived' ? 'bg-gray-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value, user.role)}
                          disabled={actionLoading === `update_role-${user.id}`}
                          className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="employee">Employee</option>
                          <option value="manager">Manager</option>
                        </select>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.employee_status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.employee_status}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {linkedEmployee ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{linkedEmployee.employee_name}</div>
                            <div className="text-gray-500">{linkedEmployee.employee_email}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not linked</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowLinkModal(true)
                              setSelectedEmployee(linkedEmployee?.toast_employee_id || '')
                            }}
                            disabled={actionLoading === `link_employee-${user.id}`}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            <LinkIcon className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowPermissionModal(true)
                            }}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          
                          {user.employee_status === 'active' ? (
                            <button
                              onClick={() => handleArchiveUser(user.id)}
                              disabled={actionLoading === `archive_user-${user.id}`}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              <ArchiveBoxIcon className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestoreUser(user.id)}
                              disabled={actionLoading === `restore_user-${user.id}`}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              <ArrowPathIcon className="h-4 w-4" />
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
        </div>

        {/* Link Employee Modal */}
        {showLinkModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Link TOAST Employee
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Link {selectedUser.name} ({selectedUser.email}) to a TOAST employee record
              </p>
              
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-4"
              >
                <option value="">Select TOAST Employee...</option>
                {toastEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} {emp.email ? `(${emp.email})` : ''}
                  </option>
                ))}
              </select>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkEmployee}
                  disabled={!selectedEmployee || actionLoading === `link_employee-${selectedUser.id}`}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading === `link_employee-${selectedUser.id}` ? 'Linking...' : 'Link Employee'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Permission Modal */}
        {showPermissionModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Manage Department Permissions
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Customize permissions for {selectedUser.name}
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Department...</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access
                </label>
                <select
                  value={permissionAccess === null ? '' : permissionAccess.toString()}
                  onChange={(e) => setPermissionAccess(e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Use default role permissions</option>
                  <option value="true">Grant access</option>
                  <option value="false">Deny access</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePermissionChange}
                  disabled={!selectedDepartment}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  Update Permission
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}