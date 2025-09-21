'use client'

import { useState } from 'react'
import { CheckCircle, Clock, Camera, FileText, AlertCircle } from 'lucide-react'
import TaskCompletionModal from './TaskCompletionModal'

interface WorkflowTask {
  id: string
  title: string
  description: string
  status: 'pending' | 'completed'
  requires_photo: boolean
  requires_notes: boolean
  completed_at?: string
  completion_notes?: string
  completion_photos?: {
    id: string
    filename: string
    url: string
  }[]
}

interface WorkflowTaskCardProps {
  task: WorkflowTask
  canComplete?: boolean
  onTaskComplete: (taskId: string, completionData: {
    notes?: string
    photos?: File[]
  }) => Promise<void>
}

export default function WorkflowTaskCard({ 
  task, 
  canComplete = true, 
  onTaskComplete 
}: WorkflowTaskCardProps) {
  const [showCompletionModal, setShowCompletionModal] = useState(false)

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-slate-400" />
    }
  }

  const getStatusText = () => {
    switch (task.status) {
      case 'completed':
        return 'Completed'
      case 'pending':
        return 'Pending'
      default:
        return 'Not Started'
    }
  }

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-slate-50 border-slate-200 text-slate-600'
    }
  }

  return (
    <>
      <div className={`border rounded-lg p-4 transition-all duration-200 ${
        task.status === 'completed' 
          ? 'bg-green-50 border-green-200' 
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className={`font-medium mb-2 ${
              task.status === 'completed' ? 'text-green-900' : 'text-slate-900'
            }`}>
              {task.title}
            </h3>
            <p className={`text-sm ${
              task.status === 'completed' ? 'text-green-700' : 'text-slate-600'
            }`}>
              {task.description}
            </p>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </div>
        </div>

        {/* Requirements Indicators */}
        {(task.requires_photo || task.requires_notes) && (
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-medium text-slate-600">Requirements:</span>
            {task.requires_photo && (
              <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                <Camera className="h-3 w-3" />
                <span>Photo Required</span>
              </div>
            )}
            {task.requires_notes && (
              <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                <FileText className="h-3 w-3" />
                <span>Notes Required</span>
              </div>
            )}
          </div>
        )}

        {/* Completed Task Details */}
        {task.status === 'completed' && task.completed_at && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <div className="text-xs text-green-700 mb-2">
              Completed on {new Date(task.completed_at).toLocaleDateString()} at {new Date(task.completed_at).toLocaleTimeString()}
            </div>
            
            {task.completion_notes && (
              <div className="mb-2">
                <div className="text-xs font-medium text-green-800 mb-1">Notes:</div>
                <div className="text-sm text-green-700 bg-green-100 rounded p-2">
                  {task.completion_notes}
                </div>
              </div>
            )}

            {task.completion_photos && task.completion_photos.length > 0 && (
              <div>
                <div className="text-xs font-medium text-green-800 mb-2">
                  Photos ({task.completion_photos.length}):
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {task.completion_photos.map((photo, index) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt={`Completion photo ${index + 1}`}
                      className="w-16 h-16 object-cover rounded border border-green-300 cursor-pointer hover:border-green-400 transition-colors"
                      onClick={() => window.open(photo.url, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Complete Task Button */}
        {task.status !== 'completed' && canComplete && (
          <div className="mt-4 pt-3 border-t border-slate-200">
            <button
              onClick={() => setShowCompletionModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Complete Task
            </button>
          </div>
        )}

        {/* Pending Requirements Warning */}
        {task.status !== 'completed' && (task.requires_photo || task.requires_notes) && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800 text-xs">
              <AlertCircle className="h-3 w-3" />
              <span>
                This task requires {[
                  task.requires_photo && 'photo upload',
                  task.requires_notes && 'completion notes'
                ].filter(Boolean).join(' and ')} when completing
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Task Completion Modal */}
      <TaskCompletionModal
        task={{
          id: task.id,
          title: task.title,
          description: task.description,
          requires_photo: task.requires_photo,
          requires_notes: task.requires_notes
        }}
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onComplete={onTaskComplete}
      />
    </>
  )
}