'use client'

import { useEffect, useState } from 'react'

interface EnvStatus {
  supabaseUrl: boolean
  supabaseAnonKey: boolean
  serviceKey: boolean
}

export default function EnvChecker() {
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null)
  const [showChecker, setShowChecker] = useState(false)

  useEffect(() => {
    // Only show in development or when there are issues
    const isDev = process.env.NODE_ENV === 'development'
    const hasIssues = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (isDev || hasIssues) {
      setEnvStatus({
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      })
      setShowChecker(true)
    }
  }, [])

  if (!showChecker || !envStatus) return null

  const hasErrors = !envStatus.supabaseUrl || !envStatus.supabaseAnonKey

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-sm z-50 ${
      hasErrors ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
    }`}>
      <h4 className="text-sm font-semibold mb-2 text-gray-900">
        Environment Status
      </h4>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Supabase URL:</span>
          <span className={envStatus.supabaseUrl ? 'text-green-600' : 'text-red-600'}>
            {envStatus.supabaseUrl ? '✓' : '✗'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Anon Key:</span>
          <span className={envStatus.supabaseAnonKey ? 'text-green-600' : 'text-red-600'}>
            {envStatus.supabaseAnonKey ? '✓' : '✗'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Service Key:</span>
          <span className={envStatus.serviceKey ? 'text-green-600' : 'text-yellow-600'}>
            {envStatus.serviceKey ? '✓' : '○'}
          </span>
        </div>
      </div>
      {hasErrors && (
        <p className="text-xs text-red-600 mt-2">
          Missing required environment variables. Check Vercel settings.
        </p>
      )}
      <button 
        onClick={() => setShowChecker(false)}
        className="text-xs text-gray-500 hover:text-gray-700 mt-2"
      >
        Hide
      </button>
    </div>
  )
}
