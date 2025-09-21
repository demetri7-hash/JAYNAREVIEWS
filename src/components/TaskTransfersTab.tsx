'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, User, AlertTriangle, FileText, RefreshCw } from 'lucide-react'

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

export default function TaskTransfersTab() {
  const [transfers, setTransfers] = useState<TransferRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchTransfers()
  }, [])

  const fetchTransfers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pending-transfers')
      if (!response.ok) throw new Error('Failed to fetch transfers')
      
      const data = await response.json()
      setTransfers(data.transfers || [])
    } catch (err) {
      setError('Failed to load transfer requests')
      console.error('Error fetching transfers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTransferResponse = async (transferId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const response = await fetch(`/api/pending-transfers/${transferId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      })

      if (!response.ok) throw new Error('Failed to update transfer')

      setSuccessMessage(`Transfer ${action}d successfully`)
      fetchTransfers()
    } catch (err) {
      setError(`Failed to ${action} transfer`)
      console.error(`Error ${action}ing transfer:`, err)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_transferee':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'pending_manager':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_transferee':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pending_manager':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Task Transfer Requests</h2>
        <button
          onClick={fetchTransfers}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {transfers.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Transfer Requests</h3>
          <p className="text-slate-600">There are currently no pending task transfer requests.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {transfers.map((transfer) => (
            <div key={transfer.id} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(transfer.status)}
                  <div>
                    <h3 className="font-semibold text-slate-900">{transfer.assignment.task.title}</h3>
                    <p className="text-sm text-slate-600">Transfer Request #{transfer.id.slice(-8)}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(transfer.status)}`}>
                  {transfer.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">From:</span>
                  <span className="font-medium">{transfer.from_user.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">To:</span>
                  <span className="font-medium">{transfer.to_user.name}</span>
                </div>
              </div>

              {transfer.transfer_reason && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Reason:</span> {transfer.transfer_reason}
                  </p>
                </div>
              )}

              <div className="text-xs text-slate-500 mb-4">
                Requested: {new Date(transfer.requested_at).toLocaleString()}
                {transfer.assignment.due_date && (
                  <span className="ml-4">Due: {new Date(transfer.assignment.due_date).toLocaleString()}</span>
                )}
              </div>

              {transfer.status === 'pending_manager' && (
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => handleTransferResponse(transfer.id, 'approve')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleTransferResponse(transfer.id, 'reject')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}