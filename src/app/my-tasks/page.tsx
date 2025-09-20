'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Camera, FileText, Calendar, RefreshCw, Users, X } from 'lucide-react'
import { useLanguage, staticTranslations } from '@/contexts/LanguageContext'
import { LanguageToggleCompact } from '@/components/LanguageToggle'
import Navigation from '@/components/Navigation'
import { Button, IconButton } from '@/components/buttons'

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Main Content */}
          <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 animate-fade-in-scale">
          {/* Hero Section */}
          <div className="text-center mb-6 sm:mb-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mb-3 brand-header">
              <span className="gradient-text">{staticTranslations.myTasks[language]}</span>
            </h1>
            <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto brand-subtitle text-sm sm:text-base">
              {staticTranslations.viewCompleteAssignedTasks[language]}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6 sm:mb-8 animate-fade-in-up">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 sm:mr-3 flex-shrink-0" />
                <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="grid grid-cols-2 sm:flex gap-2 mb-6 sm:mb-8 p-2 bg-white/30 rounded-xl sm:rounded-2xl border border-white/20 backdrop-blur-sm">
            {[
              { key: 'all', label: staticTranslations.all[language], icon: CheckCircle },
              { key: 'pending', label: staticTranslations.pendingTasks[language], icon: Clock },
              { key: 'completed', label: staticTranslations.completed[language], icon: CheckCircle },
              { key: 'overdue', label: staticTranslations.overdue[language], icon: AlertCircle }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <Button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as 'all' | 'pending' | 'completed' | 'overdue')}
                  variant={filter === tab.key ? 'primary' : 'ghost'}
                  size="md"
                  className={`flex-1 min-w-0 justify-center ${
                    filter === tab.key ? 'shadow-lg' : ''
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm truncate">{tab.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Tasks List */}
          <div className="space-y-4 sm:space-y-6">
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12 sm:py-16 animate-fade-in-up">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 brand-header">
                  {filter === 'all' ? 'No tasks assigned' : `No ${filter} tasks`}
                </h3>
                <p className="text-slate-600 brand-subtitle text-sm sm:text-base">
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
                  className="group bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-white/70 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col gap-3 mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <h3 className="text-lg sm:text-xl font-bold text-slate-900 brand-header group-hover:text-blue-600 transition-colors">
                            {assignment.task.title}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 self-start ${
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
                      </div>
                      
                      {assignment.task.description && (
                        <p className="text-slate-600 mb-4 leading-relaxed text-sm sm:text-base">{assignment.task.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500">
                        <div className="flex items-center bg-slate-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-slate-400" />
                          <span className="font-medium">{formatDueDate(assignment.due_date)}</span>
                        </div>
                        <div className="flex items-center bg-slate-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                          <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-slate-400" />
                          <span className="capitalize font-medium">{assignment.recurrence}</span>
                        </div>
                        {assignment.task.requires_notes && (
                          <div className="flex items-center bg-blue-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-500" />
                            <span className="text-blue-700 font-medium">Notes</span>
                          </div>
                        )}
                        {assignment.task.requires_photo && (
                          <div className="flex items-center bg-purple-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                            <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-500" />
                            <span className="text-purple-700 font-medium">Photo</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200/50">
                      {(getTaskStatus(assignment) === 'pending' || getTaskStatus(assignment) === 'overdue') ? (
                        <>
                          <Button
                            onClick={() => router.push(`/complete-task/${assignment.id}`)}
                            variant="success"
                            size="md"
                            className="flex-1 sm:flex-none"
                          >
                            Complete Task
                          </Button>
                          <Button
                            onClick={() => openTransferModal(assignment.id)}
                            variant="primary"
                            size="md"
                            className="flex-1 sm:flex-none"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Transfer
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => router.push(`/view-task/${assignment.id}`)}
                          variant="secondary"
                          size="md"
                          className="flex-1 sm:flex-none"
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Load More Button */}
          {pagination.hasMore && (
            <div className="mt-8 sm:mt-10 text-center animate-fade-in-up">
              <Button
                onClick={loadMoreTasks}
                disabled={loadingMore}
                loading={loadingMore}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                {loadingMore ? (
                  'Loading more...'
                ) : (
                  `Load More Tasks (${pagination.total - assignments.length} remaining)`
                )}
              </Button>
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
          <div className="glass rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 lg:p-8 animate-scale-in">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 brand-header">Transfer Task</h3>
              <IconButton
                onClick={closeTransferModal}
                icon={<X className="w-5 h-5" />}
                label="Close modal"
                variant="ghost"
                size="md"
              />
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="transferUser" className="block text-sm font-medium text-slate-700 mb-2 sm:mb-3">
                  Transfer to:
                </label>
                <select
                  id="transferUser"
                  value={selectedTransferUser}
                  onChange={(e) => setSelectedTransferUser(e.target.value)}
                  className="w-full min-h-[44px] px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all duration-200 bg-white text-sm sm:text-base"
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
                <label htmlFor="transferReason" className="block text-sm font-medium text-slate-700 mb-2 sm:mb-3">
                  Reason for transfer (optional):
                </label>
                <textarea
                  id="transferReason"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20 transition-all duration-200 bg-white resize-none text-sm sm:text-base"
                  placeholder="Why are you transferring this task?"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
              <Button
                onClick={closeTransferModal}
                disabled={transferSubmitting}
                variant="secondary"
                size="lg"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={submitTransfer}
                disabled={!selectedTransferUser || transferSubmitting}
                loading={transferSubmitting}
                variant="primary"
                size="lg"
                className="flex-1"
              >
                <Users className="w-4 h-4 mr-2" />
                Submit Transfer
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  )
}