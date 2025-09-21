'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Users, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/buttons'
import WorkflowCreator from '@/components/workflows/WorkflowCreator'
import MyWorkflowCards from '@/components/workflows/MyWorkflowCards'
import { Workflow } from '@/types/workflow'

export default function WorkflowsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Check authentication and permissions
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/')
      return
    }

    // Fetch user role first, then fetch workflows
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user?.role) {
          setUserRole(data.user.role)
          return data.user.role
        }
        return null
      })
      .then(role => {
        if (role) {
          fetchWorkflows(role)
        }
      })
      .catch(() => setUserRole(null))
  }, [session, status, router])

  const fetchWorkflows = async (role?: string) => {
    const currentRole = role || userRole
    try {
      // Managers see all workflows, users see only their assigned workflows
      const apiEndpoint = (currentRole === 'manager' || currentRole === 'admin') 
        ? '/api/workflows' 
        : '/api/my-workflows';
        
      const response = await fetch(apiEndpoint)
      if (response.ok) {
        const data = await response.json()
        // Handle different response structures
        if (apiEndpoint === '/api/my-workflows') {
          // For my-workflows API, extract workflows from assignments
          const workflowsFromAssignments = data.assignments?.map((assignment: { workflow: unknown }) => assignment.workflow) || []
          setWorkflows(workflowsFromAssignments)
        } else {
          // For workflows API, use workflows directly
          setWorkflows(data.workflows || [])
        }
      } else if (response.status === 403) {
        setMessage({ type: 'error', text: 'Access denied. Manager permissions required.' })
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch workflows' })
      }
    } catch (error) {
      console.error('Error fetching workflows:', error)
      setMessage({ type: 'error', text: 'Error loading workflows' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWorkflow = async (workflowData: unknown) => {
    try {
      const method = editingWorkflow ? 'PUT' : 'POST'
      const url = editingWorkflow ? `/api/workflows/${editingWorkflow.id}` : '/api/workflows'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${editingWorkflow ? 'update' : 'create'} workflow`)
      }
      
      setMessage({ 
        type: 'success', 
        text: `Workflow ${editingWorkflow ? 'updated' : 'created'} successfully` 
      })
      
      setShowCreator(false)
      setEditingWorkflow(null)
      fetchWorkflows()
    } catch (error) {
      console.error('Error with workflow:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : `Failed to ${editingWorkflow ? 'update' : 'create'} workflow` 
      })
    }
  }

  const handleEditWorkflow = (workflow: Workflow) => {
    setEditingWorkflow(workflow)
    setShowCreator(true)
  }

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete workflow')
      }

      setMessage({ type: 'success', text: 'Workflow deleted successfully' })
      fetchWorkflows()
    } catch (error) {
      console.error('Error deleting workflow:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to delete workflow' 
      })
    }
  }

  const handleCancelCreator = () => {
    setShowCreator(false)
    setEditingWorkflow(null)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflows...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {userRole === 'manager' || userRole === 'admin' ? 'Workflow Management' : 'My Workflows'}
              </h1>
              <p className="text-gray-600">
                {userRole === 'manager' || userRole === 'admin' 
                  ? 'Create and manage automated workflows for your team'
                  : 'View and complete your assigned workflows'}
              </p>
            </div>
            {userRole === 'manager' || userRole === 'admin' ? (
              <Button
                onClick={() => setShowCreator(true)}
                size="lg"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold px-6 py-3 rounded-lg border-0"
              >
                <Plus className="h-5 w-5" />
                New Workflow
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <p>{message.text}</p>
            <button 
              onClick={() => setMessage(null)}
              className="ml-2 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Workflow Creator (only for managers/admins) */}
        {showCreator && (userRole === 'manager' || userRole === 'admin') && (
          <WorkflowCreator
            existingWorkflow={editingWorkflow || undefined}
            onSave={handleCreateWorkflow}
            onCancel={handleCancelCreator}
          />
        )}

        {/* Content based on user role */}
        {userRole === 'manager' || userRole === 'admin' ? (
          // Manager view: Workflows Grid
          workflows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {workflow.name}
                      </h3>
                      <div className="flex gap-2 ml-4 flex-shrink-0">
                        <button
                          onClick={() => handleEditWorkflow(workflow)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {workflow.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {workflow.description}
                      </p>
                    )}

                    <div className="space-y-3">
                      {/* Assignment Info */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>
                          {workflow.departments?.length || 0} dept{(workflow.departments?.length || 0) !== 1 ? 's' : ''}, {' '}
                          {workflow.roles?.length || 0} role{(workflow.roles?.length || 0) !== 1 ? 's' : ''}, {' '}
                          {workflow.assigned_users?.length || 0} user{(workflow.assigned_users?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Due Date */}
                      {workflow.due_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Due: {new Date(workflow.due_date).toLocaleDateString()}
                            {workflow.due_time && ` at ${workflow.due_time}`}
                          </span>
                        </div>
                      )}

                      {/* Recurrence */}
                      {workflow.is_repeatable && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span className="capitalize">
                            Repeats: {workflow.recurrence_type || 'Custom'}
                          </span>
                        </div>
                      )}

                      {/* Task Count */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>📋 {workflow.task_count || 0} task{(workflow.task_count || 0) !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        workflow.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {workflow.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-sm mx-auto">
                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows yet</h3>
                <p className="text-gray-500 mb-6">
                  Create your first workflow to automate team tasks and improve efficiency.
                </p>
                <Button
                  onClick={() => setShowCreator(true)}
                  className="mx-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Workflow
                </Button>
              </div>
            </div>
          )
        ) : (
          // User view: MyWorkflowCards component
          <MyWorkflowCards userId={session?.user?.id || ''} userRole={userRole || 'staff'} />
        )}
      </div>
    </div>
  )
}