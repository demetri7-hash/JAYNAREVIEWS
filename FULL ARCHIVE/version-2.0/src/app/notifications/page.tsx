import React from 'react'
import NotificationBell from '@/components/ui/NotificationBell'
import BackButton from '@/components/ui/BackButton'

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <BackButton href="/" />
          
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Notifications
            </h1>
            <p className="mt-2 text-gray-600">
              Stay up to date with important updates and messages
            </p>
          </div>
        </div>

        {/* Notification Center */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <NotificationBell className="mx-auto" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Notification Center
            </h2>
            <p className="mt-2 text-gray-600">
              All your notifications in one place
            </p>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Notification Preferences
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Task Transfers</h4>
                <p className="text-sm text-gray-600">Get notified when someone transfers a task to you</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5 text-blue-600" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Manager Updates</h4>
                <p className="text-sm text-gray-600">Receive important announcements from management</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5 text-blue-600" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Review Updates</h4>
                <p className="text-sm text-gray-600">Get notified about line review completions and scores</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5 text-blue-600" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Wall Posts</h4>
                <p className="text-sm text-gray-600">Notifications for new community posts and announcements</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}