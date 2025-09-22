'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Download, Calendar, TrendingUp, Users, CheckSquare, Clock } from 'lucide-react'

interface WeeklyReport {
  id: string
  week_start: string
  week_end: string
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  completion_rate: number
  department_stats: {
    department: string
    total: number
    completed: number
    rate: number
  }[]
  user_stats: {
    user_id: string
    user_name: string
    total: number
    completed: number
    rate: number
  }[]
  created_at: string
}

export default function WeeklyReportsTab() {
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null)
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/weekly-reports')
      if (!response.ok) throw new Error('Failed to fetch reports')
      
      const data = await response.json()
      setReports(data.reports || [])
    } catch (err) {
      setError('Failed to load weekly reports')
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    try {
      const params = new URLSearchParams()
      if (dateRange.start) params.append('start_date', dateRange.start)
      if (dateRange.end) params.append('end_date', dateRange.end)

      const response = await fetch(`/api/weekly-reports/generate?${params}`, {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to generate report')

      fetchReports()
    } catch (err) {
      setError('Failed to generate report')
      console.error('Error generating report:', err)
    }
  }

  const downloadReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/weekly-reports/${reportId}/download`)
      if (!response.ok) throw new Error('Failed to download report')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `weekly-report-${reportId}.pdf`
      a.click()
    } catch (err) {
      setError('Failed to download report')
      console.error('Error downloading report:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Weekly Reports</h2>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={generateReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            Generate Report
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Reports List */}
      <div className="grid gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Week of {new Date(report.week_start).toLocaleDateString()} - {new Date(report.week_end).toLocaleDateString()}
                </h3>
                <p className="text-sm text-slate-600">Generated: {new Date(report.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                  className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  {selectedReport?.id === report.id ? 'Hide Details' : 'View Details'}
                </button>
                <button
                  onClick={() => downloadReport(report.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">Total Tasks</span>
                </div>
                <span className="text-2xl font-bold text-blue-900">{report.total_tasks}</span>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-700">Completed</span>
                </div>
                <span className="text-2xl font-bold text-green-900">{report.completed_tasks}</span>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700">Pending</span>
                </div>
                <span className="text-2xl font-bold text-yellow-900">{report.pending_tasks}</span>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-purple-700">Completion Rate</span>
                </div>
                <span className="text-2xl font-bold text-purple-900">{report.completion_rate.toFixed(1)}%</span>
              </div>
            </div>

            {/* Detailed View */}
            {selectedReport?.id === report.id && (
              <div className="border-t border-slate-200 pt-6 space-y-6">
                {/* Department Stats */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">Department Performance</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Department</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Total Tasks</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Completed</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {report.department_stats.map((dept, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 font-medium">{dept.department}</td>
                            <td className="px-4 py-2">{dept.total}</td>
                            <td className="px-4 py-2">{dept.completed}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                dept.rate >= 80 ? 'bg-green-100 text-green-800' :
                                dept.rate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {dept.rate.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* User Stats */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">Top Performers</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Employee</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Total Tasks</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Completed</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {report.user_stats
                          .sort((a, b) => b.rate - a.rate)
                          .slice(0, 10)
                          .map((user, index) => (
                          <tr key={user.user_id}>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                  index === 1 ? 'bg-gray-100 text-gray-800' :
                                  index === 2 ? 'bg-orange-100 text-orange-800' :
                                  'bg-slate-100 text-slate-800'
                                }`}>
                                  {index + 1}
                                </span>
                                <span className="font-medium">{user.user_name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2">{user.total}</td>
                            <td className="px-4 py-2">{user.completed}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.rate >= 80 ? 'bg-green-100 text-green-800' :
                                user.rate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {user.rate.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
            <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Reports Generated</h3>
            <p className="text-slate-600">Generate your first weekly report to see team performance metrics.</p>
          </div>
        )}
      </div>
    </div>
  )
}