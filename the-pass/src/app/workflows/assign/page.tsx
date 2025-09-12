'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Play,
  User,
  Briefcase
} from 'lucide-react'

interface Employee {
  id: string
  name: string
  email: string
  department: string
  role: string
  is_active: boolean
}

interface Checklist {
  id: string
  name: string
  description: string
  department: string
  category: string
  tasks: any[]
}

export default function AssignWorkflowPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const checklistId = searchParams.get('checklist')

  const [checklist, setChecklist] = useState<Checklist | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [workflowName, setWorkflowName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState('')

  // Check permissions
  useEffect(() => {
    if (!session?.user?.employee) return
    
    const userRole = session.user.employee.role
    if (!['manager', 'admin'].includes(userRole)) {
      router.push('/')
    }
  }, [session, router])

  useEffect(() => {
    if (!checklistId) {
      router.push('/workflows/checklists')
      return
    }

    const fetchData = async () => {
      try {
        // Fetch checklist details
        const checklistResponse = await fetch(`/api/checklists?id=${checklistId}`)
        const checklistData = await checklistResponse.json()
        
        if (checklistData.success && checklistData.checklists[0]) {
          const checklist = checklistData.checklists[0]
          setChecklist(checklist)
          setDepartment(checklist.department)
          setWorkflowName(`${checklist.name} - ${new Date().toLocaleDateString()}`)
        }

        // Fetch active employees
        const employeesResponse = await fetch('/api/employees?active=true')
        const employeesData = await employeesResponse.json()
        
        if (employeesData.success) {
          setEmployees(employeesData.employees)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [checklistId, router])

  const assignWorkflow = async () => {
    if (!selectedEmployee || !checklist) {
      setError('Please select an employee')
      return
    }

    setAssigning(true)
    setError('')

    try {
      const dueDatetime = dueDate && dueTime 
        ? new Date(`${dueDate}T${dueTime}:00`).toISOString()
        : null

      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist_id: checklist.id,
          assigned_to: selectedEmployee,
          name: workflowName,
          due_date: dueDatetime,
          department
        })
      })

      const data = await response.json()
      
      if (data.success) {
        router.push('/workflows')
      } else {
        setError(data.error || 'Failed to assign workflow')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setAssigning(false)
    }
  }

  const filteredEmployees = employees.filter(emp => 
    emp.is_active && 
    (department === 'BOTH' || emp.department === department || emp.department === 'BOTH')
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!checklist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Checklist not found</h2>
          <button
            onClick={() => router.push('/workflows/checklists')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Return to checklists
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assign Workflow</h1>
            <p className="text-gray-600">Assign checklist to team member</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assignment Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">Assignment Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow Name
                  </label>
                  <input
                    type="text"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter workflow name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="BOTH">Both (FOH & BOH)</option>
                    <option value="FOH">Front of House</option>
                    <option value="BOH">Back of House</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Time (Optional)
                    </label>
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={!dueDate}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Selection */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Assign to Employee</span>
              </h2>
              
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active employees found for {department} department</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEmployees.map((employee) => (
                    <label
                      key={employee.id}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedEmployee === employee.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="employee"
                        value={employee.id}
                        checked={selectedEmployee === employee.id}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{employee.name}</p>
                            <p className="text-sm text-gray-500">{employee.email}</p>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="px-2 py-1 bg-gray-100 rounded">
                              {employee.department}
                            </span>
                            <span className={`px-2 py-1 rounded ${
                              employee.role === 'manager' 
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {employee.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              
              <button
                onClick={assignWorkflow}
                disabled={!selectedEmployee || assigning}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>{assigning ? 'Assigning...' : 'Assign Workflow'}</span>
              </button>
            </div>
          </div>

          {/* Checklist Preview */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Checklist Preview</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">{checklist.name}</h3>
                {checklist.description && (
                  <p className="text-gray-600 text-sm mt-1">{checklist.description}</p>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{checklist.department}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>{checklist.tasks.length} tasks</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {checklist.tasks.reduce((acc, task) => acc + (task.estimated_minutes || 0), 0)} min
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Tasks ({checklist.tasks.length})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {checklist.tasks
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((task, index) => (
                    <div key={task.id} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                      <span className="text-xs text-gray-500 mt-1 w-6">
                        {index + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {task.estimated_minutes} min
                          </span>
                          {task.is_critical && (
                            <span className="text-xs text-red-600 font-medium">Critical</span>
                          )}
                          {task.requires_photo && (
                            <span className="text-xs text-blue-600">Photo required</span>
                          )}
                          {task.requires_note && (
                            <span className="text-xs text-green-600">Note required</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
