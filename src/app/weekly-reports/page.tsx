'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Calendar, TrendingUp, Users, Award, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react'

interface WeeklyReport {
  id: string
  week_ending: string
  week_start: string
  formatted_week: string
  total_tasks_completed: number
  total_tasks_assigned: number
  completion_rate: number
  total_users_active: number
  top_performer_id: string
  top_performer_completions: number
  report_data: {
    week_summary: {
      top_performer_name: string
    }
  }
  generated_at: string
}

interface UserStat {
  user_id: string
  tasks_assigned: number
  tasks_completed: number
  completion_rate: number
  tasks_overdue: number
  user: {
    name: string
    email: string
  }
}

export default function WeeklyReports() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [userStats, setUserStats] = useState<UserStat[]>([])
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null)
  const [archiving, setArchiving] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [overwriteMode, setOverwriteMode] = useState(false)

  const checkAccess = async () => {
    if (!session?.user?.email) {
      router.push('/')
      return
    }

    try {
      const response = await fetch('/api/me')
      const userData = await response.json()
      
      if (userData.success && userData.user?.role !== 'manager') {
        router.push('/')
        return
      } else if (!userData.success) {
        router.push('/')
        return
      }
    } catch (error) {
      console.error('Error checking access:', error)
      router.push('/')
    }
  }

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/weekly-reports')
      const data = await response.json()
      
      if (data.reports) {
        setReports(data.reports)
        setUserStats(data.latest_user_stats || [])
        if (data.reports.length > 0) {
          setSelectedReport(data.reports[0])
        }
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const runArchive = async (forceOverwrite = false) => {
    setArchiving(true)
    try {
      const response = await fetch('/api/archive-week', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ overwrite: forceOverwrite })
      })
      const result = await response.json()
      
      if (result.already_archived && !forceOverwrite) {
        setOverwriteMode(true)
        setShowConfirmDialog(true)
        setArchiving(false)
        return
      }
      
      if (result.success) {
        alert(`Archive completed! ${result.tasks_archived} tasks archived for week ending ${result.week_ending}`)
        fetchReports() // Refresh data
        setShowConfirmDialog(false)
        setOverwriteMode(false)
      } else {
        alert(result.message || 'Archive process completed')
      }
    } catch (error) {
      console.error('Archive error:', error)
      alert('Failed to run archive process')
    } finally {
      setArchiving(false)
    }
  }

  const handleConfirmOverwrite = () => {
    setShowConfirmDialog(false)
    runArchive(true)
  }

  const handleCancelOverwrite = () => {
    setShowConfirmDialog(false)
    setOverwriteMode(false)
  }

  useEffect(() => {
    checkAccess()
  }, [session])

  useEffect(() => {
    if (session?.user?.email) {
      fetchReports()
    }
  }, [session])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading weekly reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50">
      <header className="glass border-b border-white/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="mr-6 p-3 text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black brand-header">
                  <span className="gradient-text">Weekly Reports</span>
                </h1>
                <p className="text-slate-600 brand-subtitle">Performance analytics and insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => runArchive()}
                disabled={archiving}
                className="flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-200 font-medium shadow-lg shadow-green-500/25"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${archiving ? 'animate-spin' : ''}`} />
                {archiving ? 'Archiving...' : 'Run Archive'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {reports.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 brand-header">No Weekly Reports Yet</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto brand-subtitle">Weekly reports are generated automatically every Monday morning.</p>
            <button
              onClick={() => runArchive()}
              disabled={archiving}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25"
            >
              {archiving ? 'Processing...' : 'Generate First Report'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Reports List */}
            <div className="lg:col-span-1 animate-fade-in-up">
              <h2 className="text-xl font-bold text-slate-900 mb-6 brand-header">Report History</h2>
              <div className="space-y-4">
                {reports.map((report, index) => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`p-6 rounded-2xl border cursor-pointer transition-all duration-200 animate-fade-in-up ${
                      selectedReport?.id === report.id
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-lg shadow-blue-500/20'
                        : 'bg-white/50 backdrop-blur-sm border-white/30 hover:bg-white/70 hover:shadow-lg'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 brand-header">{report.formatted_week}</h3>
                        <p className="text-sm text-slate-600 mt-2">
                          {report.total_tasks_completed} tasks completed
                        </p>
                        <p className="text-sm text-slate-600">
                          {report.completion_rate}% completion rate
                        </p>
                      </div>
                      <span className={`px-3 py-1.5 text-xs font-medium rounded-xl ${
                        report.completion_rate >= 80
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : report.completion_rate >= 60
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {report.completion_rate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Report Details */}
            <div className="lg:col-span-2">
              {selectedReport && (
                <div className="space-y-6">
                  {/* Report Header */}
                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Week of {selectedReport.formatted_week}
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {selectedReport.total_tasks_completed}
                        </div>
                        <div className="text-sm text-gray-600">Tasks Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {selectedReport.completion_rate}%
                        </div>
                        <div className="text-sm text-gray-600">Completion Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                          {selectedReport.total_users_active}
                        </div>
                        <div className="text-sm text-gray-600">Active Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">
                          {selectedReport.top_performer_completions}
                        </div>
                        <div className="text-sm text-gray-600">Top Performance</div>
                      </div>
                    </div>

                    {selectedReport.report_data?.week_summary?.top_performer_name && (
                      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <Award className="w-5 h-5 text-yellow-600 mr-2" />
                          <span className="font-medium text-yellow-800">
                            Top Performer: {selectedReport.report_data.week_summary.top_performer_name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Performance Table */}
                  {userStats.length > 0 && selectedReport === reports[0] && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                          <Users className="w-5 h-5 mr-2" />
                          Team Performance (Latest Week)
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Assigned
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Completed
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rate
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Overdue
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {userStats.map((stat) => (
                              <tr key={stat.user_id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {stat.user.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {stat.user.email}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {stat.tasks_assigned}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {stat.tasks_completed}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    stat.completion_rate >= 80
                                      ? 'bg-green-100 text-green-800'
                                      : stat.completion_rate >= 60
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {stat.completion_rate}%
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {stat.tasks_overdue}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Week Already Archived
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">
                This week has already been archived. Running the archive again will:
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• <strong>Delete</strong> the existing weekly report</li>
                  <li>• <strong>Remove</strong> all archived assignments from this week</li>
                  <li>• <strong>Reset</strong> all user statistics for this week</li>
                  <li>• <strong>Re-process</strong> all tasks from the previous Monday-Sunday</li>
                </ul>
              </div>
              <p className="text-sm text-red-600 mt-3 font-medium">
                ⚠️ This action cannot be undone!
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCancelOverwrite}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOverwrite}
                disabled={archiving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {archiving ? 'Processing...' : 'Yes, Overwrite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}