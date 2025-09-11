'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function DebugPage() {
  const { data: session, status } = useSession()
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    setDebugInfo({
      sessionStatus: status,
      sessionExists: !!session,
      sessionData: session,
      userExists: !!session?.user,
      userEmail: session?.user?.email,
      userEmployee: session?.user?.employee,
      timestamp: new Date().toISOString()
    })
  }, [session, status])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Session exists:</strong> {debugInfo?.sessionExists ? 'Yes' : 'No'}</p>
            <p><strong>User email:</strong> {debugInfo?.userEmail || 'None'}</p>
            <p><strong>Has employee data:</strong> {debugInfo?.userEmployee ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Raw Session Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
