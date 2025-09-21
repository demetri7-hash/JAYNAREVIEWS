'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import MyWorkflowCards from '@/components/workflows/MyWorkflowCards'

export default function WorkflowsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Check authentication and permissions
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/')
      return
    }

    // Fetch user role
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user?.role) {
          setUserRole(data.user.role)
        }
      })
      .catch(() => setUserRole(null))
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Workflows</h1>
              <p className="text-gray-600">
                View and complete your assigned workflows
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
            <button 
              onClick={() => setMessage(null)}
              className="ml-2 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* User Workflows */}
        <MyWorkflowCards 
          userId={session?.user?.id || ''}
          userRole={userRole || ''}
        />
      </div>
    </div>
  )
}