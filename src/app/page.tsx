'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Plus, Users, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'

interface UserProfile {
  email: string;
  name: string;
  role: 'staff' | 'manager';
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // Fetch user profile and role
  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/me')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUserProfile(data.user)
          }
        })
        .catch(error => {
          console.error('Error fetching user profile:', error)
        })
        .finally(() => {
          setProfileLoading(false)
        })
    }
  }, [session])

  if (status === 'loading' || (session && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Jayna Gyro Task Manager</h1>
          <p className="text-gray-600 mb-8">Simple task management for restaurant staff</p>
          
          <button 
            onClick={() => signIn('google')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign in with Google
          </button>
          
          <p className="text-sm text-gray-500 mt-4">
            Secure login for restaurant staff only
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Task Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {userProfile?.role === 'manager' && (
                  <div className="flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                    <Shield className="w-3 h-3" />
                    <span>Manager</span>
                  </div>
                )}
                <span className="text-sm text-gray-700">Welcome back, {session.user?.name}!</span>
              </div>
              <button 
                onClick={() => signOut()}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">My Tasks</h2>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-gray-600 mb-4">View and complete your assigned tasks</p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending</span>
                <span className="font-medium text-orange-600">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed today</span>
                <span className="font-medium text-green-600">5</span>
              </div>
            </div>
            <button 
              onClick={() => router.push('/my-tasks')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              View My Tasks
            </button>
          </div>

          {/* Create Task - Only for Managers */}
          {userProfile?.role === 'manager' && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Create Task</h2>
                <Plus className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-gray-600 mb-4">Create new tasks and assign to staff</p>
              <button 
                onClick={() => router.push('/create-task')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Create New Task
              </button>
            </div>
          )}

          {/* Team Activity - Only for Managers */}
          {userProfile?.role === 'manager' && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Team Activity</h2>
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-gray-600 mb-4">Recent completions and updates</p>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
                View All Activity
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
