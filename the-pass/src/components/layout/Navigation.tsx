'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from '@/context/TranslationContext'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { 
  Bell, 
  Menu, 
  X, 
  Home, 
  Calendar, 
  CheckSquare, 
  Users, 
  Settings, 
  LogOut, 
  User,
  MessageSquare,
  Clipboard,
  BarChart3,
  ClipboardList
} from 'lucide-react'

interface NavigationProps {
  notifications?: number
}

export default function Navigation({ notifications = 0 }: NavigationProps) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(notifications)

  const user = session?.user?.employee || session?.user

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.navigation-menu') && !target.closest('.menu-button')) {
        setIsMenuOpen(false)
      }
      if (!target.closest('.notifications-panel') && !target.closest('.notifications-button')) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch notifications count
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return
      try {
        const response = await fetch(`/api/notifications?action=get_unread_count&userId=${user.id}`)
        const data = await response.json()
        if (data.success) {
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [user])

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      current: pathname === '/'
    },
    {
      name: 'Workflows',
      href: '/workflows',
      icon: ClipboardList,
      current: pathname?.startsWith('/workflows'),
      submenu: [
        { name: 'FOH Opening', href: '/workflows/foh-opening' },
        { name: 'FOH Closing', href: '/workflows/foh-closing' },
        { name: 'BOH Opening', href: '/workflows/boh-opening' },
        { name: 'BOH Closing', href: '/workflows/boh-closing' },
        { name: 'Daily Prep', href: '/workflows/prep' },
        { name: 'Cleaning', href: '/workflows/cleaning' }
      ]
    },
    {
      name: 'Reviews',
      href: '/reviews',
      icon: CheckSquare,
      current: pathname?.startsWith('/reviews')
    },
    {
      name: 'Schedules',
      href: '/schedules',
      icon: Calendar,
      current: pathname?.startsWith('/schedules')
    },
    {
      name: 'Task Transfers',
      href: '/task-transfers',
      icon: MessageSquare,
      current: pathname?.startsWith('/task-transfers')
    }
  ]

  // Add manager/admin only navigation
  const userRole = (user as any)?.role || (user as any)?.employee?.role
  const isManager = user && ['manager', 'admin'].includes(userRole)
  if (isManager) {
    navigation.push(
      {
        name: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
        current: pathname?.startsWith('/analytics')
      },
      {
        name: 'Admin',
        href: '/admin',
        icon: Settings,
        current: pathname?.startsWith('/admin')
      }
    )
  }

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/auth/signin' })
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (!session) {
    return null // Don't show navigation if not authenticated
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TP</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">The Pass</span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navigation.map((item) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${item.current 
                        ? 'bg-blue-100 text-blue-700 border-blue-500' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side: notifications, user menu */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="notifications-button relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <div className="flex items-center space-x-3">
                {/* User Avatar/Info */}
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">
                      {(user as any)?.first_name} {(user as any)?.last_name || (user as any)?.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{userRole}</div>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="menu-button md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="navigation-menu md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors
                    ${item.current 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <IconComponent className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
            
            {/* Mobile Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {isNotificationsOpen && (
        <div className="notifications-panel absolute right-4 top-16 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {unreadCount === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="p-4">
                <p className="text-sm text-gray-600">You have {unreadCount} unread notifications</p>
                <div className="mt-2">
                  <Link 
                    href="/notifications"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    onClick={() => setIsNotificationsOpen(false)}
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}