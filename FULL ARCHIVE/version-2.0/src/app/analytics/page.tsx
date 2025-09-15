'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    // Check if user has manager/admin role
    const userRole = (session.user as any)?.role || (session.user as any)?.employee?.role
    if (!['manager', 'admin'].includes(userRole)) {
      router.push('/')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Performance metrics and business insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Workflow Completion</h3>
            <div className="text-3xl font-bold text-blue-600">85%</div>
            <p className="text-gray-600">Average completion rate</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Employee Performance</h3>
            <div className="text-3xl font-bold text-green-600">4.2</div>
            <p className="text-gray-600">Average review score</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Task Efficiency</h3>
            <div className="text-3xl font-bold text-purple-600">92%</div>
            <p className="text-gray-600">Tasks completed on time</p>
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Advanced Analytics Coming Soon
          </h3>
          <p className="text-gray-600 mb-4">
            Comprehensive analytics features are being developed:
          </p>
          <ul className="text-gray-600 space-y-2">
            <li>• Real-time performance dashboards</li>
            <li>• Trend analysis and forecasting</li>
            <li>• Employee productivity reports</li>
            <li>• Custom report generation</li>
            <li>• Data export capabilities</li>
          </ul>
        </div>
      </div>
    </div>
  )
}