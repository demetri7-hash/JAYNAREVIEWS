'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { 
  CheckCircle, 
  Users, 
  Settings, 
  LogOut,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import WallFeed from '@/components/feed/WallFeed'
import ManagerDashboard from '@/components/manager/ManagerDashboard'
import { useTranslation } from '@/context/TranslationContext'
import TaskTransferSystem from '@/components/tasks/TaskTransferSystem'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    console.log('=== PAGE USEEFFECT DEBUG ===')
    console.log('Status:', status)
    console.log('Session:', session)
    console.log('Session user:', session?.user)
    console.log('Session user employee:', session?.user?.employee)
    console.log('Employee is_active:', session?.user?.employee?.is_active)
    console.log('=== END DEBUG ===')
    
    if (status === 'loading') return
    
    if (!session) {
      console.log('No session, redirecting to signin')
      router.push('/auth/signin')
      return
    }

    // Check if user account is activated
    if (session.user?.employee && !session.user.employee.is_active) {
      console.log('User has employee record but is not active')
      return // Show pending approval message
    }
    
    console.log('User is authenticated and active')
  }, [session, status, router])

  const startWorkflow = async (workflowType: string) => {
    if (!session?.user?.employee) return

    try {
      const response = await fetch('/api/worksheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          department: session.user.employee.department,
          shift_type: workflowType,
          checklist_id: 1 // Default checklist
        })
      })

      const data = await response.json()
      if (data.success) {
        router.push(`/workflows/${data.worksheet.id}`)
      } else {
        alert('Failed to start workflow: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to start workflow:', error)
      alert('Failed to start workflow')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to signin
  }

  if (!session.user?.employee?.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <Settings className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Account Pending Approval
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Your account has been created but needs to be activated by a manager before you can access the system.
          </p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  const isManager = ['manager', 'admin'].includes(session.user.employee.role)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Quick Actions */}
          <div className="space-y-6">
            {/* Start Morning Workflow */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Morning Shift
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Opening Checklist
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3">
                <button
                  onClick={() => startWorkflow('morning')}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start Morning Workflow
                </button>
              </div>
            </div>

            {/* Start Evening Workflow */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Evening Shift
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Closing Checklist
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3">
                <button
                  onClick={() => startWorkflow('evening')}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start Evening Workflow
                </button>
              </div>
            </div>

            {/* View Previous Workflows */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Settings className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        History
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Previous Workflows
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3">
                <button
                  onClick={() => alert('Workflow history coming soon!')}
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  View History
                </button>
              </div>
            </div>

            {/* Task Transfers */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Task Transfers
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Transfer & Manage Tasks
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending Requests:</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">3</span>
                </div>
                <button
                  onClick={() => router.push('/task-transfers')}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Manage Transfers
                </button>
              </div>
            </div>
          </div>

          {/* Center Column - Wall Feed */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🏠 Jayna Gyro Community</h2>
              <p className="text-gray-600">Stay connected with your team updates, announcements, and achievements</p>
            </div>
            <WallFeed feedType="all" maxPosts={10} showCreatePost={true} />
          </div>
        </div>

        {/* Manager Dashboard */}
        {isManager && (
          <div className="mt-8">
            <ManagerDashboard />
          </div>
        )}
      </div>
    </div>
  )
}
