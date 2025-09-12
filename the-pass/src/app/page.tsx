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

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

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
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">The Pass</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {session.user.employee.name}
              </span>
              
              {/* Employee Navigation */}
              <button
                onClick={() => router.push('/my-tasks')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                My Tasks
              </button>
              
              {/* Manager Navigation */}
              {isManager && (
                <>
                  <button
                    onClick={() => router.push('/workflows')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                  >
                    Workflows
                  </button>
                  <button
                    onClick={() => router.push('/admin/users')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Users className="h-5 w-5" />
                  </button>
                </>
              )}
              
              <button
                onClick={() => router.push('/auth/signin')}
                className="text-gray-400 hover:text-gray-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
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

        </div>

        {/* Manager Dashboard Link */}
        {isManager && (
          <div className="mt-8">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-indigo-900 mb-2">
                Manager Dashboard
              </h3>
              <p className="text-sm text-indigo-700 mb-4">
                Manage employee accounts, roles, and permissions.
              </p>
              <button
                onClick={() => router.push('/admin/users')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Users className="h-4 w-4 mr-2" />
                Open Manager Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
