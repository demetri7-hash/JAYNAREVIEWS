'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'
import { 
  Users, 
  ChefHat, 
  ShoppingCart, 
  ClipboardList 
} from 'lucide-react'

export default function HomePage() {
  const { language } = useLanguage()

  // Get translations for current language
  const t = (key: string) => {
    const translations: any = {
      en: {
        welcome: 'Welcome to Jayna Gyro',
        selectModule: 'Select a module to get started with your daily tasks',
        employeeWorksheetApp: 'Employee Worksheet App',
        foh: 'Front of House',
        fohDescription: 'Customer service, tables, cash register',
        boh: 'Back of House', 
        bohDescription: 'Kitchen operations, food prep, cleaning',
        ordering: 'Inventory & Ordering',
        orderingDescription: 'Manage stock levels and place orders',
        worksheets: 'Worksheets & Analytics',
        worksheetsDescription: 'View completed worksheets and reports',
        todayOverview: "Today's Overview",
        completedWorksheets: 'Completed Today',
        activeEmployees: 'Active Employees',
        lowStockItems: 'Low Stock Items',
        pendingIssues: 'Pending Issues'
      },
      es: {
        welcome: 'Bienvenido a Jayna Gyro',
        selectModule: 'Selecciona un módulo para comenzar con tus tareas diarias',
        employeeWorksheetApp: 'App de Hojas de Trabajo',
        foh: 'Frente de Casa',
        fohDescription: 'Servicio al cliente, mesas, caja registradora',
        boh: 'Fondo de Casa',
        bohDescription: 'Operaciones de cocina, preparación, limpieza',
        ordering: 'Inventario y Pedidos',
        orderingDescription: 'Gestionar niveles de stock y hacer pedidos',
        worksheets: 'Hojas y Análisis',
        worksheetsDescription: 'Ver hojas completadas y reportes',
        todayOverview: 'Resumen de Hoy',
        completedWorksheets: 'Completadas Hoy',
        activeEmployees: 'Empleados Activos',
        lowStockItems: 'Artículos con Poco Stock',
        pendingIssues: 'Problemas Pendientes'
      },
      tr: {
        welcome: 'Jayna Gyro\'ya Hoş Geldiniz',
        selectModule: 'Günlük görevlerinize başlamak için bir modül seçin',
        employeeWorksheetApp: 'Çalışan Çalışma Sayfası Uygulaması',
        foh: 'Ön Salon',
        fohDescription: 'Müşteri hizmeti, masalar, kasa',
        boh: 'Mutfak',
        bohDescription: 'Mutfak operasyonları, yemek hazırlama, temizlik',
        ordering: 'Envanter ve Sipariş',
        orderingDescription: 'Stok seviyelerini yönet ve sipariş ver',
        worksheets: 'Çalışma Sayfaları ve Analiz',
        worksheetsDescription: 'Tamamlanan sayfaları ve raporları görüntüle',
        todayOverview: 'Bugünün Özeti',
        completedWorksheets: 'Bugün Tamamlanan',
        activeEmployees: 'Aktif Çalışanlar',
        lowStockItems: 'Düşük Stok Ürünleri',
        pendingIssues: 'Bekleyen Sorunlar'
      }
    }
    return translations[language]?.[key] || key
  }

  const modules = [
    {
      title: t('foh'),
      description: t('fohDescription'),
      href: '/foh',
      icon: Users,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: t('boh'),
      description: t('bohDescription'),
      href: '/boh',
      icon: ChefHat,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: t('ordering'),
      description: t('orderingDescription'),
      href: '/ordering',
      icon: ShoppingCart,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: t('worksheets'),
      description: t('worksheetsDescription'),
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
              {t('employeeWorksheetApp')}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {t('welcome')}
          </h1>
          <p className="mt-3 max-w-md mx-auto text-lg text-gray-500 sm:max-w-3xl">
            {t('selectModule')}
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
            {t('todayOverview')}
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
                        {t('completedWorksheets')}
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
                        {t('activeEmployees')}
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
                        {t('lowStockItems')}
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
                        {t('pendingIssues')}
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
