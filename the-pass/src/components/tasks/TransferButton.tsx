import React, { useState } from 'react'

interface TransferButtonProps {
  taskId: string
  taskType: string
  taskDetails?: any
  buttonText?: string
  buttonClass?: string
  onTransferComplete?: () => void
  compact?: boolean
}

export default function TransferButton({
  taskId,
  taskType,
  taskDetails,
  buttonText = "Transfer Task",
  buttonClass = "",
  onTransferComplete,
  compact = false
}: TransferButtonProps) {
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [eligibleUsers, setEligibleUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [loading, setLoading] = useState(false)

  const loadEligibleUsers = async () => {
    try {
      const response = await fetch('/api/task-transfers?action=get_user_permissions&user_id=user-123')
      const data = await response.json()
      if (data.success) {
        setEligibleUsers(data.eligible_users)
      }
    } catch (error) {
      console.error('Error loading eligible users:', error)
    }
  }

  const handleOpenModal = () => {
    setShowTransferModal(true)
    loadEligibleUsers()
  }

  const handleTransfer = async () => {
    if (!selectedUser) return

    setLoading(true)
    try {
      const response = await fetch('/api/task-transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'transfer_task',
          task_id: taskId,
          task_type: taskType,
          from_user_id: 'user-123', // Replace with actual user ID
          to_user_id: selectedUser,
          transfer_reason: transferReason,
          task_metadata: taskDetails
        })
      })

      const data = await response.json()
      if (data.success) {
        setShowTransferModal(false)
        setSelectedUser('')
        setTransferReason('')
        onTransferComplete?.()
        alert(`Transfer request sent successfully!`)
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

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={`
          ${compact ? 'p-2' : 'px-4 py-2'} 
          bg-blue-600 text-white rounded-lg hover:bg-blue-700 
          transition-colors flex items-center space-x-2
          ${buttonClass}
        `}
        title="Transfer this task to another team member"
      >
        {compact ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>{buttonText}</span>
          </>
        )}
      </button>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Transfer Task</h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Task Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  <strong>Task ID:</strong> {taskId}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Type:</strong> {taskType}
                </p>
                {taskDetails?.title && (
                  <p className="text-sm text-gray-600">
                    <strong>Title:</strong> {taskDetails.title}
                  </p>
                )}
              </div>

              {/* Select User */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer to:
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a team member...</option>
                  {eligibleUsers.map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role} - {user.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason */}
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

              {/* Quick Reason Buttons */}
              <div className="flex flex-wrap gap-2">
                {[
                  'Need help',
                  'Going on break',
                  'Emergency priority',
                  'Better suited for this',
                  'Training opportunity'
                ].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setTransferReason(reason)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleTransfer}
                disabled={!selectedUser || loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending...' : 'Send Request'}
              </button>
              <button
                onClick={() => setShowTransferModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Transfer Tips */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 <strong>Tip:</strong> The recipient can accept or deny your request. 
                Clear reasons help teammates understand why you need help.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}