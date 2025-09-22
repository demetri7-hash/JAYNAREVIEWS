'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Clock, CheckCircle, XCircle, User, AlertTriangle, FileText, RefreshCw } from 'lucide-react'

interface TransferRequest {
  id: string
  assignment_id: string
  from_user_id: string
  to_user_id: string
  status: 'pending_transferee' | 'pending_manager' | 'approved' | 'rejected'
  transfer_reason: string | null
  requested_at: string
  transferee_responded_at: string | null
  manager_responded_at: string | null
  from_user: {
    id: string
    name: string
    email: string
  }
  to_user: {
    id: string
    name: string
    email: string
  }
  assignment: {
    id: string
    due_date: string
    task: {
      id: string
      title: string
      description: string | null
      requires_notes: boolean
      requires_photo: boolean
    }
  }
}

interface UserProfile {
  email: string
  name: string
  role: 'staff' | 'manager'
}

export default function PendingTransfers() {
  const router = useRouter()
  const { data: session } = useSession()
  const [transfers, setTransfers] = useState<TransferRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserProfile()
      fetchPendingTransfers()
    }
  }, [session])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/me')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUserProfile(data.user)
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchPendingTransfers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pending-transfers')
      
      if (response.ok) {
        const data = await response.json()
        setTransfers(data.transfers || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch pending transfers')
      }
    } catch (error) {
      console.error('Error fetching transfers:', error)
      setError('Failed to fetch pending transfers')
    } finally {
      setLoading(false)
    }
  }

  const handleTransferAction = async (transferId: string, action: 'approve' | 'reject', response?: string) => {
    setActionLoading(transferId)
    try {
      const response_body = await fetch('/api/transfer-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          transferId,
          action,
          response
        })
      })

      if (response_body.ok) {
        // Refresh the transfers list
        fetchPendingTransfers()
      } else {
        const errorData = await response_body.json()
        setError(errorData.error || `Failed to ${action} transfer`)
      }
    } catch (error) {
      console.error(`Error ${action}ing transfer:`, error)
      setError(`Failed to ${action} transfer`)
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_transferee':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending_manager':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_transferee':
        return 'Awaiting Your Approval'
      case 'pending_manager':
        return 'Awaiting Manager Approval'
      case 'approved':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transfer requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pending Transfer Requests</h1>
              <p className="text-gray-600">
                {userProfile?.role === 'manager' 
                  ? 'Review and approve transfer requests from your team'
                  : 'Review transfer requests assigned to you'
                }
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                <div className="text-red-600 text-sm">{error}</div>
              </div>
            </div>
          )}

          {transfers.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Transfers</h3>
              <p className="text-gray-600">There are currently no transfer requests waiting for your approval.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {transfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {transfer.assignment.task.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                          {getStatusText(transfer.status)}
                        </span>
                      </div>
                      
                      {transfer.assignment.task.description && (
                        <p className="text-gray-600 mb-3">
                          {transfer.assignment.task.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            <span>From: <strong>{transfer.from_user.name}</strong></span>
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            <span>To: <strong>{transfer.to_user.name}</strong></span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Due: <strong>{formatDate(transfer.assignment.due_date)}</strong></span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Requested: {formatDate(transfer.requested_at)}</span>
                          </div>
                          {transfer.transfer_reason && (
                            <div className="flex items-start">
                              <FileText className="w-4 h-4 mr-2 mt-0.5" />
                              <span>Reason: {transfer.transfer_reason}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons for pending transfers */}
                  {transfer.status === 'pending_transferee' || 
                   (transfer.status === 'pending_manager' && userProfile?.role === 'manager') ? (
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleTransferAction(transfer.id, 'approve')}
                        disabled={actionLoading === transfer.id}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {actionLoading === transfer.id ? (
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Approve Transfer
                      </button>
                      
                      <button
                        onClick={() => handleTransferAction(transfer.id, 'reject')}
                        disabled={actionLoading === transfer.id}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Transfer
                      </button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        {transfer.status === 'approved' && 'This transfer has been approved and completed.'}
                        {transfer.status === 'rejected' && 'This transfer was rejected.'}
                        {transfer.status === 'pending_manager' && userProfile?.role !== 'manager' && 
                          'Waiting for manager approval after transferee accepted.'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}