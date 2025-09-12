'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  PhotoIcon, 
  ChartBarIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

export default function FeaturesOverview() {
  const { data: session } = useSession();

  const features = [
    {
      title: "📱 My Tasks (Enhanced)",
      description: "View and complete your assigned tasks with time tracking and photo uploads",
      link: "/my-tasks",
      status: "✅ Live",
      icon: CheckCircleIcon,
      color: "bg-green-100 text-green-800"
    },
    {
      title: "⏰ Time Tracking",
      description: "Track time spent on tasks with productivity insights",
      link: "/my-tasks",
      status: "✅ Live", 
      icon: ClockIcon,
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "📸 Photo Upload",
      description: "Document task completions with photos",
      link: "/my-tasks",
      status: "✅ Live",
      icon: PhotoIcon,
      color: "bg-purple-100 text-purple-800"
    },
    {
      title: "📊 Manager Analytics",
      description: "Performance dashboards and team insights",
      link: "/dashboard/analytics",
      status: "✅ Live",
      icon: ChartBarIcon,
      color: "bg-orange-100 text-orange-800",
      managerOnly: true
    },
    {
      title: "🔄 Recurring Workflows", 
      description: "Automated daily/weekly workflow scheduling",
      link: "/recurring-workflows",
      status: "✅ Live",
      icon: CalendarDaysIcon,
      color: "bg-indigo-100 text-indigo-800",
      managerOnly: true
    },
    {
      title: "📋 Import Jayna Workflows",
      description: "Convert reference worksheets to digital workflows",
      link: "/import-workflows", 
      status: "✅ Live",
      icon: DocumentTextIcon,
      color: "bg-green-100 text-green-800",
      managerOnly: true
    },
    {
      title: "📱 PWA Features",
      description: "Install as mobile app, work offline",
      link: "/",
      status: "✅ Live", 
      icon: DevicePhoneMobileIcon,
      color: "bg-pink-100 text-pink-800"
    }
  ];

  const isManager = session?.user?.employee?.role === 'manager' || session?.user?.employee?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 The Pass - All Features Overview
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Complete enterprise workflow management system
          </p>
          {session ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              ✅ Logged in as: <strong>{session.user?.email}</strong> 
              {isManager && <span className="ml-2 px-2 py-1 bg-green-200 rounded text-sm">Manager Access</span>}
            </div>
          ) : (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              ⚠️ Please log in to access all features
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const canAccess = !feature.managerOnly || isManager;
            
            return (
              <div 
                key={index}
                className={`
                  bg-white rounded-lg shadow-md p-6 border-l-4 transition-all duration-200
                  ${canAccess 
                    ? 'border-green-500 hover:shadow-lg' 
                    : 'border-gray-300 opacity-60'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <Icon className="h-8 w-8 text-gray-600" />
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${feature.color}
                  `}>
                    {feature.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  {feature.description}
                </p>

                {feature.managerOnly && !isManager && (
                  <p className="text-orange-600 text-xs mb-4">
                    👑 Manager access required
                  </p>
                )}
                
                {canAccess ? (
                  <Link 
                    href={feature.link}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Access Feature →
                  </Link>
                ) : (
                  <span className="text-gray-400 text-sm">
                    Login as Manager to access
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎯 Quick Start Guide
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">For Employees:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Go to <Link href="/my-tasks" className="text-blue-600 hover:underline">My Tasks</Link> to see assigned work</li>
                <li>• Start timers when working on tasks</li>
                <li>• Upload photos to document completions</li>
                <li>• Get real-time notifications</li>
                <li>• Install as mobile app (PWA)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">For Managers:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <Link href="/import-workflows" className="text-blue-600 hover:underline">Import Jayna Workflows</Link> to add real restaurant tasks</li>
                <li>• View <Link href="/dashboard/analytics" className="text-blue-600 hover:underline">Analytics Dashboard</Link> for performance insights</li>
                <li>• Set up <Link href="/recurring-workflows" className="text-blue-600 hover:underline">Recurring Workflows</Link> for automation</li>
                <li>• Assign tasks and monitor progress</li>
                <li>• Review time tracking and productivity data</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">🔧 Debug Info:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Session: {session ? '✅ Active' : '❌ Not logged in'}</p>
            <p>• User Role: {session?.user?.employee?.role || 'Not determined'}</p>
            <p>• Manager Access: {isManager ? '✅ Yes' : '❌ No'}</p>
            <p>• Current URL: {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}