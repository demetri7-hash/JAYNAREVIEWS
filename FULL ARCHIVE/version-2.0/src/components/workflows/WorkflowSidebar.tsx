'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react'

export default function WorkflowSidebar() {
  const { t } = useLanguage()

  const stats = {
    activeWorkflows: 3,
    completedToday: 8,
    pendingReviews: 2,
    averageCompletion: 85
  }

  return (
    <div className="w-64 bg-pass-sidebar border-l border-pass-border p-4">
      <h3 className="text-lg font-semibold mb-4">Today's Overview</h3>
      
      <div className="space-y-4">
        {/* Active Workflows */}
        <div className="bg-blue-900 bg-opacity-20 border border-blue-600 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">Active Workflows</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.activeWorkflows}</div>
        </div>

        {/* Completed */}
        <div className="bg-green-900 bg-opacity-20 border border-green-600 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium">Completed Today</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{stats.completedToday}</div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Pending Reviews</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{stats.pendingReviews}</div>
        </div>

        {/* Completion Rate */}
        <div className="bg-purple-900 bg-opacity-20 border border-purple-600 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium">Completion Rate</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">{stats.averageCompletion}%</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold mb-3">Quick Actions</h4>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded transition-colors">
            Start FOH Morning
          </button>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded transition-colors">
            Start BOH Prep
          </button>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded transition-colors">
            Submit Review
          </button>
        </div>
      </div>
    </div>
  )
}
