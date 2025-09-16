'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Users, CheckCircle, Clock, AlertTriangle, TrendingUp, Activity, User, Calendar, Trophy, Star, Target, Bell, Megaphone } from 'lucide-react'

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

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earnedBy: string[]
}

interface ManagerUpdate {
  id: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  timestamp: string
  type: 'announcement' | 'alert' | 'achievement'
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
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [managerUpdates, setManagerUpdates] = useState<ManagerUpdate[]>([])
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
        
        // Mock gamification data (in production, this would come from API)
        generateMockAchievements(data.userActivity)
        generateMockManagerUpdates()
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

  const generateMockAchievements = (users: UserActivity[]) => {
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        name: 'Perfect Day',
        description: 'Completed all assigned tasks today',
        icon: '🏆',
        earnedBy: users.filter(u => u.completion_rate === 100).map(u => u.user_name)
      },
      {
        id: '2', 
        name: 'Speed Demon',
        description: 'Completed 5+ tasks in one day',
        icon: '⚡',
        earnedBy: users.filter(u => u.completed_today >= 5).map(u => u.user_name)
      },
      {
        id: '3',
        name: 'Team Player',
        description: 'Helped with task transfers',
        icon: '🤝',
        earnedBy: users.slice(0, 2).map(u => u.user_name)
      },
      {
        id: '4',
        name: 'Consistent Performer',
        description: 'Maintained 80%+ completion rate',
        icon: '🎯',
        earnedBy: users.filter(u => u.completion_rate >= 80).map(u => u.user_name)
      }
    ]
    setAchievements(mockAchievements)
  }

  const generateMockManagerUpdates = () => {
    const mockUpdates: ManagerUpdate[] = [
      {
        id: '1',
        title: 'New Team Member Roles Available',
        message: 'FOH and BOH Team Member roles have been added for better department management.',
        priority: 'medium',
        timestamp: new Date().toISOString(),
        type: 'announcement'
      },
      {
        id: '2',
        title: 'Outstanding Performance Alert',
        message: 'Team completion rate is above 85% this week! Keep up the great work!',
        priority: 'high',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        type: 'achievement'
      },
      {
        id: '3',
        title: 'Task Assignment Reminder',
        message: 'Remember to review and assign tomorrow\'s prep tasks before end of shift.',
        priority: 'medium',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        type: 'alert'
      }
    ]
    setManagerUpdates(mockUpdates)
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

  const getUpdatePriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Megaphone className="w-4 h-4" />
      case 'alert': return <Bell className="w-4 h-4" />
      case 'achievement': return <Trophy className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getStreakBadge = (completedToday: number) => {
    if (completedToday >= 10) return { emoji: '🔥', text: 'On Fire!', color: 'text-red-600' }
    if (completedToday >= 5) return { emoji: '⚡', text: 'Hot Streak!', color: 'text-orange-600' }
    if (completedToday >= 3) return { emoji: '🌟', text: 'Good Job!', color: 'text-yellow-600' }
    return null
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

          {/* Enhanced Team Stats Overview */}
          {teamStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <Activity className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-blue-900">{teamStats.totalTasks}</p>
                    <p className="text-xs text-blue-600 mt-1">All time</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-600">Completed Today</p>
                    <p className="text-2xl font-bold text-green-900">{teamStats.completedToday}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                      <p className="text-xs text-green-600">+12% vs yesterday</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900">{teamStats.pendingTasks}</p>
                    <p className="text-xs text-yellow-600 mt-1">In progress</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-600">Overdue</p>
                    <p className="text-2xl font-bold text-red-900">{teamStats.overdueTasks}</p>
                    <p className="text-xs text-red-600 mt-1">Needs attention</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-purple-600">Team Members</p>
                    <p className="text-2xl font-bold text-purple-900">{teamStats.totalUsers}</p>
                    <div className="flex items-center mt-1">
                      <Target className="w-3 h-3 text-purple-600 mr-1" />
                      <p className="text-xs text-purple-600">Active today</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manager Updates Box */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8 border border-blue-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manager Updates</h3>
                <p className="text-sm text-gray-600">Live notifications and announcements</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {managerUpdates.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent updates</p>
              ) : (
                managerUpdates.map((update) => (
                  <div
                    key={update.id}
                    className={`border rounded-lg p-4 ${getUpdatePriorityColor(update.priority)}`}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 mt-0.5">
                        {getUpdateIcon(update.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{update.title}</h4>
                        <p className="text-sm mb-2">{update.message}</p>
                        <div className="flex items-center text-xs opacity-75">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{formatDate(update.timestamp)}</span>
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-white bg-opacity-50 font-medium">
                            {update.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Achievements & Gamification */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 mb-8 border border-yellow-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center mr-3">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Team Achievements</h3>
                <p className="text-sm text-gray-600">Recent milestones and badges earned</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="bg-white rounded-lg p-4 border border-yellow-200">
                  <div className="text-center">
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <h4 className="font-medium text-sm text-gray-900 mb-1">{achievement.name}</h4>
                    <p className="text-xs text-gray-600 mb-3">{achievement.description}</p>
                    {achievement.earnedBy.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-yellow-700">Earned by:</p>
                        <div className="flex flex-wrap gap-1">
                          {achievement.earnedBy.slice(0, 3).map((name, index) => (
                            <span key={index} className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                              {name}
                            </span>
                          ))}
                          {achievement.earnedBy.length > 3 && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                              +{achievement.earnedBy.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Completions with Enhanced Visuals */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Recent Completions
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Live Feed
                </span>
              </h3>
              <div className="space-y-4">
                {recentCompletions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recent completions</p>
                ) : (
                  recentCompletions.map((completion) => (
                    <div
                      key={completion.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{completion.task_title}</h4>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <User className="w-4 h-4 mr-1" />
                            <span>{completion.completed_by_name}</span>
                            <Star className="w-4 h-4 ml-2 text-yellow-500" />
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{formatDate(completion.completed_at)}</span>
                          </div>
                          {completion.notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                              <span className="font-medium">Note: </span>
                              {completion.notes}
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          {completion.has_photo && (
                            <div className="w-6 h-6 bg-blue-100 rounded text-blue-600 text-xs flex items-center justify-center">
                              📷
                            </div>
                          )}
                          <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            +10 XP
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* User Performance with Gamification */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Team Performance Leaderboard
              </h3>
              <div className="space-y-4">
                {userActivity.length === 0 ? (
                  <p className="text-gray-500 text-sm">No team activity data</p>
                ) : (
                  userActivity
                    .sort((a, b) => b.completion_rate - a.completion_rate)
                    .map((user, index) => {
                      const streak = getStreakBadge(user.completed_today)
                      const isTopPerformer = index === 0 && user.completion_rate > 0
                      
                      return (
                        <div
                          key={user.user_id}
                          className={`border rounded-lg p-4 ${
                            isTopPerformer 
                              ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50' 
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              {isTopPerformer && <Trophy className="w-4 h-4 text-yellow-600 mr-2" />}
                              <h4 className="font-medium text-gray-900">{user.user_name}</h4>
                              {streak && (
                                <span className={`ml-2 text-sm ${streak.color} flex items-center`}>
                                  {streak.emoji} {streak.text}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(user.completion_rate)}`}>
                                {user.completion_rate}% Complete
                              </span>
                              {index < 3 && (
                                <span className="text-lg">
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                </span>
                              )}
                            </div>
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
                          
                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  user.completion_rate >= 80 ? 'bg-green-500' :
                                  user.completion_rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${user.completion_rate}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}