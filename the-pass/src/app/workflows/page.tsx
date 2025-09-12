'use client'
interface Workflow {
  id: string
  name: string
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue'
  due_date: string | null
  total_tasks: number
  completed_tasks: number
  assignee: { name: string; email: string }
  checklist: { name: string; category: string }
  created_at: string
  updated_at: string
}

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Play, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  Play, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  User,
  Calendar,
  Eye,
  UserX,
  RotateCcw
} from 'lucide-react'

export default function WorkflowsPage() {
  // Returns completion percentage for a workflow
  const getCompletionPercentage = (workflow: Workflow) => {
    if (!workflow.total_tasks || workflow.total_tasks === 0) return 0
    return Math.round((workflow.completed_tasks / workflow.total_tasks) * 100)
  }
  const { data: session } = useSession()
  const router = useRouter()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [assigneeFilter, setAssigneeFilter] = useState('ALL')
  const [employees, setEmployees] = useState<any[]>([])

  // Check permissions
  useEffect(() => {
    if (!session?.user?.employee) return
    
    const userRole = session.user.employee.role
    if (!['manager', 'admin'].includes(userRole)) {
      router.push('/')
    }
  }, [session, router])

  const fetchData = async () => {
    try {
      // Fetch workflows
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.append('status', statusFilter)
      if (assigneeFilter !== 'ALL') params.append('assigned_to', assigneeFilter)
      
      const workflowsResponse = await fetch(`/api/workflows?${params}`)
      const workflowsData = await workflowsResponse.json()
      
      if (workflowsData.success) {
        setWorkflows(workflowsData.workflows)
      }

      // Fetch employees for filter
      const employeesResponse = await fetch('/api/employees?active=true')
      const employeesData = await employeesResponse.json()
      
      if (employeesData.success) {
        setEmployees(employeesData.employees)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [statusFilter, assigneeFilter])

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.assignee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.checklist.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
  // ...existing code...
  }
  }

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    const isOverdue = date < now
    
    return {
      formatted: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOverdue
    }
  }

  const reassignWorkflow = async (workflowId: string, newAssignee: string) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: workflowId,
          assigned_to: newAssignee
        })
      })

      const data = await response.json()
      if (data.success) {
        fetchData() // Refresh data
      } else {
        alert(data.error || 'Failed to reassign workflow')
      }
    } catch (error) {
      alert('Network error occurred')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
            <p className="text-gray-600 mt-1">Manage assigned tasks and track progress</p>
          </div>
          
          <Link
            href="/workflows/checklists"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>Assign New Workflow</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workflows.filter(w => ['assigned', 'in_progress'].includes(w.status)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workflows.filter(w => w.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workflows.filter(w => w.status === 'overdue').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(workflows.map(w => w.assignee.email)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search workflows..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="ALL">All Assignees</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Workflows List */}
        {filteredWorkflows.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Play className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'ALL' || assigneeFilter !== 'ALL'
                ? 'Try adjusting your search or filters'
                : 'Get started by assigning your first workflow'
              }
            </p>
            {!searchTerm && statusFilter === 'ALL' && assigneeFilter === 'ALL' && (
              <Link
                href="/workflows/checklists"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Assign First Workflow</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Workflow
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWorkflows.map((workflow) => {
                    const dueDate = formatDueDate(workflow.due_date)
                    const completion = getCompletionPercentage(workflow)
                    
                    return (
                      <tr key={workflow.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {workflow.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {workflow.checklist.name} • {workflow.checklist.category}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {workflow.assignee.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {workflow.assignee.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-900">
                                  {workflow.completed_tasks}/{workflow.total_tasks}
                                </span>
                                <span className="text-gray-500">{completion}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className="bg-indigo-600 h-2 rounded-full"
                                  style={{ width: `${completion}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          {dueDate ? (
                            <div className={`text-sm ${dueDate.isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                              <div>{dueDate.formatted}</div>
                              <div className="text-xs text-gray-500">{dueDate.time}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">No due date</span>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(workflow.status)}`}>
                            <span className={getStatusColor(workflow.status) + " px-2 py-1 rounded text-xs font-semibold"}>
                              {workflow.status.replace('_', ' ')}
                            </span>
                            <span className="ml-1">{workflow.status.replace('_', ' ')}</span>
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/workflows/${workflow.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
