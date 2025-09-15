'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SchedulesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Schedules</h1>
          <p className="mt-2 text-gray-600">Manage work schedules and shifts</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Schedule Management Coming Soon
            </h3>
            <p className="text-gray-600">
              Advanced shift scheduling features are being developed. This will include:
            </p>
            <ul className="mt-4 text-left max-w-md mx-auto text-gray-600 space-y-2">
              <li>• Shift scheduling and assignments</li>
              <li>• Availability management</li>
              <li>• Shift swapping</li>
              <li>• Conflict detection</li>
              <li>• Time-off requests</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}