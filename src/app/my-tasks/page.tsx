'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Camera, FileText, Calendar, RefreshCw, Users, X } from 'lucide-react'
import { useLanguage, staticTranslations } from '@/contexts/LanguageContext'
import { LanguageToggleCompact } from '@/components/LanguageToggle'

interface Task {
  id: string
  title: string
  description: string | null
  requires_notes: boolean
  requires_photo: boolean
  created_at: string
}

interface Assignment {
  id: string
  task_id: string
  due_date: string
  status: 'pending' | 'completed' | 'overdue'
  recurrence: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'once'
  task: Task
}

interface User {
  id: string
  email: string
  name: string | null
  role: string | null
}

export default function MyTasks() {
  const router = useRouter()
  const { language, getText } = useLanguage()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false
  })
  const [loadingMore, setLoadingMore] = useState(false)
  
  // Transfer modal state
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferAssignmentId, setTransferAssignmentId] = useState<string | null>(null)
  const [transferUsers, setTransferUsers] = useState<User[]>([])
  const [selectedTransferUser, setSelectedTransferUser] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [transferSubmitting, setTransferSubmitting] = useState(false)

  useEffect(() => {
    fetchMyTasks()
  }, [])

  const fetchMyTasks = async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true)
      else setLoadingMore(true)

      const response = await fetch(`/api/my-tasks?page=${page}&limit=20`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }

      const data = await response.json()
      
      if (append) {
        setAssignments(prev => [...prev, ...(data.assignments || [])])
      } else {
        setAssignments(data.assignments || [])
      }
      
      setPagination(data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        hasMore: false
      })
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setError(error instanceof Error ? error.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreTasks = () => {
    if (pagination.hasMore && !loadingMore) {
      fetchMyTasks(pagination.page + 1, true)
    }
  }

  // Transfer functions
  const openTransferModal = (assignmentId: string) => {
    setTransferAssignmentId(assignmentId)
    setShowTransferModal(true)
    fetchTransferUsers()
  }

  const closeTransferModal = () => {
    setShowTransferModal(false)
    setTransferAssignmentId(null)
    setSelectedTransferUser('')
    setTransferReason('')
  }

  const fetchTransferUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setTransferUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users for transfer:', error)
    }
  }

  const submitTransfer = async () => {
    if (!transferAssignmentId || !selectedTransferUser) return

    setTransferSubmitting(true)
    try {
      const response = await fetch('/api/transfer-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId: transferAssignmentId,
          toUserId: selectedTransferUser,
          reason: transferReason
        })
      })

      if (response.ok) {
        closeTransferModal()
        // Refresh tasks to show updated status
        fetchMyTasks(1, false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to submit transfer request')
      }
    } catch (error) {
      console.error('Error submitting transfer:', error)
      setError('Failed to submit transfer request')
    } finally {
      setTransferSubmitting(false)
    }
  }

  const getTaskStatus = (assignment: Assignment) => {
    // If manually completed, return completed
    if (assignment.status === 'completed') {
      return 'completed'
    }
    
    // Calculate if overdue using same logic as formatDueDate
    const date = new Date(assignment.due_date)
    const pacificOptions = { timeZone: 'America/Los_Angeles' }
    const nowPacific = new Date(new Date().toLocaleString('en-US', pacificOptions))
    const duePacific = new Date(date.toLocaleString('en-US', pacificOptions))
    
    // Compare including time, not just date
    if (duePacific < nowPacific) {
      return 'overdue'
    }
    
    return 'pending'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />
      case 'overdue':
        return <AlertCircle className="w-5 h-5" />
      case 'pending':
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true
    return getTaskStatus(assignment) === filter
  })

  const formatDueDate = (dateString: string) => {
    // Convert UTC date back to Pacific time for display
    const date = new Date(dateString)
    
    // Create date objects in Pacific timezone for comparison
    const pacificOptions = { timeZone: 'America/Los_Angeles' }
    const nowPacific = new Date(new Date().toLocaleString('en-US', pacificOptions))
    const duePacific = new Date(date.toLocaleString('en-US', pacificOptions))
    
    const today = new Date(nowPacific.getFullYear(), nowPacific.getMonth(), nowPacific.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const dueDay = new Date(duePacific.getFullYear(), duePacific.getMonth(), duePacific.getDate())

    if (dueDay.getTime() === today.getTime()) {
      return 'Due Today'
    } else if (dueDay.getTime() === tomorrow.getTime()) {
      return 'Due Tomorrow'
    } else if (dueDay < today) {
      return 'Overdue'
    } else {
      return duePacific.toLocaleDateString('en-US', { 
        timeZone: 'America/Los_Angeles',
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {staticTranslations.backToDashboard[language]}
          </button>
          <LanguageToggleCompact />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{staticTranslations.myTasks[language]}</h1>
              <p className="text-gray-600">{staticTranslations.viewCompleteAssignedTasks[language]}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="text-red-600 text-sm">{error}</div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {[
              { key: 'all', label: staticTranslations.all[language] },
              { key: 'pending', label: staticTranslations.pendingTasks[language] },
              { key: 'completed', label: staticTranslations.completed[language] },
              { key: 'overdue', label: staticTranslations.overdue[language] }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as 'all' | 'pending' | 'completed' | 'overdue')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' ? 'No tasks assigned' : `No ${filter} tasks`}
                </h3>
                <p className="text-gray-600">
                  {filter === 'all' 
                    ? 'You don\'t have any tasks assigned yet.' 
                    : `You don't have any ${filter} tasks.`
                  }
                </p>
              </div>
            ) : (
              filteredAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-900 mr-3">
                          {assignment.task.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getTaskStatus(assignment))}`}>
                          {getStatusIcon(getTaskStatus(assignment))}
                          <span className="ml-1 capitalize">{getTaskStatus(assignment)}</span>
                        </span>
                      </div>
                      
                      {assignment.task.description && (
                        <p className="text-gray-600 mb-3">{assignment.task.description}</p>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDueDate(assignment.due_date)}
                        </div>
                        <div className="flex items-center">
                          <span className="capitalize">{assignment.recurrence}</span>
                        </div>
                        {assignment.task.requires_notes && (
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            Notes required
                          </div>
                        )}
                        {assignment.task.requires_photo && (
                          <div className="flex items-center">
                            <Camera className="w-4 h-4 mr-1" />
                            Photo required
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      {(getTaskStatus(assignment) === 'pending' || getTaskStatus(assignment) === 'overdue') ? (
                        <>
                          <button
                            onClick={() => router.push(`/complete-task/${assignment.id}`)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                          >
                            Complete Task
                          </button>
                          <button
                            onClick={() => openTransferModal(assignment.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Transfer
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => router.push(`/view-task/${assignment.id}`)}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Load More Button */}
          {pagination.hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMoreTasks}
                disabled={loadingMore}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingMore ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading more...
                  </>
                ) : (
                  `Load More Tasks (${pagination.total - assignments.length} remaining)`
                )}
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {assignments.length} of {pagination.total} tasks
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Transfer Task</h3>
              <button
                onClick={closeTransferModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="transferUser" className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer to:
                </label>
                <select
                  id="transferUser"
                  value={selectedTransferUser}
                  onChange={(e) => setSelectedTransferUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a team member</option>
                  {transferUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="transferReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for transfer (optional):
                </label>
                <textarea
                  id="transferReason"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Why are you transferring this task?"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeTransferModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={transferSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={submitTransfer}
                disabled={!selectedTransferUser || transferSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {transferSubmitting ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Submit Transfer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}