import React, { useState, useEffect } from 'react'

interface TaskTransfer {
  id: string
  task_id: string
  task_type: string
  from_user_id: string
  to_user_id: string
  transfer_reason: string
  status: string
  response_message?: string
  transferred_at: string
  responded_at?: string
  metadata: any
  from_user: {
    name: string
    department: string
    role: string
    avatar_url?: string
  }
  to_user: {
    name: string
    department: string
    role: string
    avatar_url?: string
  }
}

interface EligibleUser {
  id: string
  name: string
  department: string
  role: string
}

interface TransferPermissions {
  max_transfers_per_day: number
  requires_approval: boolean
  department_restrictions: string[]
}

interface TaskTransferSystemProps {
  taskId?: string
  taskType?: string
  taskDetails?: any
  onTransferComplete?: () => void
}

export default function TaskTransferSystem({ 
  taskId, 
  taskType, 
  taskDetails,
  onTransferComplete 
}: TaskTransferSystemProps) {
  // Mock user - replace with actual user context
  const user = { id: 'user-123', name: 'Current User' }
  const [activeTab, setActiveTab] = useState<'transfer' | 'requests' | 'history'>('requests')
  const [transferRequests, setTransferRequests] = useState<TaskTransfer[]>([])
  const [sentTransfers, setSentTransfers] = useState<TaskTransfer[]>([])
  const [eligibleUsers, setEligibleUsers] = useState<EligibleUser[]>([])
  const [permissions, setPermissions] = useState<TransferPermissions | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [showTransferDialog, setShowTransferDialog] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadTransferData()
      setupRealTimeUpdates()
    }
  }, [user?.id])

  const loadTransferData = async () => {
    try {
      // Load received transfer requests
      const receivedResponse = await fetch(
        `/api/task-transfers?action=get_transfer_requests&user_id=${user?.id}&type=received`
      )
      const receivedData = await receivedResponse.json()
      if (receivedData.success) {
        setTransferRequests(receivedData.transfers)
      }

      // Load sent transfers
      const sentResponse = await fetch(
        `/api/task-transfers?action=get_transfer_requests&user_id=${user?.id}&type=sent`
      )
      const sentData = await sentResponse.json()
      if (sentData.success) {
        setSentTransfers(sentData.transfers)
      }

      // Load user permissions and eligible users
      const permissionsResponse = await fetch(
        `/api/task-transfers?action=get_user_permissions&user_id=${user?.id}`
      )
      const permissionsData = await permissionsResponse.json()
      if (permissionsData.success) {
        setPermissions(permissionsData.permissions)
        setEligibleUsers(permissionsData.eligible_users)
      }

    } catch (error) {
      console.error('Error loading transfer data:', error)
    }
  }

  const setupRealTimeUpdates = () => {
    // Poll for updates every 30 seconds
    const interval = setInterval(loadTransferData, 30000)
    return () => clearInterval(interval)
  }

  const handleTransferTask = async () => {
    if (!selectedUser || !taskId || !taskType) return

    setLoading(true)
    try {
      const response = await fetch('/api/task-transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'transfer_task',
          task_id: taskId,
          task_type: taskType,
          from_user_id: user?.id,
          to_user_id: selectedUser,
          transfer_reason: transferReason,
          task_metadata: taskDetails
        })
      })

      const data = await response.json()
      if (data.success) {
        setShowTransferDialog(false)
        setSelectedUser('')
        setTransferReason('')
        loadTransferData()
        onTransferComplete?.()
        
        // Show success message
        alert(`Transfer request sent successfully to ${data.transfer.to_user.name}!`)
      } else {
        alert(`Transfer failed: ${data.message}`)
      }
    } catch (error) {
      console.error('Error transferring task:', error)
      alert('Failed to transfer task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRespondToTransfer = async (transferId: string, response: 'accepted' | 'denied', message?: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/task-transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'respond_to_transfer',
          transfer_id: transferId,
          response,
          response_message: message,
          user_id: user?.id
        })
      })

      const data = await res.json()
      if (data.success) {
        loadTransferData()
        alert(`Transfer ${response} successfully!`)
      } else {
        alert(`Failed to ${response} transfer: ${data.message}`)
      }
    } catch (error) {
      console.error('Error responding to transfer:', error)
      alert('Failed to respond to transfer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      denied: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      pending_approval: 'bg-blue-100 text-blue-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!user) {
    return <div className="p-4 text-center text-gray-500">Please log in to access task transfers</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Task Transfer System</h2>
        {taskId && (
          <button
            onClick={() => setShowTransferDialog(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Transfer This Task
          </button>
        )}
      </div>

      {/* Permissions Summary */}
      {permissions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Your Transfer Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Daily Limit:</span> {permissions.max_transfers_per_day} transfers
            </div>
            <div>
              <span className="font-medium">Approval Required:</span> {permissions.requires_approval ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="font-medium">Department Restrictions:</span> {
                permissions.department_restrictions.length > 0 
                  ? permissions.department_restrictions.join(', ')
                  : 'None'
              }
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'requests', label: 'Incoming Requests', count: transferRequests.length },
          { id: 'history', label: 'Transfer History', count: sentTransfers.length },
          ...(taskId ? [{ id: 'transfer', label: 'Transfer Task', count: 0 }] : [])
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Incoming Transfer Requests</h3>
          {transferRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending transfer requests
            </div>
          ) : (
            transferRequests.map((transfer) => (
              <div key={transfer.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Transfer from {transfer.from_user.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {transfer.from_user.role} • {transfer.from_user.department}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(transfer.status)}`}>
                    {transfer.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Reason:</strong> {transfer.transfer_reason || 'No reason provided'}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Task Type:</strong> {transfer.task_type}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Requested:</strong> {formatDate(transfer.transferred_at)}
                  </p>
                </div>

                {transfer.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRespondToTransfer(transfer.id, 'accepted')}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Reason for denying (optional):')
                        if (reason !== null) {
                          handleRespondToTransfer(transfer.id, 'denied', reason)
                        }
                      }}
                      disabled={loading}
                      className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      Deny
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Transfer History</h3>
          {sentTransfers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transfer history
            </div>
          ) : (
            sentTransfers.map((transfer) => (
              <div key={transfer.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Transferred to {transfer.to_user.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {transfer.to_user.role} • {transfer.to_user.department}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(transfer.status)}`}>
                    {transfer.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Reason:</strong> {transfer.transfer_reason || 'No reason provided'}</p>
                  <p><strong>Task Type:</strong> {transfer.task_type}</p>
                  <p><strong>Sent:</strong> {formatDate(transfer.transferred_at)}</p>
                  {transfer.responded_at && (
                    <p><strong>Responded:</strong> {formatDate(transfer.responded_at)}</p>
                  )}
                  {transfer.response_message && (
                    <p><strong>Response:</strong> {transfer.response_message}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'transfer' && taskId && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Transfer Current Task</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-4">
              <strong>Task ID:</strong> {taskId} • <strong>Type:</strong> {taskType}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer to:
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a user...</option>
                  {eligibleUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role} - {user.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for transfer:
                </label>
                <textarea
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="Why are you transferring this task?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <button
                onClick={handleTransferTask}
                disabled={!selectedUser || loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Transferring...' : 'Send Transfer Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Dialog Modal */}
      {showTransferDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Transfer Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer to:
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a user...</option>
                  {eligibleUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role} - {user.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for transfer:
                </label>
                <textarea
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="Why are you transferring this task?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleTransferTask}
                disabled={!selectedUser || loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Transferring...' : 'Transfer'}
              </button>
              <button
                onClick={() => setShowTransferDialog(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}