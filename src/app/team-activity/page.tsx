'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Users, CheckCircle, Clock, AlertTriangle, TrendingUp, Activity, User, Calendar, Trophy, Star, Target, Bell, Megaphone, X, Camera } from 'lucide-react'
import { useLanguage, staticTranslations } from '@/contexts/LanguageContext'
import { LanguageToggleCompact } from '@/components/LanguageToggle'

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
  title_en?: string
  title_es?: string
  title_tr?: string
  message_en?: string
  message_es?: string
  message_tr?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  type: 'announcement' | 'alert' | 'policy' | 'emergency'
  photo_url?: string
  isRead?: boolean
  requires_acknowledgment?: boolean
}

interface UserProfile {
  email: string
  name: string
  role: 'staff' | 'manager'
}

export default function TeamActivity() {
  const router = useRouter()
  const { data: session } = useSession()
  const { language, getText } = useLanguage()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
  const [recentCompletions, setRecentCompletions] = useState<RecentCompletion[]>([])
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [managerUpdates, setManagerUpdates] = useState<ManagerUpdate[]>([])
  const [updatesPagination, setUpdatesPagination] = useState({
    page: 1,
    limit: 3,
    total: 0,
    hasMore: false,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUpdate, setSelectedUpdate] = useState<ManagerUpdate | null>(null)

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
          // Allow all users to access team activity page
          fetchTeamActivity()
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

  const fetchManagerUpdates = async (page = 1) => {
    try {
      const response = await fetch(`/api/manager/updates?page=${page}&limit=3`)
      if (response.ok) {
        const data = await response.json()
        const formattedUpdates: ManagerUpdate[] = data.updates?.map((update: {
          id: string;
          title: string;
          message: string;
          title_en?: string;
          title_es?: string;
          title_tr?: string;
          message_en?: string;
          message_es?: string;
          message_tr?: string;
          priority: string;
          created_at: string;
          type: string;
          photo_url?: string;
          isRead?: boolean;
          requires_acknowledgment?: boolean;
        }) => ({
          id: update.id,
          title: update.title,
          message: update.message,
          title_en: update.title_en,
          title_es: update.title_es,
          title_tr: update.title_tr,
          message_en: update.message_en,
          message_es: update.message_es,
          message_tr: update.message_tr,
          priority: update.priority,
          timestamp: update.created_at,
          type: update.type,
          photo_url: update.photo_url,
          isRead: update.isRead,
          requires_acknowledgment: update.requires_acknowledgment
        })) || []
        setManagerUpdates(formattedUpdates)
        setUpdatesPagination(data.pagination || {
          page: 1,
          limit: 3,
          total: 0,
          hasMore: false,
          totalPages: 0
        })
      }
    } catch (error) {
      console.error('Error fetching manager updates:', error)
      setManagerUpdates([])
    }
  }

  const markUpdateAsRead = async (updateId: string) => {
    try {
      const response = await fetch('/api/manager/updates/read-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updateId }),
      })

      if (response.ok) {
        // Refresh the updates list to remove the read update
        fetchManagerUpdates(updatesPagination.page)
      }
    } catch (error) {
      console.error('Error marking update as read:', error)
    }
  }

  const markUpdateAsUnread = async (updateId: string) => {
    try {
      const response = await fetch(`/api/manager/updates/read-status?updateId=${updateId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Close modal and refresh updates
        setSelectedUpdate(null)
        fetchManagerUpdates(updatesPagination.page)
      }
    } catch (error) {
      console.error('Error marking update as unread:', error)
    }
  }

  const openUpdateModal = async (update: ManagerUpdate) => {
    setSelectedUpdate(update)
    // Mark as read when opened (unless it requires acknowledgment)
    if (!update.requires_acknowledgment && !update.isRead) {
      await markUpdateAsRead(update.id)
    }
  }

  const goToPage = (page: number) => {
    setUpdatesPagination(prev => ({ ...prev, page }))
    fetchManagerUpdates(page)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in-up">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center text-slate-600 hover:text-blue-600 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {getText(staticTranslations.backToDashboard.en, staticTranslations.backToDashboard.es, staticTranslations.backToDashboard.tr)}
            </button>
            <LanguageToggleCompact />
          </div>
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

          {/* Manager Updates Box */}
          <div className="glass rounded-3xl p-8 mb-8 animate-fade-in-up animation-delay-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/25">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 brand-header">
                    {getText(staticTranslations.managerUpdates.en, staticTranslations.managerUpdates.es, staticTranslations.managerUpdates.tr)}
                  </h3>
                  <p className="text-slate-600 brand-subtitle">Unread notifications and announcements</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/update-history')}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors underline"
              >
                Full Update History
              </button>
            </div>
            
            <div className="space-y-4">
              {managerUpdates.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 brand-subtitle">No unread updates</p>
                  <button
                    onClick={() => router.push('/update-history')}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors underline mt-2"
                  >
                    View update history
                  </button>
                </div>
              ) : (
                <>
                  {managerUpdates.map((update, index) => (
                    <div
                      key={update.id}
                      className={`glass rounded-2xl p-6 hover:shadow-lg transition-all duration-300 animate-fade-in-up cursor-pointer ${
                        update.requires_acknowledgment 
                          ? 'border-2 border-red-200 bg-red-50/50' 
                          : ''
                      }`}
                      style={{ animationDelay: `${800 + index * 100}ms` }}
                      onClick={() => openUpdateModal(update)}
                    >
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                          {getUpdateIcon(update.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`font-semibold brand-header ${
                              update.requires_acknowledgment ? 'text-red-800' : 'text-slate-900'
                            }`}>
                              {getText(update.title_en || update.title, update.title_es, update.title_tr)}
                            </h4>
                            {update.requires_acknowledgment && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium border border-red-200">
                                🚨 SIGNATURE REQUIRED
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 brand-subtitle mb-4 line-clamp-3">
                            {getText(update.message_en || update.message, update.message_es, update.message_tr)}
                          </p>
                          
                          {/* Photo thumbnail if exists */}
                          {update.photo_url && (
                            <div className="mb-4">
                              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                                <img 
                                  src={update.photo_url} 
                                  alt="Update photo" 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback to camera icon if image fails to load
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <Camera className="w-8 h-8 text-slate-400 hidden" />
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-sm text-slate-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>{formatDate(update.timestamp)}</span>
                              <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${getUpdatePriorityColor(update.priority)}`}>
                                {update.priority.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400">
                              {update.requires_acknowledgment ? 'Click to acknowledge' : 'Click to view details'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Pagination controls */}
                  {updatesPagination.totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-4 pt-4">
                      <button
                        onClick={() => goToPage(updatesPagination.page - 1)}
                        disabled={updatesPagination.page === 1}
                        className="flex items-center px-3 py-1 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Prev
                      </button>
                      
                      <span className="text-sm text-slate-600">
                        {updatesPagination.page} of {updatesPagination.totalPages}
                      </span>
                      
                      <button
                        onClick={() => goToPage(updatesPagination.page + 1)}
                        disabled={updatesPagination.page === updatesPagination.totalPages}
                        className="flex items-center px-3 py-1 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

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

      {/* Update Details Popup Modal */}
      {selectedUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl animate-scale-in">
            <div className="p-8">
              {/* Header with close button */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mr-4">
                    {getUpdateIcon(selectedUpdate.type)}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold brand-header ${
                      selectedUpdate.requires_acknowledgment ? 'text-red-800' : 'text-slate-900'
                    }`}>
                      {getText(selectedUpdate.title_en || selectedUpdate.title, selectedUpdate.title_es, selectedUpdate.title_tr)}
                    </h3>
                    <div className="flex items-center text-sm text-slate-500 mt-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(selectedUpdate.timestamp)}</span>
                      <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${getUpdatePriorityColor(selectedUpdate.priority)}`}>
                        {selectedUpdate.priority.toUpperCase()}
                      </span>
                      {selectedUpdate.requires_acknowledgment && (
                        <span className="ml-4 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium border border-red-200">
                          🚨 SIGNATURE REQUIRED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUpdate(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Photo display if exists */}
              {selectedUpdate.photo_url && (
                <div className="mb-6">
                  <img 
                    src={selectedUpdate.photo_url} 
                    alt="Update photo" 
                    className="w-full max-h-80 object-contain rounded-xl bg-slate-50 shadow-md"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Full message content */}
              <div className="prose prose-slate max-w-none mb-6">
                <p className="text-slate-700 brand-subtitle leading-relaxed whitespace-pre-wrap">
                  {getText(selectedUpdate.message_en || selectedUpdate.message, selectedUpdate.message_es, selectedUpdate.message_tr)}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <div className="flex items-center space-x-4">
                  {selectedUpdate.requires_acknowledgment ? (
                    <button className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium">
                      Sign & Acknowledge
                    </button>
                  ) : (
                    <span className="text-sm text-green-600 font-medium">✓ Marked as read</span>
                  )}
                </div>
                {!selectedUpdate.requires_acknowledgment && (
                  <button
                    onClick={() => markUpdateAsUnread(selectedUpdate.id)}
                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors underline"
                  >
                    Mark as unread
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}