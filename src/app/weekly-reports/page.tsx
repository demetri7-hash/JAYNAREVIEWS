'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Calendar, TrendingUp, Users, Award, ArrowLeft, RefreshCw } from 'lucide-react'

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

  const runArchive = async () => {
    setArchiving(true)
    try {
      const response = await fetch('/api/archive-week', {
        method: 'POST'
      })
      const result = await response.json()
      
      if (result.success) {
        alert(`Archive completed! ${result.tasks_archived} tasks archived for week ending ${result.week_ending}`)
        fetchReports() // Refresh data
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Calendar className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Weekly Reports</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={runArchive}
                disabled={archiving}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${archiving ? 'animate-spin' : ''}`} />
                {archiving ? 'Archiving...' : 'Run Archive'}
              </button>
              <span className="text-sm text-gray-700">Manager Dashboard</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {reports.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Weekly Reports Yet</h3>
            <p className="text-gray-600 mb-4">Weekly reports are generated automatically every Monday morning.</p>
            <button
              onClick={runArchive}
              disabled={archiving}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {archiving ? 'Processing...' : 'Generate First Report'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Reports List */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Report History</h2>
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedReport?.id === report.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{report.formatted_week}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {report.total_tasks_completed} tasks completed
                        </p>
                        <p className="text-sm text-gray-600">
                          {report.completion_rate}% completion rate
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.completion_rate >= 80
                          ? 'bg-green-100 text-green-800'
                          : report.completion_rate >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
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
    </div>
  )
}