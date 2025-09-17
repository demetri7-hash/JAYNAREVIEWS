'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useLanguage, staticTranslations } from '@/contexts/LanguageContext'
import Link from 'next/link'
import { ArrowLeftIcon, UserIcon, ArchiveBoxIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface UserProfile {
  id: string
  email: string
  name: string
  role: 'manager' | 'employee'
  archived: boolean
  created_at: string
}

export default function UserManagementPage() {
  const { data: session, status } = useSession()
  const { language } = useLanguage()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  const t = (key: string) => {
    const translations = staticTranslations as Record<string, Record<string, string>>
    return translations[key]?.[language] || key
  }

  useEffect(() => {
    fetchUsers()
  }, [showArchived])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/users?archived=${showArchived}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserArchiveStatus = async (userId: string, currentArchived: boolean) => {
    setActionLoading(userId)
    try {
      const response = await fetch('/api/users/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          archived: !currentArchived
        }),
      })

      if (response.ok) {
        await fetchUsers() // Refresh the list
      } else {
        alert(t('errorUpdatingUser'))
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert(t('errorUpdatingUser'))
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = users.filter(user => user.archived === showArchived)

  // Only allow managers to access this page
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">{t('loadingProfile')}</p>
        </div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'manager') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserIcon className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3 brand-header">{t('accessDenied')}</h1>
          <p className="text-slate-600 mb-6 brand-subtitle">{t('managerAccessRequired')}</p>
          <Link 
            href="/"
            className="inline-flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            {t('backToHome')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href="/"
                className="mr-6 p-3 text-slate-400 hover:text-slate-600 bg-white/70 hover:bg-white/90 backdrop-blur-sm rounded-xl border border-white/50 transition-all duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-4xl font-black brand-header">
                  <span className="gradient-text">{t('userManagement')}</span>
                </h1>
                <p className="text-slate-600 mt-2 brand-subtitle">{t('manageStaffAccess')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
            <nav className="flex gap-2">
              <button
                onClick={() => setShowArchived(false)}
                className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 ${
                  !showArchived
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {t('activeUsers')} ({users.filter(u => !u.archived).length})
              </button>
              <button
                onClick={() => setShowArchived(true)}
                className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 ${
                  showArchived
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {t('archivedUsers')} ({users.filter(u => u.archived).length})
              </button>
            </nav>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">{t('loadingUsers')}</p>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-white/20 overflow-hidden animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="divide-y divide-white/10">
              {filteredUsers.map((user, index) => (
                <div key={user.id} className="p-6 hover:bg-white/30 transition-all duration-200 animate-fade-in-up" style={{ animationDelay: `${500 + index * 100}ms` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                        user.role === 'manager' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                      }`}>
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-lg font-bold text-slate-900 brand-header">{user.name}</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium ${
                            user.role === 'manager' 
                              ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {t(user.role)}
                          </span>
                          {user.archived && (
                            <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {t('archived')}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 font-medium mb-1">{user.email}</p>
                        <p className="text-xs text-slate-500">
                          {t('joinedOn')} {new Date(user.created_at).toLocaleDateString(language === 'es' ? 'es-ES' : language === 'tr' ? 'tr-TR' : 'en-US')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Don't allow archiving yourself */}
                      {user.email !== session.user?.email && (
                        <button
                          onClick={() => toggleUserArchiveStatus(user.id, user.archived)}
                          disabled={actionLoading === user.id}
                          className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg ${
                            user.archived
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25 hover:from-green-600 hover:to-green-700 hover:-translate-y-0.5'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700 hover:-translate-y-0.5'
                          } ${actionLoading === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {actionLoading === user.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : user.archived ? (
                            <>
                              <CheckCircleIcon className="w-4 h-4 mr-2" />
                              {t('reactivate')}
                            </>
                          ) : (
                            <>
                              <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                              {t('archive')}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <UserIcon className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 brand-subtitle">
                  {showArchived ? t('noArchivedUsers') : t('noActiveUsers')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}