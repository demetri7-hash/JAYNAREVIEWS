'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Users, CheckCircle, Clock, AlertTriangle, TrendingUp, Activity, User, Calendar } from 'lucide-react'

interface TeamStats {
  totalTasks: number
  completedToday: number
  pendingTasks: number
  overdueTasks: number
  totalUsers: number
}

interface RecentCompletion {
  id: string
  task_title: string
  completed_by_name: string
  completed_at: string
  notes: string | null
  has_photo: boolean
}

interface UserActivity {
  user_id: string
  user_name: string
  user_email: string
  completed_today: number
  pending_tasks: number
  overdue_tasks: number
  completion_rate: number
}

interface UserProfile {
  email: string
  name: string
  role: 'staff' | 'manager'
}

export default function TeamActivity() {
  const router = useRouter()
  const { data: session } = useSession()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
  const [recentCompletions, setRecentCompletions] = useState<RecentCompletion[]>([])
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.user?.email) {
      checkAccess()
    }
  }, [session])

  const checkAccess = async () => {
    try {
      const response = await fetch('/api/me')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUserProfile(data.user)
          if (data.user.role === 'manager') {
            fetchTeamActivity()
          } else {
            // Redirect non-managers
            router.push('/')
          }
        }
      }
    } catch (error) {
      console.error('Error checking access:', error)
      router.push('/')
    }
  }

  const fetchTeamActivity = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/team-activity')
      
      if (response.ok) {
        const data = await response.json()
        setTeamStats(data.stats)
        setRecentCompletions(data.recentCompletions)
        setUserActivity(data.userActivity)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch team activity')
      }
    } catch (error) {
      console.error('Error fetching team activity:', error)
      setError('Failed to fetch team activity')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getPerformanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100'
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team activity...</p>
        </div>
      </div>
    )
  }

  if (userProfile?.role !== 'manager') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Manager Access Required</h2>
          <p className="text-gray-600 mb-6">
            Only managers can access the team activity dashboard.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Activity Dashboard</h1>
              <p className="text-gray-600">Overview of team performance and recent activity</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                <div className="text-red-600 text-sm">{error}</div>
              </div>
            </div>
          )}

          {/* Team Stats Overview */}
          {teamStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Activity className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-blue-900">{teamStats.totalTasks}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-600">Completed Today</p>
                    <p className="text-2xl font-bold text-green-900">{teamStats.completedToday}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900">{teamStats.pendingTasks}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-600">Overdue</p>
                    <p className="text-2xl font-bold text-red-900">{teamStats.overdueTasks}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-purple-600">Team Members</p>
                    <p className="text-2xl font-bold text-purple-900">{teamStats.totalUsers}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Completions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Recent Completions
              </h3>
              <div className="space-y-4">
                {recentCompletions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recent completions</p>
                ) : (
                  recentCompletions.map((completion) => (
                    <div
                      key={completion.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{completion.task_title}</h4>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <User className="w-4 h-4 mr-1" />
                            <span>{completion.completed_by_name}</span>
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{formatDate(completion.completed_at)}</span>
                          </div>
                          {completion.notes && (
                            <p className="mt-2 text-sm text-gray-700">{completion.notes}</p>
                          )}
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          {completion.has_photo && (
                            <div className="w-5 h-5 bg-blue-100 rounded text-blue-600 text-xs flex items-center justify-center">📷</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* User Performance */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Team Performance
              </h3>
              <div className="space-y-4">
                {userActivity.length === 0 ? (
                  <p className="text-gray-500 text-sm">No team activity data</p>
                ) : (
                  userActivity.map((user) => (
                    <div
                      key={user.user_id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{user.user_name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(user.completion_rate)}`}>
                          {user.completion_rate}% Complete
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-medium text-green-600">{user.completed_today}</p>
                          <p className="text-gray-600">Today</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-yellow-600">{user.pending_tasks}</p>
                          <p className="text-gray-600">Pending</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-red-600">{user.overdue_tasks}</p>
                          <p className="text-gray-600">Overdue</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}