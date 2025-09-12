import TaskTransferSystem from '@/components/tasks/TaskTransferSystem'

export default function TaskTransfersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Task Transfer Center
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transfer tasks between team members, manage incoming requests, and track transfer history. 
            All transfers require acceptance from the recipient to ensure accountability.
          </p>
        </div>

        <TaskTransferSystem />

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-blue-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Transfer Tasks</h3>
            <p className="text-gray-600 text-sm">
              Send tasks to other team members when you need help or when someone else is better suited for the job.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-green-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Accept Requests</h3>
            <p className="text-gray-600 text-sm">
              Review and respond to incoming transfer requests. Help your teammates by accepting tasks you can handle.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-purple-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track History</h3>
            <p className="text-gray-600 text-sm">
              View all your transfer activity, see response statuses, and maintain accountability for task ownership.
            </p>
          </div>
        </div>

        {/* Transfer Guidelines */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Transfer Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">When to Transfer:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• You're overwhelmed with work</li>
                <li>• Task requires specific expertise</li>
                <li>• You're going on break/shift end</li>
                <li>• Emergency situation needs attention</li>
                <li>• Training someone new</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Best Practices:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Always provide a clear reason</li>
                <li>• Transfer to qualified team members</li>
                <li>• Respect daily transfer limits</li>
                <li>• Follow up if urgent</li>
                <li>• Thank people who help you</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}