'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Plus, Users, Shield, RefreshCw, Calendar, Menu, X, Sparkles, ArrowRight } from 'lucide-react'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-ocean-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-pulse-subtle w-24 h-24 bg-gradient-to-r from-ocean-400 to-deep-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white animate-float" />
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-ocean-400 to-deep-500 rounded-full mx-auto opacity-20 animate-ping"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-48 mx-auto animate-pulse"></div>
            <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-32 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen hero-bg flex items-center justify-center p-4 relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-ocean-400/10 rounded-full animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-deep-400/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gold-400/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 max-w-md w-full">
          <div className="absolute top-4 right-4">
            <LanguageToggleCompact />
          </div>
          
          {/* Main Card */}
          <div className="glass rounded-3xl p-8 text-center card-hover animate-fade-in-scale">
            {/* Logo & Icon */}
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-ocean-500 to-deep-600 rounded-2xl flex items-center justify-center mx-auto shadow-ocean animate-float">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-gold-500 animate-pulse-subtle" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black mb-3 brand-title">
              <span className="gradient-text">
                {getText(staticTranslations.appTitle.en, staticTranslations.appTitle.es, staticTranslations.appTitle.tr)}
              </span>
            </h1>
            
            {/* Subtitle */}
            <h2 className="text-xl md:text-2xl font-semibold text-slate-700 mb-8 brand-subtitle">
              {getText(staticTranslations.appDescription.en, staticTranslations.appDescription.es, staticTranslations.appDescription.tr)}
            </h2>
            
            {/* Sign In Button */}
            <button 
              onClick={() => signIn('google')}
              className="group w-full bg-gradient-to-r from-ocean-500 to-deep-600 text-white py-4 px-6 rounded-xl hover:from-ocean-600 hover:to-deep-700 transition-all duration-300 font-medium text-lg btn-ripple transform hover:scale-[1.02] active:scale-[0.98] shadow-ocean hover:shadow-xl"
            >
              <span className="flex items-center justify-center">
                {getText(staticTranslations.signInWithGoogle.en, staticTranslations.signInWithGoogle.es, staticTranslations.signInWithGoogle.tr)}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            {/* Security Note */}
            <p className="text-sm text-slate-500 mt-6 flex items-center justify-center">
              <Shield className="w-4 h-4 mr-2 text-green-500" />
              {getText(staticTranslations.secureLogin.en, staticTranslations.secureLogin.es, staticTranslations.secureLogin.tr)}
            </p>
          </div>

          {/* Credit */}
          <div className="mt-8 text-center">
            <div className="glass rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                APP CONCEPT AND DEVELOPMENT BY DEMETRI GREGORAKIS
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50">
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-ocean-500 to-deep-600 rounded-xl flex items-center justify-center mr-3 shadow-sm">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black gradient-text hidden sm:block brand-header">
                {getText(staticTranslations.taskManagement.en, staticTranslations.taskManagement.es, staticTranslations.taskManagement.tr)}
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <LanguageToggleCompact />
              
              {/* User Info */}
              <div className="flex items-center space-x-3">
                {userProfile?.role && isManagerRole(userProfile.role) && (
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    <span>{ROLE_LABELS[userProfile.role]}</span>
                  </div>
                )}
                <div className="text-sm text-slate-700 font-medium">
                  Welcome back, <span className="font-semibold">{session.user?.name}</span>!
                </div>
              </div>
              
              {/* Sign Out */}
              <button 
                onClick={() => signOut()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-sm"
              >
                {getText(staticTranslations.signOut.en, staticTranslations.signOut.es, staticTranslations.signOut.tr)}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/20 animate-fade-in-up">
              <div className="space-y-3">
                <LanguageToggleCompact />
                {userProfile?.role && isManagerRole(userProfile.role) && (
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 py-2 rounded-xl text-sm font-medium w-fit">
                    <Shield className="w-4 h-4" />
                    <span>{ROLE_LABELS[userProfile.role]}</span>
                  </div>
                )}
                <div className="text-sm text-slate-700 font-medium">
                  Welcome back, <span className="font-semibold">{session.user?.name}</span>!
                </div>
                <button 
                  onClick={() => signOut()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left"
                >
                  {getText(staticTranslations.signOut.en, staticTranslations.signOut.es, staticTranslations.signOut.tr)}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Your Restaurant Command Center</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Streamline operations, manage tasks, and keep your team synchronized across all departments.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* My Tasks Card */}
          <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-xl hover:bg-white/90 transition-all duration-300 card-hover animate-fade-in-scale">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">8</div>
                <div className="text-sm text-slate-500">Total Tasks</div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              {getText(staticTranslations.myTasks.en, staticTranslations.myTasks.es, staticTranslations.myTasks.tr)}
            </h3>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
              {getText(staticTranslations.viewCompleteAssignedTasks.en, staticTranslations.viewCompleteAssignedTasks.es, staticTranslations.viewCompleteAssignedTasks.tr)}
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">
                  {getText(staticTranslations.pendingTasks.en, staticTranslations.pendingTasks.es, staticTranslations.pendingTasks.tr)}
                </span>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">
                  {getText(staticTranslations.completedToday.en, staticTranslations.completedToday.es, staticTranslations.completedToday.tr)}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">5</span>
              </div>
            </div>
            
            <button 
              onClick={() => router.push('/my-tasks')}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium group btn-ripple"
            >
              <span className="flex items-center justify-center">
                {getText(staticTranslations.viewMyTasks.en, staticTranslations.viewMyTasks.es, staticTranslations.viewMyTasks.tr)}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>

          {/* Create Task - Only for Managers */}
          {(() => {
            console.log('Checking manager role. userProfile:', userProfile, 'role:', userProfile?.role)
            return userProfile?.role && isManagerRole(userProfile.role)
          })() && (
            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-xl hover:bg-white/90 transition-all duration-300 card-hover animate-fade-in-scale" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">+</div>
                  <div className="text-sm text-slate-500">New Task</div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {getText(staticTranslations.createTask.en, staticTranslations.createTask.es, staticTranslations.createTask.tr)}
              </h3>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                {getText(staticTranslations.createNewTasksAssign.en, staticTranslations.createNewTasksAssign.es, staticTranslations.createNewTasksAssign.tr)}
              </p>
              
              <button 
                onClick={() => router.push('/create-task')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium group btn-ripple"
              >
                <span className="flex items-center justify-center">
                  {getText(staticTranslations.createNewTask.en, staticTranslations.createNewTask.es, staticTranslations.createNewTask.tr)}
                  <Plus className="w-4 h-4 ml-2 group-hover:rotate-90 transition-transform" />
                </span>
              </button>
            </div>
          )}

          {/* Manager Dashboard - Only for Managers */}
          {userProfile?.role && isManagerRole(userProfile.role) && (
            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-xl hover:bg-white/90 transition-all duration-300 card-hover animate-fade-in-scale" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">⚡</div>
                  <div className="text-sm text-slate-500">Dashboard</div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {getText(staticTranslations.managerDashboard.en, staticTranslations.managerDashboard.es, staticTranslations.managerDashboard.tr)}
              </h3>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                {userProfile.role === 'manager' 
                  ? getText(staticTranslations.comprehensiveTaskManagement.en, staticTranslations.comprehensiveTaskManagement.es, staticTranslations.comprehensiveTaskManagement.tr)
                  : `Department-specific task management for ${ROLE_LABELS[userProfile.role]}`
                }
              </p>
              
              <button 
                onClick={() => router.push('/manager-dashboard')}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 font-medium group btn-ripple"
              >
                <span className="flex items-center justify-center">
                  {getText(staticTranslations.openManagerDashboard.en, staticTranslations.openManagerDashboard.es, staticTranslations.openManagerDashboard.tr)}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          )}

          {/* User Management - Only for Managers */}
          {userProfile?.role === 'manager' && (
            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-xl hover:bg-white/90 transition-all duration-300 card-hover animate-fade-in-scale" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">👥</div>
                  <div className="text-sm text-slate-500">Staff</div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {getText(staticTranslations.userManagement.en, staticTranslations.userManagement.es, staticTranslations.userManagement.tr)}
              </h3>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                {getText(staticTranslations.manageStaffAccess.en, staticTranslations.manageStaffAccess.es, staticTranslations.manageStaffAccess.tr)}
              </p>
              
              <button 
                onClick={() => router.push('/user-management')}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium group btn-ripple"
              >
                <span className="flex items-center justify-center">
                  {getText(staticTranslations.userManagement.en, staticTranslations.userManagement.es, staticTranslations.userManagement.tr)}
                  <Users className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                </span>
              </button>
            </div>
          )}

          {/* Team Activity - Only for Managers */}
          {userProfile?.role && isManagerRole(userProfile.role) && (
            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-xl hover:bg-white/90 transition-all duration-300 card-hover animate-fade-in-scale" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">📊</div>
                  <div className="text-sm text-slate-500">Activity</div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {getText(staticTranslations.teamActivity.en, staticTranslations.teamActivity.es, staticTranslations.teamActivity.tr)}
              </h3>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                {getText(staticTranslations.teamPerformanceInsights.en, staticTranslations.teamPerformanceInsights.es, staticTranslations.teamPerformanceInsights.tr)}
              </p>
              
              <button 
                onClick={() => router.push('/team-activity')}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium group btn-ripple"
              >
                <span className="flex items-center justify-center">
                  {getText(staticTranslations.viewTeamActivity.en, staticTranslations.viewTeamActivity.es, staticTranslations.viewTeamActivity.tr)}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          )}

          {/* Weekly Reports - Only for Managers */}
          {userProfile?.role && isManagerRole(userProfile.role) && (
            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-xl hover:bg-white/90 transition-all duration-300 card-hover animate-fade-in-scale" style={{ animationDelay: '500ms' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">📅</div>
                  <div className="text-sm text-slate-500">Reports</div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {getText(staticTranslations.weeklyReports.en, staticTranslations.weeklyReports.es, staticTranslations.weeklyReports.tr)}
              </h3>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                {getText(staticTranslations.viewArchivedWeeklyReports.en, staticTranslations.viewArchivedWeeklyReports.es, staticTranslations.viewArchivedWeeklyReports.tr)}
              </p>
              
              <button 
                onClick={() => router.push('/weekly-reports')}
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white py-3 px-4 rounded-xl hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 font-medium group btn-ripple"
              >
                <span className="flex items-center justify-center">
                  {getText(staticTranslations.viewWeeklyReports.en, staticTranslations.viewWeeklyReports.es, staticTranslations.viewWeeklyReports.tr)}
                  <Calendar className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
                </span>
              </button>
            </div>
          )}

          {/* Pending Transfers - For all users */}
          <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-xl hover:bg-white/90 transition-all duration-300 card-hover animate-fade-in-scale" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform relative">
                <RefreshCw className="w-6 h-6 text-white" />
                {pendingTransfers > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse-subtle">
                    {pendingTransfers}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">{pendingTransfers}</div>
                <div className="text-sm text-slate-500">Pending</div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              {getText(staticTranslations.transferRequests.en, staticTranslations.transferRequests.es, staticTranslations.transferRequests.tr)}
            </h3>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
              {userProfile?.role && isManagerRole(userProfile.role)
                ? getText(staticTranslations.reviewApproveTransfers.en, staticTranslations.reviewApproveTransfers.es, staticTranslations.reviewApproveTransfers.tr)
                : getText(staticTranslations.viewTransferRequestsAssigned.en, staticTranslations.viewTransferRequestsAssigned.es, staticTranslations.viewTransferRequestsAssigned.tr)
              }
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">
                  {getText(staticTranslations.pendingApproval.en, staticTranslations.pendingApproval.es, staticTranslations.pendingApproval.tr)}
                </span>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">{pendingTransfers}</span>
              </div>
            </div>
            
            <button 
              onClick={() => router.push('/pending-transfers')}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium group btn-ripple"
            >
              <span className="flex items-center justify-center">
                {getText(staticTranslations.viewTransferRequests.en, staticTranslations.viewTransferRequests.es, staticTranslations.viewTransferRequests.tr)}
                <RefreshCw className="w-4 h-4 ml-2 group-hover:rotate-180 transition-transform" />
              </span>
            </button>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <div className="glass rounded-3xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              <span className="gradient-text">Keep Your Team in Sync</span>
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Efficient task management leads to better service, happier customers, and a smoother operation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/my-tasks')}
                className="bg-gradient-to-r from-ocean-500 to-deep-600 text-white py-3 px-6 rounded-xl hover:from-ocean-600 hover:to-deep-700 transition-all duration-200 font-medium btn-ripple"
              >
                View My Tasks
              </button>
              {userProfile?.role && isManagerRole(userProfile.role) && (
                <button 
                  onClick={() => router.push('/create-task')}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium btn-ripple"
                >
                  Create New Task
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
