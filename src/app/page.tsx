'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { Users, CheckCircle, Clock, AlertTriangle, TrendingUp, Activity } from 'lucide-react'
import Navigation from '@/components/Navigation'

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [teamStats, setTeamStats] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return // Still loading session

    if (status === 'unauthenticated') {
      // Redirect to NextAuth's default sign-in page
      signIn('google', { callbackUrl: window.location.origin })
      return
    }

    if (session?.user?.email) {
      fetchTeamActivity()
    }
  }, [session, status])

  const fetchTeamActivity = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/team-activity')
      
      if (response.ok) {
        const data = await response.json()
        setTeamStats(data.stats)
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navigation currentPage="home" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 md:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass rounded-3xl p-8 mb-8 animate-fade-in-up">
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg shadow-purple-500/25">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text brand-title mb-2">Team Dashboard</h1>
                <p className="text-slate-600 brand-subtitle text-lg">THE PASS Team Performance Overview</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="text-red-700 font-medium">{error}</div>
                </div>
              </div>
            )}

            {teamStats && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Tasks</p>
                      <p className="text-2xl font-bold text-slate-900">{teamStats.totalTasks}</p>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-600">Completed Today</p>
                      <p className="text-2xl font-bold text-slate-900">{teamStats.completedToday}</p>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gold-600">Pending</p>
                      <p className="text-2xl font-bold text-slate-900">{teamStats.pendingTasks}</p>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-600">Overdue</p>
                      <p className="text-2xl font-bold text-slate-900">{teamStats.overdueTasks}</p>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-600">Team Members</p>
                      <p className="text-2xl font-bold text-slate-900">{teamStats.totalUsers}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center py-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Welcome to THE PASS</h2>
              <p className="text-slate-600 mb-6">Your team activity dashboard is ready. Navigate using the sidebar to access all features.</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => router.push('/my-tasks')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all font-medium"
                >
                  View My Tasks
                </button>
                <button
                  onClick={() => router.push('/workflows')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium"
                >
                  Browse Workflows
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
