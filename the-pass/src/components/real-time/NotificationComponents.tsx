'use client'

import { useState, useEffect } from 'react'
import { useRealTime, useNotifications, RealTimeMessage } from '@/context/RealTimeContext'
import { useTranslations } from '@/lib/useTranslations'
import { Bell, X, Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface NotificationToast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  autoHide?: boolean
}

export function RealTimeStatus() {
  const { isConnected, connectionStatus, retryConnection } = useRealTime()
  const { t } = useTranslations()

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500'
      case 'connecting': return 'text-yellow-500'
      case 'disconnected': return 'text-gray-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="h-4 w-4" />
      case 'connecting': return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'disconnected': return <WifiOff className="h-4 w-4" />
      case 'error': return <WifiOff className="h-4 w-4" />
      default: return <WifiOff className="h-4 w-4" />
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-xs font-medium">
          {t(`realtime.status.${connectionStatus}`, connectionStatus)}
        </span>
      </div>
      
      {connectionStatus === 'error' && (
        <button
          onClick={retryConnection}
          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {t('realtime.retry', 'Retry')}
        </button>
      )}
    </div>
  )
}

export function NotificationCenter() {
  const { notifications } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { t } = useTranslations()

  useEffect(() => {
    setUnreadCount(notifications.length)
  }, [notifications])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return t('realtime.timeago.now', 'Just now')
    if (diff < 3600000) return t('realtime.timeago.minutes', '{minutes}m ago', { minutes: Math.floor(diff / 60000) })
    if (diff < 86400000) return t('realtime.timeago.hours', '{hours}h ago', { hours: Math.floor(diff / 3600000) })
    
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (payload: any) => {
    switch (payload.type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const clearNotifications = () => {
    setUnreadCount(0)
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) clearNotifications()
        }}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {t('realtime.notifications.title', 'Notifications')}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {t('realtime.notifications.empty', 'No notifications')}
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 border-b hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.payload)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.payload.title || t('realtime.notifications.default_title', 'Notification')}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.payload.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function NotificationToasts() {
  const [toasts, setToasts] = useState<NotificationToast[]>([])
  const { lastMessage } = useRealTime()
  const { t } = useTranslations()

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'notification') {
      const toast: NotificationToast = {
        id: lastMessage.id,
        type: lastMessage.payload.type || 'info',
        title: lastMessage.payload.title || t('realtime.notifications.default_title', 'Notification'),
        message: lastMessage.payload.message,
        timestamp: new Date(lastMessage.timestamp),
        autoHide: lastMessage.payload.autoHide !== false
      }

      setToasts(prev => [toast, ...prev.slice(0, 4)]) // Keep max 5 toasts

      // Auto-hide after 5 seconds if enabled
      if (toast.autoHide) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id))
        }, 5000)
      }
    }
  }, [lastMessage, t])

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const getToastColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default: return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default: return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`max-w-sm w-full p-4 rounded-lg border shadow-lg ${getToastColor(toast.type)} animate-in slide-in-from-right-full`}
        >
          <div className="flex items-start gap-3">
            {getToastIcon(toast.type)}
            <div className="flex-1 min-w-0">
              <p className="font-medium">{toast.title}</p>
              <p className="text-sm mt-1">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function LiveActivityIndicator() {
  const { isConnected, lastMessage } = useRealTime()
  const [recentActivity, setRecentActivity] = useState<RealTimeMessage[]>([])
  const { t } = useTranslations()

  useEffect(() => {
    if (lastMessage && lastMessage.type !== 'heartbeat') {
      setRecentActivity(prev => [lastMessage, ...prev.slice(0, 9)]) // Keep last 10 activities
    }
  }, [lastMessage])

  if (!isConnected || recentActivity.length === 0) {
    return null
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_update': return '📝'
      case 'workflow_update': return '⚡'
      case 'review_update': return '⭐'
      case 'notification': return '🔔'
      default: return '💬'
    }
  }

  const getActivityDescription = (message: RealTimeMessage) => {
    switch (message.type) {
      case 'task_update':
        return t('realtime.activity.task_update', 'Task updated: {task}', { task: message.payload.title })
      case 'workflow_update':
        return t('realtime.activity.workflow_update', 'Workflow changed: {workflow}', { workflow: message.payload.name })
      case 'review_update':
        return t('realtime.activity.review_update', 'Review posted by {user}', { user: message.payload.reviewer })
      case 'notification':
        return message.payload.title || t('realtime.activity.notification', 'New notification')
      default:
        return t('realtime.activity.default', 'New activity')
    }
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-gray-900">
          {t('realtime.activity.title', 'Live Activity')}
        </span>
      </div>
      
      <div className="space-y-2">
        {recentActivity.slice(0, 3).map((activity) => (
          <div key={activity.id} className="flex items-center gap-2 text-xs text-gray-600">
            <span>{getActivityIcon(activity.type)}</span>
            <span className="truncate">{getActivityDescription(activity)}</span>
          </div>
        ))}
      </div>
      
      {recentActivity.length > 3 && (
        <div className="text-xs text-gray-400 mt-2">
          {t('realtime.activity.more', '+{count} more', { count: recentActivity.length - 3 })}
        </div>
      )}
    </div>
  )
}