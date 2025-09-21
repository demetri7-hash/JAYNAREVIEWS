'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Settings, 
  LogOut, 
  CheckSquare, 
  BarChart3, 
  UserCog,
  ClipboardList,
  Bell,
  ArrowRightLeft,
  Calendar,
  FileText,
  Workflow
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageToggleCompact } from '@/components/LanguageToggle'
import { IconButton, Button } from '@/components/buttons'

interface UserProfile {
  email: string;
  name: string;
  role: 'staff' | 'manager' | 'admin';
  department_permissions?: string[];
}

interface NavigationProps {
  currentPage?: string;
}

export function Navigation({ currentPage }: NavigationProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { getText } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

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
    }
  }, [session])

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const isManager = userProfile?.role === 'manager' || userProfile?.role === 'admin'

  // Navigation items for all users
  const commonNavItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/',
      id: 'home'
    },
    {
      icon: Workflow,
      label: 'My Workflows',
      path: '/workflows',
      id: 'workflows'
    },
    {
      icon: CheckSquare,
      label: 'Finished Workflows',
      path: '/finished-workflows',
      id: 'finished-workflows'
    }
  ]

  // Manager-only navigation items
  const managerNavItems = [
    {
      icon: Settings,
      label: 'Manager Dashboard',
      path: '/manager-dashboard',
      id: 'manager-dashboard'
    },
    {
      icon: Workflow,
      label: 'Workflows',
      path: '/manager/workflows',
      id: 'manager-workflows'
    },
    {
      icon: UserCog,
      label: 'Employee Management',
      path: '/manager/employee-management',
      id: 'manager-employees'
    },
    {
      icon: ArrowRightLeft,
      label: 'Task Transfers',
      path: '/manager/task-transfers',
      id: 'manager-transfers'
    },
    {
      icon: BarChart3,
      label: 'Reports',
      path: '/manager/reports',
      id: 'manager-reports'
    },
    {
      icon: ClipboardList,
      label: 'Create Tasks',
      path: '/manager/create-tasks',
      id: 'manager-create-tasks'
    }
  ]

  const allNavItems = isManager ? [...commonNavItems, ...managerNavItems] : commonNavItems

  return (
    <>
      {/* Mobile Navigation Button */}
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 bg-white shadow-lg border border-gray-200 md:hidden"
        icon={isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        label={isOpen ? "Close menu" : "Open menu"}
        variant="secondary"
        size="lg"
      />

      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-40">
        <div className="flex flex-col w-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">Jayna Gyro</h1>
            {userProfile && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">{userProfile.name}</p>
                <p className="text-xs text-gray-500 capitalize">{userProfile.role}</p>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 p-4">
            <ul className="space-y-2">
              {allNavItems.map((item) => {
                const isActive = currentPage === item.id
                return (
                  <li key={item.id}>
                    <Button
                      onClick={() => handleNavigation(item.path)}
                      variant={isActive ? 'primary' : 'ghost'}
                      className={`w-full justify-start ${
                        isActive ? 'shadow-md' : ''
                      }`}
                      size="md"
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <LanguageToggleCompact />
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="text-xs text-slate-500 hover:text-slate-700 h-auto p-1"
              size="sm"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300" 
            onClick={() => setIsOpen(false)} 
          />
          <nav className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h1 className="text-xl font-bold text-gray-800">Jayna Gyro</h1>
                  <IconButton
                    onClick={() => setIsOpen(false)}
                    icon={<X className="w-5 h-5" />}
                    label="Close menu"
                    variant="ghost"
                    size="md"
                  />
                </div>
                {userProfile && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{userProfile.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{userProfile.role}</p>
                  </div>
                )}
              </div>

              {/* Navigation Items */}
              <div className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-3">
                  {allNavItems.map((item) => {
                    const isActive = currentPage === item.id
                    return (
                      <li key={item.id}>
                        <Button
                          onClick={() => handleNavigation(item.path)}
                          variant={isActive ? 'primary' : 'ghost'}
                          className={`w-full justify-start text-left ${
                            isActive ? 'shadow-md' : ''
                          }`}
                          size="lg"
                        >
                          <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 space-y-3">
                <LanguageToggleCompact />
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="text-xs text-slate-500 hover:text-slate-700 h-auto p-1"
                  size="sm"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

export default Navigation