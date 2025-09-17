'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Plus, Users, Shield, RefreshCw, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { UserRole, isManagerRole, ROLE_LABELS } from '../types'
import { useLanguage, staticTranslations } from '@/contexts/LanguageContext'
import { LanguageToggleCompact } from '@/components/LanguageToggle'

interface UserProfile {
  email: string;
  name: string;
  role: UserRole;
  department_permissions?: string[];
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { getText } = useLanguage()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [pendingTransfers, setPendingTransfers] = useState(0)

  // Fetch user profile and role
  useEffect(() => {
    if (session?.user?.email) {
      console.log('Fetching profile for:', session.user.email)
      fetch('/api/me')
        .then(res => res.json())
        .then(data => {
          console.log('Profile API response:', data)
          if (data.success) {
            console.log('Setting user profile:', data.user)
            setUserProfile(data.user)
          } else {
            console.log('API response does not have success=true')
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

  // Fetch pending transfer count
  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/pending-transfers')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPendingTransfers(data.transfers?.length || 0)
          }
        })
        .catch(error => {
          console.error('Error fetching pending transfers:', error)
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
          <div className="absolute top-4 right-4">
            <LanguageToggleCompact />
          </div>
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {getText(staticTranslations.appTitle.en, staticTranslations.appTitle.es, staticTranslations.appTitle.tr)}
          </h1>
          <p className="text-gray-600 mb-8">
            {getText(staticTranslations.appDescription.en, staticTranslations.appDescription.es, staticTranslations.appDescription.tr)}
          </p>
          
          <button 
            onClick={() => signIn('google')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {getText(staticTranslations.signInWithGoogle.en, staticTranslations.signInWithGoogle.es, staticTranslations.signInWithGoogle.tr)}
          </button>
          
          <p className="text-sm text-gray-500 mt-4">
            {getText(staticTranslations.secureLogin.en, staticTranslations.secureLogin.es, staticTranslations.secureLogin.tr)}
          </p>
          
          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide font-sans">
              APP CONCEPT AND DEVELOPMENT BY DEMETRI GREGORAKIS
            </p>
          </div>
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
              <h1 className="text-xl font-semibold text-gray-900">
                {getText(staticTranslations.taskManagement.en, staticTranslations.taskManagement.es, staticTranslations.taskManagement.tr)}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageToggleCompact />
              <div className="flex items-center space-x-2">
                {userProfile?.role && isManagerRole(userProfile.role) && (
                  <div className="flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                    <Shield className="w-3 h-3" />
                    <span>{ROLE_LABELS[userProfile.role]}</span>
                  </div>
                )}
                <span className="text-sm text-gray-700">Welcome back, {session.user?.name}!</span>
              </div>
              <button 
                onClick={() => signOut()}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-200"
              >
                {getText(staticTranslations.signOut.en, staticTranslations.signOut.es, staticTranslations.signOut.tr)}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {getText(staticTranslations.myTasks.en, staticTranslations.myTasks.es, staticTranslations.myTasks.tr)}
              </h2>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-gray-600 mb-4">
              {getText(staticTranslations.viewCompleteAssignedTasks.en, staticTranslations.viewCompleteAssignedTasks.es, staticTranslations.viewCompleteAssignedTasks.tr)}
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {getText(staticTranslations.pendingTasks.en, staticTranslations.pendingTasks.es, staticTranslations.pendingTasks.tr)}
                </span>
                <span className="font-medium text-orange-600">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {getText(staticTranslations.completedToday.en, staticTranslations.completedToday.es, staticTranslations.completedToday.tr)}
                </span>
                <span className="font-medium text-green-600">5</span>
              </div>
            </div>
            <button 
              onClick={() => router.push('/my-tasks')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              {getText(staticTranslations.viewMyTasks.en, staticTranslations.viewMyTasks.es, staticTranslations.viewMyTasks.tr)}
            </button>
          </div>

          {/* Create Task - Only for Managers */}
          {(() => {
            console.log('Checking manager role. userProfile:', userProfile, 'role:', userProfile?.role)
            return userProfile?.role && isManagerRole(userProfile.role)
          })() && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {getText(staticTranslations.createTask.en, staticTranslations.createTask.es, staticTranslations.createTask.tr)}
                </h2>
                <Plus className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-gray-600 mb-4">
                {getText(staticTranslations.createNewTasksAssign.en, staticTranslations.createNewTasksAssign.es, staticTranslations.createNewTasksAssign.tr)}
              </p>
              <button 
                onClick={() => router.push('/create-task')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                {getText(staticTranslations.createNewTask.en, staticTranslations.createNewTask.es, staticTranslations.createNewTask.tr)}
              </button>
            </div>
          )}

          {/* Manager Dashboard - Only for Managers */}
          {userProfile?.role && isManagerRole(userProfile.role) && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {getText(staticTranslations.managerDashboard.en, staticTranslations.managerDashboard.es, staticTranslations.managerDashboard.tr)}
                </h2>
                <Shield className="w-6 h-6 text-indigo-500" />
              </div>
              <p className="text-gray-600 mb-4">
                {userProfile.role === 'manager' 
                  ? getText(staticTranslations.comprehensiveTaskManagement.en, staticTranslations.comprehensiveTaskManagement.es, staticTranslations.comprehensiveTaskManagement.tr)
                  : `Department-specific task management for ${ROLE_LABELS[userProfile.role]}`
                }
              </p>
              <button 
                onClick={() => router.push('/manager-dashboard')}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
              >
                {getText(staticTranslations.openManagerDashboard.en, staticTranslations.openManagerDashboard.es, staticTranslations.openManagerDashboard.tr)}
              </button>
            </div>
          )}

          {/* User Management - Only for Managers */}
          {userProfile?.role === 'manager' && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {getText(staticTranslations.userManagement.en, staticTranslations.userManagement.es, staticTranslations.userManagement.tr)}
                </h2>
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-gray-600 mb-4">
                {getText(staticTranslations.manageStaffAccess.en, staticTranslations.manageStaffAccess.es, staticTranslations.manageStaffAccess.tr)}
              </p>
              <button 
                onClick={() => router.push('/user-management')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                {getText(staticTranslations.userManagement.en, staticTranslations.userManagement.es, staticTranslations.userManagement.tr)}
              </button>
            </div>
          )}

          {/* Team Activity - Only for Managers */}
          {userProfile?.role && isManagerRole(userProfile.role) && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {getText(staticTranslations.teamActivity.en, staticTranslations.teamActivity.es, staticTranslations.teamActivity.tr)}
                </h2>
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-gray-600 mb-4">
                {getText(staticTranslations.teamPerformanceInsights.en, staticTranslations.teamPerformanceInsights.es, staticTranslations.teamPerformanceInsights.tr)}
              </p>
              <button 
                onClick={() => router.push('/team-activity')}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
              >
                {getText(staticTranslations.viewTeamActivity.en, staticTranslations.viewTeamActivity.es, staticTranslations.viewTeamActivity.tr)}
              </button>
            </div>
          )}

          {/* Weekly Reports - Only for Managers */}
          {userProfile?.role && isManagerRole(userProfile.role) && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {getText(staticTranslations.weeklyReports.en, staticTranslations.weeklyReports.es, staticTranslations.weeklyReports.tr)}
                </h2>
                <Calendar className="w-6 h-6 text-indigo-500" />
              </div>
              <p className="text-gray-600 mb-4">
                {getText(staticTranslations.viewArchivedWeeklyReports.en, staticTranslations.viewArchivedWeeklyReports.es, staticTranslations.viewArchivedWeeklyReports.tr)}
              </p>
              <button 
                onClick={() => router.push('/weekly-reports')}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
              >
                {getText(staticTranslations.viewWeeklyReports.en, staticTranslations.viewWeeklyReports.es, staticTranslations.viewWeeklyReports.tr)}
              </button>
            </div>
          )}

          {/* Pending Transfers - For all users */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {getText(staticTranslations.transferRequests.en, staticTranslations.transferRequests.es, staticTranslations.transferRequests.tr)}
              </h2>
              <div className="flex items-center">
                <RefreshCw className="w-6 h-6 text-orange-500" />
                {pendingTransfers > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingTransfers}
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              {userProfile?.role && isManagerRole(userProfile.role)
                ? getText(staticTranslations.reviewApproveTransfers.en, staticTranslations.reviewApproveTransfers.es, staticTranslations.reviewApproveTransfers.tr)
                : getText(staticTranslations.viewTransferRequestsAssigned.en, staticTranslations.viewTransferRequestsAssigned.es, staticTranslations.viewTransferRequestsAssigned.tr)
              }
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {getText(staticTranslations.pendingApproval.en, staticTranslations.pendingApproval.es, staticTranslations.pendingApproval.tr)}
                </span>
                <span className="font-medium text-orange-600">{pendingTransfers}</span>
              </div>
            </div>
            <button 
              onClick={() => router.push('/pending-transfers')}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
            >
              {getText(staticTranslations.viewTransferRequests.en, staticTranslations.viewTransferRequests.es, staticTranslations.viewTransferRequests.tr)}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
