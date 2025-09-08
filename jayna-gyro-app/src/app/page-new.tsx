'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { 
  Users, 
  ChefHat, 
  ShoppingCart, 
  ClipboardList 
} from 'lucide-react'

export default function HomePage() {
  const { language } = useLanguage()

  const modules = [
    {
      title: translations.foh,
      description: translations.fohDescription || 'Front of House Operations',
      href: '/foh',
      icon: Users,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: translations.boh,
      description: translations.bohDescription || 'Back of House Operations',
      href: '/boh',
      icon: ChefHat,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: translations.ordering,
      description: translations.orderingDescription || 'Inventory & Ordering',
      href: '/ordering',
      icon: ShoppingCart,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: translations.worksheets,
      description: translations.worksheetsDescription || 'Worksheet Analytics',
      href: '/worksheets',
      icon: ClipboardList,
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ChefHat className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                Jayna Gyro
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              {translations.employeeWorksheetApp}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {translations.welcome}
          </h1>
          <p className="mt-3 max-w-md mx-auto text-lg text-gray-500 sm:max-w-3xl">
            {translations.selectModule}
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Link
                key={module.href}
                href={module.href}
                className="group relative bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 inline-flex p-3 rounded-lg ${module.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-600">
                      {module.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {module.description}
                    </p>
                  </div>
                </div>
                
                {/* Arrow indicator */}
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            {translations.todayOverview || 'Today\'s Overview'}
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClipboardList className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {translations.completedWorksheets || 'Completed Today'}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">12</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {translations.activeEmployees || 'Active Employees'}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">8</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShoppingCart className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {translations.lowStockItems || 'Low Stock Items'}
                      </dt>
                      <dd className="text-lg font-medium text-red-600">3</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChefHat className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {translations.pendingIssues || 'Pending Issues'}
                      </dt>
                      <dd className="text-lg font-medium text-yellow-600">2</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
