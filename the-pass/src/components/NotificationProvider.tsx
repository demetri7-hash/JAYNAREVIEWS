'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'
import { RealtimeChannel } from '@supabase/supabase-js'
import { Bell, CheckCircle, MessageCircle, Users, Clock } from 'lucide-react'

interface Notification {
  id: string
  type: 'task_assigned' | 'task_completed' | 'comment_added' | 'workflow_updated'
  title: string
  message: string
  timestamp: Date
  read: boolean
  workflow_id?: string
  task_id?: string
  from_user?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const { data: session } = useSession()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (!session?.user?.employee?.id) return

    // Subscribe to real-time changes
    const realtimeChannel = supabase
      .channel('workflow-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workflows',
          filter: `assigned_to=eq.${session.user.employee.id}`,
        },
        (payload) => {
          addNotification({
            type: 'task_assigned',
            title: 'New Workflow Assigned',
            message: `You have been assigned: ${payload.new.name}`,
            workflow_id: payload.new.id,
            from_user: 'System'
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'workflows',
          filter: `assigned_by=eq.${session.user.employee.id}`,
        },
        (payload) => {
          if (payload.new.status === 'completed' && payload.old.status !== 'completed') {
            addNotification({
              type: 'task_completed',
              title: 'Workflow Completed',
              message: `${payload.new.name} has been completed`,
              workflow_id: payload.new.id,
              from_user: 'System'
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_completions',
        },
        async (payload) => {
          // Get workflow details to check if this user should be notified
          const { data: workflow } = await supabase
            .from('workflows')
            .select('assigned_by, name')
            .eq('id', payload.new.workflow_id)
            .single()

          if (workflow?.assigned_by === session.user?.employee?.id) {
            const { data: task } = await supabase
              .from('tasks')
              .select('title')
              .eq('id', payload.new.task_id)
              .single()

            addNotification({
              type: 'task_completed',
              title: 'Task Completed',
              message: `${task?.title || 'A task'} in ${workflow?.name || 'a workflow'} was completed`,
              workflow_id: payload.new.workflow_id,
              task_id: payload.new.task_id,
              from_user: 'Employee'
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
        },
        async (payload) => {
          // Get workflow details to check if this user should be notified
          const { data: workflow } = await supabase
            .from('workflows')
            .select('assigned_to, assigned_by, name')
            .eq('id', payload.new.workflow_id)
            .single()

          // Notify if user is assigned to workflow or assigned the workflow
          const shouldNotify = 
            workflow?.assigned_to === session.user?.employee?.id ||
            workflow?.assigned_by === session.user?.employee?.id

          if (shouldNotify && payload.new.employee_id !== session.user?.employee?.id) {
            const { data: employee } = await supabase
              .from('employees')
              .select('name')
              .eq('id', payload.new.employee_id)
              .single()

            addNotification({
              type: 'comment_added',
              title: 'New Comment',
              message: `${employee?.name || 'Someone'} commented on ${workflow?.name}`,
              workflow_id: payload.new.workflow_id,
              task_id: payload.new.task_id,
              from_user: employee?.name || 'Unknown'
            })
          }
        }
      )
      .subscribe()

    setChannel(realtimeChannel)

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel)
      }
    }
  }, [session?.user?.employee?.id])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev])

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png'
      })
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function NotificationIcon() {
  const { unreadCount } = useNotifications()
  
  return (
    <div className="relative">
      <Bell className="h-5 w-5 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  )
}

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task_assigned':
        return <Users className="h-4 w-4 text-blue-500" />
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'comment_added':
        return <MessageCircle className="h-4 w-4 text-purple-500" />
      case 'workflow_updated':
        return <Clock className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
      >
        <NotificationIcon />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      markAsRead(notification.id)
                      setIsOpen(false)
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
