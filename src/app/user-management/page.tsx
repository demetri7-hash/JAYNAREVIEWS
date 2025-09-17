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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loadingProfile')}</p>
        </div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'manager') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('accessDenied')}</h1>
          <p className="text-gray-600 mb-4">{t('managerAccessRequired')}</p>
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            {t('backToHome')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href="/"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('userManagement')}</h1>
                <p className="text-gray-600">{t('manageStaffAccess')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setShowArchived(false)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  !showArchived
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('activeUsers')} ({users.filter(u => !u.archived).length})
              </button>
              <button
                onClick={() => setShowArchived(true)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  showArchived
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('archivedUsers')} ({users.filter(u => u.archived).length})
              </button>
            </nav>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('loadingUsers')}</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <li key={user.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        user.role === 'manager' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        <UserIcon className={`w-6 h-6 ${
                          user.role === 'manager' ? 'text-purple-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'manager' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {t(user.role)}
                          </span>
                          {user.archived && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {t('archived')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">
                          {t('joinedOn')} {new Date(user.created_at).toLocaleDateString(language === 'es' ? 'es-ES' : language === 'tr' ? 'tr-TR' : 'en-US')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Don't allow archiving yourself */}
                      {user.email !== session.user?.email && (
                        <button
                          onClick={() => toggleUserArchiveStatus(user.id, user.archived)}
                          disabled={actionLoading === user.id}
                          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            user.archived
                              ? 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500'
                              : 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:ring-yellow-500'
                          } ${actionLoading === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {actionLoading === user.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : user.archived ? (
                            <>
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              {t('reactivate')}
                            </>
                          ) : (
                            <>
                              <ArchiveBoxIcon className="w-4 h-4 mr-1" />
                              {t('archive')}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
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