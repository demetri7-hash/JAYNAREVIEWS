import React, { useState, useEffect } from 'react'
import { useUser } from '../../contexts/UserContext'

interface Employee {
  id: string
  name: string
  role: string
  department: string
  is_active: boolean
}

export default function ManagerDashboard() {
  const { user } = useUser()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [update, setUpdate] = useState({
    title: '',
    content: '',
    target_users: 'all',
    target_department: '',
    target_role: '',
    specific_user_ids: [] as string[],
    requires_acknowledgment: false,
    acknowledgment_signature_required: false,
    priority: 'normal',
    expires_at: ''
  })

  const isManager = user?.role === 'manager' || user?.role === 'admin'

  useEffect(() => {
    if (isManager) {
      loadEmployees()
    }
  }, [isManager])

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      const data = await response.json()
      if (data.success) {
        setEmployees(data.employees)
      }
    } catch (error) {
      console.error('Error loading employees:', error)
    }
  }

  const createManagerUpdate = async () => {
    if (!user || !update.title.trim() || !update.content.trim()) return

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_manager_update',
          author_id: user.id,
          ...update,
          expires_at: update.expires_at || null
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`Manager update sent to ${data.notifications_sent} employees!`)
        setUpdate({
          title: '',
          content: '',
          target_users: 'all',
          target_department: '',
          target_role: '',
          specific_user_ids: [],
          requires_acknowledgment: false,
          acknowledgment_signature_required: false,
          priority: 'normal',
          expires_at: ''
        })
        setShowUpdateForm(false)
      }
    } catch (error) {
      console.error('Error creating manager update:', error)
      alert('Error creating manager update')
    }
  }

  const handleUserSelection = (userId: string, selected: boolean) => {
    if (selected) {
      setUpdate(prev => ({
        ...prev,
        specific_user_ids: [...prev.specific_user_ids, userId]
      }))
    } else {
      setUpdate(prev => ({
        ...prev,
        specific_user_ids: prev.specific_user_ids.filter(id => id !== userId)
      }))
    }
  }

  if (!isManager) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Manager access required</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Manager Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">📢 Manager Dashboard</h2>
          <button
            onClick={() => setShowUpdateForm(!showUpdateForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showUpdateForm ? 'Cancel' : 'Create Update'}
          </button>
        </div>

        {showUpdateForm && (
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Title
                </label>
                <input
                  type="text"
                  value={update.title}
                  onChange={(e) => setUpdate({ ...update, title: e.target.value })}
                  placeholder="Important: New Policy Update"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority Level
                </label>
                <select
                  value={update.priority}
                  onChange={(e) => setUpdate({ ...update, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message Content
              </label>
              <textarea
                value={update.content}
                onChange={(e) => setUpdate({ ...update, content: e.target.value })}
                placeholder="Enter your update message here..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="target_users"
                    value="all"
                    checked={update.target_users === 'all'}
                    onChange={(e) => setUpdate({ ...update, target_users: e.target.value })}
                    className="mr-2"
                  />
                  All Employees
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="target_users"
                    value="department"
                    checked={update.target_users === 'department'}
                    onChange={(e) => setUpdate({ ...update, target_users: e.target.value })}
                    className="mr-2"
                  />
                  Specific Department
                </label>
                
                {update.target_users === 'department' && (
                  <select
                    value={update.target_department}
                    onChange={(e) => setUpdate({ ...update, target_department: e.target.value })}
                    className="ml-6 px-3 py-1 border border-gray-300 rounded"
                  >
                    <option value="">Select Department</option>
                    <option value="FOH">Front of House</option>
                    <option value="BOH">Back of House</option>
                    <option value="Management">Management</option>
                  </select>
                )}
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="target_users"
                    value="role"
                    checked={update.target_users === 'role'}
                    onChange={(e) => setUpdate({ ...update, target_users: e.target.value })}
                    className="mr-2"
                  />
                  Specific Role
                </label>
                
                {update.target_users === 'role' && (
                  <select
                    value={update.target_role}
                    onChange={(e) => setUpdate({ ...update, target_role: e.target.value })}
                    className="ml-6 px-3 py-1 border border-gray-300 rounded"
                  >
                    <option value="">Select Role</option>
                    <option value="manager">Managers</option>
                    <option value="employee">Employees</option>
                    <option value="lead">Lead/Supervisor</option>
                  </select>
                )}
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="target_users"
                    value="specific"
                    checked={update.target_users === 'specific'}
                    onChange={(e) => setUpdate({ ...update, target_users: e.target.value })}
                    className="mr-2"
                  />
                  Specific Employees
                </label>
              </div>
            </div>

            {/* Specific User Selection */}
            {update.target_users === 'specific' && (
              <div className="ml-6 bg-gray-50 p-4 rounded">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employees:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {employees.filter(emp => emp.is_active).map(employee => (
                    <label key={employee.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={update.specific_user_ids.includes(employee.id)}
                        onChange={(e) => handleUserSelection(employee.id, e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {employee.name} ({employee.department} - {employee.role})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Acknowledgment Options */}
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={update.requires_acknowledgment}
                  onChange={(e) => setUpdate({ ...update, requires_acknowledgment: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Require Acknowledgment</span>
              </label>
              
              {update.requires_acknowledgment && (
                <label className="flex items-center ml-6">
                  <input
                    type="checkbox"
                    checked={update.acknowledgment_signature_required}
                    onChange={(e) => setUpdate({ ...update, acknowledgment_signature_required: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Require Full Name Signature</span>
                </label>
              )}
            </div>

            {/* Expiration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={update.expires_at}
                onChange={(e) => setUpdate({ ...update, expires_at: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowUpdateForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createManagerUpdate}
                disabled={!update.title.trim() || !update.content.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Send Update
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Active Employees</h3>
          <p className="text-2xl font-bold text-blue-600">
            {employees.filter(emp => emp.is_active).length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Departments</h3>
          <p className="text-2xl font-bold text-green-600">
            {new Set(employees.map(emp => emp.department)).size}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Recent Updates</h3>
          <p className="text-2xl font-bold text-purple-600">
            Coming Soon
          </p>
        </div>
      </div>
    </div>
  )
}