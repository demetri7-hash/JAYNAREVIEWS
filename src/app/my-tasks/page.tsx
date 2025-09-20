'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Camera, FileText, Calendar, RefreshCw, Users, X } from 'lucide-react'
import { useLanguage, staticTranslations } from '@/contexts/LanguageContext'
import { LanguageToggleCompact } from '@/components/LanguageToggle'
import Navigation from '@/components/Navigation'

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
  const { data: session, status } = useSession()
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
    if (status === 'loading') return
    if (!session) {
      router.push('/')
      return
    }
    fetchMyTasks()
  }, [session, status])

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">{staticTranslations.loadingTasks[language]}</p>
        </div>
      </div>
    )
  }

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!session) {
    return null
  }

  return (
    <>
      <Navigation currentPage="my-tasks" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 md:ml-64">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Main Content */}
          <div className="glass rounded-3xl p-8 animate-fade-in-scale">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black mb-3 brand-header">
              <span className="gradient-text">{staticTranslations.myTasks[language]}</span>
            </h1>
            <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto brand-subtitle">
              {staticTranslations.viewCompleteAssignedTasks[language]}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 animate-fade-in-up">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 p-2 bg-white/30 rounded-2xl border border-white/20 backdrop-blur-sm">
            {[
              { key: 'all', label: staticTranslations.all[language], icon: CheckCircle },
              { key: 'pending', label: staticTranslations.pendingTasks[language], icon: Clock },
              { key: 'completed', label: staticTranslations.completed[language], icon: CheckCircle },
              { key: 'overdue', label: staticTranslations.overdue[language], icon: AlertCircle }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as 'all' | 'pending' | 'completed' | 'overdue')}
                  className={`flex-1 min-w-0 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                    filter === tab.key
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tasks List */}
          <div className="space-y-6">
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-16 animate-fade-in-up">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 brand-header">
                  {filter === 'all' ? 'No tasks assigned' : `No ${filter} tasks`}
                </h3>
                <p className="text-slate-600 brand-subtitle">
                  {filter === 'all' 
                    ? 'You don\'t have any tasks assigned yet.' 
                    : `You don't have any ${filter} tasks.`
                  }
                </p>
              </div>
            ) : (
              filteredAssignments.map((assignment, index) => (
                <div
                  key={assignment.id}
                  className="group bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/70 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                        <h3 className="text-xl font-bold text-slate-900 brand-header group-hover:text-blue-600 transition-colors">
                          {assignment.task.title}
                        </h3>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          getTaskStatus(assignment) === 'completed' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : getTaskStatus(assignment) === 'overdue'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {getStatusIcon(getTaskStatus(assignment))}
                          <span className="ml-2 capitalize">{getTaskStatus(assignment)}</span>
                        </span>
                      </div>
                      
                      {assignment.task.description && (
                        <p className="text-slate-600 mb-4 leading-relaxed">{assignment.task.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-lg">
                          <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                          <span className="font-medium">{formatDueDate(assignment.due_date)}</span>
                        </div>
                        <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-lg">
                          <RefreshCw className="w-4 h-4 mr-2 text-slate-400" />
                          <span className="capitalize font-medium">{assignment.recurrence}</span>
                        </div>
                        {assignment.task.requires_notes && (
                          <div className="flex items-center bg-blue-100 px-3 py-1.5 rounded-lg">
                            <FileText className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="text-blue-700 font-medium">Notes required</span>
                          </div>
                        )}
                        {assignment.task.requires_photo && (
                          <div className="flex items-center bg-purple-100 px-3 py-1.5 rounded-lg">
                            <Camera className="w-4 h-4 mr-2 text-purple-500" />
                            <span className="text-purple-700 font-medium">Photo required</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-48">
                      {(getTaskStatus(assignment) === 'pending' || getTaskStatus(assignment) === 'overdue') ? (
                        <>
                          <button
                            onClick={() => router.push(`/complete-task/${assignment.id}`)}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5"
                          >
                            Complete Task
                          </button>
                          <button
                            onClick={() => openTransferModal(assignment.id)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Transfer
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => router.push(`/view-task/${assignment.id}`)}
                          className="bg-white/70 text-slate-700 px-6 py-3 rounded-xl hover:bg-white/90 transition-all duration-200 font-medium border border-white/50 hover:border-slate-200"
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
            <div className="mt-10 text-center animate-fade-in-up">
              <button
                onClick={loadMoreTasks}
                disabled={loadingMore}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                {loadingMore ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Loading more...
                  </>
                ) : (
                  `Load More Tasks (${pagination.total - assignments.length} remaining)`
                )}
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center bg-white/50 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20">
              <span className="text-slate-600 font-medium">
                Showing <span className="text-slate-900 font-bold">{assignments.length}</span> of <span className="text-slate-900 font-bold">{pagination.total}</span> tasks
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass rounded-3xl max-w-lg w-full p-8 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900 brand-header">Transfer Task</h3>
              <button
                onClick={closeTransferModal}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="transferUser" className="block text-sm font-medium text-slate-700 mb-3">
                  Transfer to:
                </label>
                <select
                  id="transferUser"
                  value={selectedTransferUser}
                  onChange={(e) => setSelectedTransferUser(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all duration-200 bg-white"
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
                <label htmlFor="transferReason" className="block text-sm font-medium text-slate-700 mb-3">
                  Reason for transfer (optional):
                </label>
                <textarea
                  id="transferReason"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all duration-200 bg-white resize-none"
                  placeholder="Why are you transferring this task?"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={closeTransferModal}
                disabled={transferSubmitting}
                className="flex-1 px-6 py-3 text-slate-700 bg-white/70 rounded-xl hover:bg-white/90 transition-all duration-200 font-medium border border-white/50"
              >
                Cancel
              </button>
              <button
                onClick={submitTransfer}
                disabled={!selectedTransferUser || transferSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2"
              >
                {transferSubmitting ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Submit Transfer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  )
}