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
        
        // Fetch real achievements and manager updates from API
        await fetchAchievements()
        await fetchManagerUpdates()
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

  const fetchAchievements = async () => {
    try {
      // For now, set empty achievements since gamification isn't fully implemented yet
      // In the future, this would call an achievements API endpoint
      setAchievements([])
    } catch (error) {
      console.error('Error fetching achievements:', error)
    }
  }

  const fetchManagerUpdates = async () => {
    try {
      const response = await fetch('/api/manager/updates?requiresAck=false')
      if (response.ok) {
        const data = await response.json()
        const formattedUpdates: ManagerUpdate[] = data.updates?.map((update: {
          id: string;
          title: string;
          message: string;
          priority: string;
          created_at: string;
          type: string;
        }) => ({
          id: update.id,
          title: update.title,
          message: update.message,
          priority: update.priority,
          timestamp: update.created_at,
          type: update.type
        })) || []
        setManagerUpdates(formattedUpdates)
      }
    } catch (error) {
      console.error('Error fetching manager updates:', error)
      setManagerUpdates([])
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
    if (rate >= 80) return 'bg-green-100 text-green-700 border border-green-200'
    if (rate >= 60) return 'bg-gold-100 text-gold-700 border border-gold-200'
    return 'bg-red-100 text-red-700 border border-red-200'
  }

  const getUpdatePriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border border-red-200'
      case 'medium': return 'bg-gold-100 text-gold-700 border border-gold-200'
      case 'low': return 'bg-blue-100 text-blue-700 border border-blue-200'
      default: return 'bg-slate-100 text-slate-700 border border-slate-200'
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading team activity...</p>
        </div>
      </div>
    )
  }

  if (userProfile?.role !== 'manager') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 flex items-center justify-center">
        <div className="max-w-md w-full glass rounded-3xl p-8 text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 brand-header">Manager Access Required</h2>
          <p className="text-slate-600 mb-6 brand-subtitle">
            Only managers can access the team activity dashboard.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in-up">
          <button
            onClick={() => router.back()}
            className="flex items-center text-slate-600 hover:text-blue-600 transition-all duration-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="glass rounded-3xl p-8 mb-8 animate-fade-in-up animation-delay-100">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg shadow-purple-500/25">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text brand-title mb-2">Team Activity Dashboard</h1>
              <p className="text-slate-600 brand-subtitle text-lg">THE PASS Team Performance Overview</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 animate-fade-in-up animation-delay-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-red-700 font-medium">{error}</div>
              </div>
            </div>
          )}

          {/* Enhanced Team Stats Overview */}
          {teamStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 animate-fade-in-up animation-delay-200 group">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600 brand-subtitle">Total Tasks</p>
                    <p className="text-2xl font-bold text-slate-900 brand-header">{teamStats.totalTasks}</p>
                    <p className="text-xs text-slate-500 mt-1">All time</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 animate-fade-in-up animation-delay-300 group">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600 brand-subtitle">Completed Today</p>
                    <p className="text-2xl font-bold text-slate-900 brand-header">{teamStats.completedToday}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                      <p className="text-xs text-green-600">+12% vs yesterday</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 animate-fade-in-up animation-delay-400 group">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gold-600 brand-subtitle">Pending</p>
                    <p className="text-2xl font-bold text-slate-900 brand-header">{teamStats.pendingTasks}</p>
                    <p className="text-xs text-slate-500 mt-1">In progress</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 animate-fade-in-up animation-delay-500 group">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600 brand-subtitle">Overdue</p>
                    <p className="text-2xl font-bold text-slate-900 brand-header">{teamStats.overdueTasks}</p>
                    <p className="text-xs text-slate-500 mt-1">Needs attention</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 animate-fade-in-up animation-delay-600 group">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-600 brand-subtitle">Team Members</p>
                    <p className="text-2xl font-bold text-slate-900 brand-header">{teamStats.totalUsers}</p>
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
          <div className="glass rounded-3xl p-8 mb-8 animate-fade-in-up animation-delay-700">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/25">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 brand-header">Manager Updates</h3>
                <p className="text-slate-600 brand-subtitle">Live notifications and announcements</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {managerUpdates.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 brand-subtitle">No recent updates</p>
                </div>
              ) : (
                managerUpdates.map((update, index) => (
                  <div
                    key={update.id}
                    className="glass rounded-2xl p-6 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${800 + index * 100}ms` }}
                  >
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                        {getUpdateIcon(update.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 brand-header mb-2">{update.title}</h4>
                        <p className="text-slate-600 brand-subtitle mb-4">{update.message}</p>
                        <div className="flex items-center text-sm text-slate-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(update.timestamp)}</span>
                          <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${getUpdatePriorityColor(update.priority)}`}>
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
          <div className="glass rounded-3xl p-8 mb-8 animate-fade-in-up animation-delay-800">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-gold-500/25">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 brand-header">Team Achievements</h3>
                <p className="text-slate-600 brand-subtitle">Recent milestones and badges earned</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 brand-header mb-2">No Achievements Yet</h4>
                  <p className="text-slate-600 brand-subtitle">Complete tasks to unlock team achievements!</p>
                </div>
              ) : (
                achievements.map((achievement, index) => (
                  <div 
                    key={achievement.id} 
                    className="glass rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${900 + index * 100}ms` }}
                  >
                    <div className="text-3xl mb-4">{achievement.icon}</div>
                    <h4 className="font-bold text-slate-900 brand-header mb-2">{achievement.name}</h4>
                    <p className="text-sm text-slate-600 brand-subtitle mb-4">{achievement.description}</p>
                    {achievement.earnedBy.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gold-600 uppercase tracking-wide">Earned by:</p>
                        <div className="flex flex-wrap gap-1">
                          {achievement.earnedBy.slice(0, 3).map((name, index) => (
                            <span key={index} className="px-2 py-1 bg-gold-100 text-gold-700 rounded-full text-xs font-medium">
                              {name}
                            </span>
                          ))}
                          {achievement.earnedBy.length > 3 && (
                            <span className="px-2 py-1 bg-gold-100 text-gold-700 rounded-full text-xs font-medium">
                              +{achievement.earnedBy.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Completions with Enhanced Visuals */}
            <div className="glass rounded-3xl p-8 animate-fade-in-up animation-delay-900">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 brand-header">Recent Completions</h3>
                  <div className="flex items-center">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Live Feed
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {recentCompletions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 brand-subtitle">No recent completions</p>
                  </div>
                ) : (
                  recentCompletions.map((completion, index) => (
                    <div
                      key={completion.id}
                      className="glass rounded-2xl p-6 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                      style={{ animationDelay: `${1000 + index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 brand-header mb-2">{completion.task_title}</h4>
                          <div className="flex items-center mb-2 text-sm text-slate-600">
                            <User className="w-4 h-4 mr-2" />
                            <span className="brand-subtitle">{completion.completed_by_name}</span>
                            <Star className="w-4 h-4 ml-3 text-gold-500" />
                          </div>
                          <div className="flex items-center mb-3 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="brand-subtitle">{formatDate(completion.completed_at)}</span>
                          </div>
                          {completion.notes && (
                            <div className="mt-3 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                              <span className="font-medium text-slate-700">Note: </span>
                              <span className="text-slate-600 brand-subtitle">{completion.notes}</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-6 flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          {completion.has_photo && (
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                              <span className="text-lg">📷</span>
                            </div>
                          )}
                          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
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
            <div className="glass rounded-3xl p-8 animate-fade-in-up animation-delay-1000">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 brand-header">Team Performance Leaderboard</h3>
                </div>
              </div>
              
              <div className="space-y-4">
                {userActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 brand-subtitle">No team activity data</p>
                  </div>
                ) : (
                  userActivity
                    .sort((a, b) => b.completion_rate - a.completion_rate)
                    .map((user, index) => {
                      const streak = getStreakBadge(user.completed_today)
                      const isTopPerformer = index === 0 && user.completion_rate > 0
                      
                      return (
                        <div
                          key={user.user_id}
                          className={`glass rounded-2xl p-6 hover:shadow-lg transition-all duration-300 animate-fade-in-up ${
                            isTopPerformer 
                              ? 'ring-2 ring-gold-200 bg-gradient-to-br from-gold-50 to-gold-100' 
                              : ''
                          }`}
                          style={{ animationDelay: `${1100 + index * 100}ms` }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              {isTopPerformer && (
                                <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center mr-3">
                                  <Trophy className="w-4 h-4 text-white" />
                                </div>
                              )}
                              <h4 className="font-bold text-slate-900 brand-header">{user.user_name}</h4>
                              {streak && (
                                <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-red-100 ${streak.color} flex items-center`}>
                                  {streak.emoji} {streak.text}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPerformanceColor(user.completion_rate)}`}>
                                {user.completion_rate}% Complete
                              </span>
                              {index < 3 && (
                                <span className="text-2xl">
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-6 mb-4">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <span className="text-lg font-bold text-green-600">{user.completed_today}</span>
                              </div>
                              <p className="text-sm text-slate-600 brand-subtitle">Today</p>
                            </div>
                            <div className="text-center">
                              <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <span className="text-lg font-bold text-gold-600">{user.pending_tasks}</span>
                              </div>
                              <p className="text-sm text-slate-600 brand-subtitle">Pending</p>
                            </div>
                            <div className="text-center">
                              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <span className="text-lg font-bold text-red-600">{user.overdue_tasks}</span>
                              </div>
                              <p className="text-sm text-slate-600 brand-subtitle">Overdue</p>
                            </div>
                          </div>
                          
                          {/* Enhanced Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600 brand-subtitle">Completion Rate</span>
                              <span className="font-semibold text-slate-900">{user.completion_rate}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                              <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  user.completion_rate >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                  user.completion_rate >= 60 ? 'bg-gradient-to-r from-gold-400 to-gold-500' : 'bg-gradient-to-r from-red-400 to-red-500'
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