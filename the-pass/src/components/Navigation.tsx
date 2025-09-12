'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  CheckSquare, 
  Users, 
  ClipboardList, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  BarChart3,
  Calendar
} from 'lucide-react'
import { useState } from 'react'
import { NotificationDropdown } from '@/components/NotificationProvider'

export default function Navigation() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isManager = session?.user?.employee?.role === 'manager' || session?.user?.employee?.role === 'admin'

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Quick Setup', href: '/quick-setup', icon: Settings },
    { name: 'Features Overview', href: '/features', icon: Settings },
    { name: 'My Tasks', href: '/workflows', icon: CheckSquare },
    { name: 'Reviews', href: '/reviews', icon: ClipboardList },
    ...(isManager ? [
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Recurring Workflows', href: '/recurring-workflows', icon: Calendar },
      { name: 'Checklists', href: '/checklists', icon: ClipboardList },
      { name: 'Assign Tasks', href: '/workflows/assign', icon: Users },
      { name: 'Manage Users', href: '/admin/users', icon: Users }
    ] : [])
  ]

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ name: 'Home', href: '/' }]
    
    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ')
      breadcrumbs.push({ name, href: currentPath })
    })
    
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  if (!session) return null

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>

              {/* Logo */}
              <div className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
                <Link href="/" className="text-xl font-bold text-indigo-600">
                  The Pass
                </Link>
              </div>

              {/* Desktop navigation */}
              <div className="hidden lg:ml-10 lg:flex lg:space-x-8">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/' && pathname.startsWith(item.href))
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <NotificationDropdown />
              <span className="text-sm text-gray-700">
                {session.user?.employee?.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center">
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 1 && (
        <nav className="bg-gray-50 border-b border-gray-200" aria-label="Breadcrumb">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4 py-4">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                  {index > 0 && (
                    <ChevronRight className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2" />
                  )}
                  <Link
                    href={crumb.href}
                    className={`text-sm font-medium ${
                      index === breadcrumbs.length - 1
                        ? 'text-gray-500'
                        : 'text-indigo-600 hover:text-indigo-800'
                    }`}
                  >
                    {crumb.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </nav>
      )}
    </>
  )
}
