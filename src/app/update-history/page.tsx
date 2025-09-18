'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Bell, Calendar, Camera, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage, staticTranslations } from '@/contexts/LanguageContext'
import { LanguageToggleCompact } from '@/components/LanguageToggle'

interface ManagerUpdate {
  id: string
  title: string
  message: string
  title_en?: string
  title_es?: string
  title_tr?: string
  message_en?: string
  message_es?: string
  message_tr?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  type: 'announcement' | 'alert' | 'policy' | 'emergency'
  requires_acknowledgment: boolean
  timestamp: string
  photo_url?: string
  isRead: boolean
  readAt: string | null
}

export default function UpdateHistory() {
  const router = useRouter()
  const { data: session } = useSession()
  const { language, getText } = useLanguage()
  const [updates, setUpdates] = useState<ManagerUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUpdate, setSelectedUpdate] = useState<ManagerUpdate | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    hasMore: false,
    totalPages: 0
  })

  useEffect(() => {
    if (session) {
      fetchReadUpdates()
    }
  }, [session, pagination.page])

  const fetchReadUpdates = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/manager/updates?showRead=true&page=${pagination.page}&limit=${pagination.limit}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch update history')
      }

      const data = await response.json()
      setUpdates(data.updates || [])
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        hasMore: data.pagination?.hasMore || false,
        totalPages: data.pagination?.totalPages || 0
      }))
    } catch (error) {
      console.error('Error fetching update history:', error)
      setError(error instanceof Error ? error.message : 'Failed to load update history')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <span className="text-red-600">🚨</span>
      case 'alert':
        return <span className="text-orange-600">⚠️</span>
      case 'policy':
        return <span className="text-blue-600">📋</span>
      default:
        return <span className="text-green-600">📢</span>
    }
  }

  const getUpdatePriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const markAsUnread = async (updateId: string) => {
    try {
      const response = await fetch(`/api/manager/updates/read-status?updateId=${updateId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove from history list
        setUpdates(prev => prev.filter(update => update.id !== updateId))
        setSelectedUpdate(null)
      }
    } catch (error) {
      console.error('Error marking as unread:', error)
    }
  }

  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading update history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center animate-fade-in-up">
          <button
            onClick={() => router.push('/team-activity')}
            className="group flex items-center text-slate-600 hover:text-slate-900 transition-all duration-200 bg-white/70 hover:bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Team Activity
          </button>
          <LanguageToggleCompact />
        </div>

        {/* Title */}
        <div className="mb-8 text-center animate-fade-in-up animation-delay-200">
          <h1 className="text-3xl font-bold text-slate-900 brand-header mb-2">
            Full Update History
          </h1>
          <p className="text-slate-600 brand-subtitle">
            Previously read manager updates and announcements
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Updates List */}
        {updates.length === 0 ? (
          <div className="text-center py-12 animate-fade-in-up animation-delay-300">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 brand-header mb-2">No Update History</h3>
            <p className="text-slate-600 brand-subtitle">You haven&apos;t read any manager updates yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update, index) => (
              <div
                key={update.id}
                className="glass rounded-2xl p-6 hover:shadow-lg transition-all duration-300 animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${300 + index * 100}ms` }}
                onClick={() => setSelectedUpdate(update)}
              >
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    {getUpdateIcon(update.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 brand-header mb-2">
                      {getText(update.title_en || update.title, update.title_es, update.title_tr)}
                    </h4>
                    <p className="text-slate-600 brand-subtitle mb-4 line-clamp-2">
                      {getText(update.message_en || update.message, update.message_es, update.message_tr)}
                    </p>
                    
                    {/* Photo thumbnail if exists */}
                    {update.photo_url && (
                      <div className="mb-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                          <img 
                            src={update.photo_url} 
                            alt="Update photo" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <Camera className="w-6 h-6 text-slate-400 hidden" />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Read on {formatDate(update.readAt || update.timestamp)}</span>
                        <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${getUpdatePriorityColor(update.priority)}`}>
                          {update.priority.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">Click to view details</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-4 animate-fade-in-up">
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            
            <span className="text-sm text-slate-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Modal for full update details */}
      {selectedUpdate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl animate-scale-in">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mr-4">
                    {getUpdateIcon(selectedUpdate.type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 brand-header">
                      {getText(selectedUpdate.title_en || selectedUpdate.title, selectedUpdate.title_es, selectedUpdate.title_tr)}
                    </h3>
                    <p className="text-slate-600 brand-subtitle">
                      Read on {formatDate(selectedUpdate.readAt || selectedUpdate.timestamp)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUpdate(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Full photo if exists */}
              {selectedUpdate.photo_url && (
                <div className="mb-6">
                  <img 
                    src={selectedUpdate.photo_url} 
                    alt="Update photo" 
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              )}

              <div className="prose prose-slate max-w-none mb-6">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {getText(selectedUpdate.message_en || selectedUpdate.message, selectedUpdate.message_es, selectedUpdate.message_tr)}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUpdatePriorityColor(selectedUpdate.priority)}`}>
                    {selectedUpdate.priority.toUpperCase()} PRIORITY
                  </span>
                  {selectedUpdate.requires_acknowledgment && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      ACKNOWLEDGMENT REQUIRED
                    </span>
                  )}
                </div>
                <button
                  onClick={() => markAsUnread(selectedUpdate.id)}
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors underline"
                >
                  Mark as unread
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}