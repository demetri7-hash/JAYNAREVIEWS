'use client'

import React, { useState } from 'react'
import { Check, Camera, Upload, X, FileText, Clock } from 'lucide-react'
import PhotoUpload from '@/components/PhotoUpload/PhotoUpload'

interface TaskCompletionProps {
  task: {
    id: string
    title: string
    description?: string
    is_required: boolean
    requires_photo: boolean
    requires_notes: boolean
    estimated_minutes?: number
  }
  workflowInstanceId: string
  onComplete: (completionData: {
    taskId: string
    isCompleted: boolean
    notes?: string
    photoUrls?: string[]
  }) => void
  isCompleted?: boolean
  existingNotes?: string
  existingPhotos?: string[]
  className?: string
}

export default function TaskCompletion({
  task,
  workflowInstanceId,
  onComplete,
  isCompleted = false,
  existingNotes = '',
  existingPhotos = [],
  className = ''
}: TaskCompletionProps) {
  const [completed, setCompleted] = useState(isCompleted)
  const [notes, setNotes] = useState(existingNotes)
  const [photoUrls, setPhotoUrls] = useState<string[]>(existingPhotos)
  const [showDetails, setShowDetails] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleToggleComplete = async () => {
    const newCompletedState = !completed

    // Validation for required fields
    if (newCompletedState) {
      if (task.requires_photo && photoUrls.length === 0) {
        alert('This task requires at least one photo to complete.')
        return
      }

      if (task.requires_notes && !notes.trim()) {
        alert('This task requires notes to complete.')
        return
      }
    }

    setSaving(true)

    try {
      await onComplete({
        taskId: task.id,
        isCompleted: newCompletedState,
        notes: notes.trim() || undefined,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined
      })

      setCompleted(newCompletedState)
    } catch (error) {
      console.error('Error updating task completion:', error)
      alert('Failed to update task. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleNotesChange = (value: string) => {
    setNotes(value)
    
    // Auto-save notes if task is already completed
    if (completed && value !== existingNotes) {
      const timeoutId = setTimeout(() => {
        onComplete({
          taskId: task.id,
          isCompleted: true,
          notes: value.trim() || undefined,
          photoUrls: photoUrls.length > 0 ? photoUrls : undefined
        })
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }

  const handlePhotosChange = (urls: string[]) => {
    setPhotoUrls(urls)
    
    // Auto-save photos if task is already completed
    if (completed) {
      onComplete({
        taskId: task.id,
        isCompleted: true,
        notes: notes.trim() || undefined,
        photoUrls: urls.length > 0 ? urls : undefined
      })
    }
  }

  const canComplete = !task.requires_photo || photoUrls.length > 0
  const hasRequiredNotes = !task.requires_notes || notes.trim().length > 0

  return (
    <div className={`bg-white border rounded-lg p-4 ${completed ? 'border-green-200 bg-green-50' : 'border-gray-200'} ${className}`}>
      {/* Task Header */}
      <div className="flex items-start space-x-3">
        {/* Completion Checkbox */}
        <button
          onClick={handleToggleComplete}
          disabled={saving || (!canComplete && !hasRequiredNotes)}
          className={`
            flex-shrink-0 mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
            ${completed 
              ? 'bg-green-600 border-green-600 text-white' 
              : canComplete && hasRequiredNotes
                ? 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
            }
            ${saving ? 'opacity-50' : ''}
          `}
        >
          {saving ? (
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
          ) : completed ? (
            <Check className="w-3 h-3" />
          ) : null}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-sm font-medium ${completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                {task.title}
                {task.is_required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              
              {task.description && (
                <p className="mt-1 text-sm text-gray-600">{task.description}</p>
              )}

              {/* Task Requirements */}
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {task.requires_photo && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full ${
                    photoUrls.length > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <Camera className="w-3 h-3 mr-1" />
                    Photo Required
                  </span>
                )}
                
                {task.requires_notes && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full ${
                    notes.trim() ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <FileText className="w-3 h-3 mr-1" />
                    Notes Required
                  </span>
                )}

                {task.estimated_minutes && (
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    <Clock className="w-3 h-3 mr-1" />
                    ~{task.estimated_minutes} min
                  </span>
                )}
              </div>
            </div>

            {/* Expand/Collapse Button */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-45' : 'rotate-0'}`} />
            </button>
          </div>

          {/* Expanded Details */}
          {showDetails && (
            <div className="mt-4 space-y-4 border-t pt-4">
              {/* Notes Section */}
              {(task.requires_notes || notes || completed) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes {task.requires_notes && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder={task.requires_notes ? "Required notes for this task..." : "Optional notes..."}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {/* Photo Upload Section */}
              {(task.requires_photo || photoUrls.length > 0 || completed) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Photos {task.requires_photo && <span className="text-red-500">*</span>}
                  </label>
                  <PhotoUpload
                    onPhotosChange={handlePhotosChange}
                    existingPhotos={photoUrls}
                    maxPhotos={3}
                    bucket="task-photos"
                    folder={`tasks/${workflowInstanceId}`}
                    required={task.requires_photo}
                    className="mt-2"
                  />
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex space-x-2 pt-2">
                {!completed && canComplete && hasRequiredNotes && (
                  <button
                    onClick={handleToggleComplete}
                    disabled={saving}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Mark Complete'}
                  </button>
                )}
                
                {completed && (
                  <button
                    onClick={handleToggleComplete}
                    disabled={saving}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Mark Incomplete'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}