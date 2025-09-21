'use client'

import { useState, useRef } from 'react'
import { X, Camera, FileText, Upload, AlertCircle, CheckCircle } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  requires_photo: boolean
  requires_notes: boolean
}

interface TaskCompletionModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onComplete: (taskId: string, completionData: {
    notes?: string
    photos?: File[]
  }) => Promise<void>
}

export default function TaskCompletionModal({ 
  task, 
  isOpen, 
  onClose, 
  onComplete 
}: TaskCompletionModalProps) {
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setPhotos(prev => [...prev, ...files])
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleComplete = async () => {
    setError(null)

    // Validate required fields
    if (task.requires_notes && !notes.trim()) {
      setError('Notes are required for this task')
      return
    }

    if (task.requires_photo && photos.length === 0) {
      setError('Photo is required for this task')
      return
    }

    try {
      setSubmitting(true)
      await onComplete(task.id, {
        notes: notes.trim() || undefined,
        photos: photos.length > 0 ? photos : undefined
      })
      
      // Reset form
      setNotes('')
      setPhotos([])
      onClose()
    } catch (err) {
      setError('Failed to complete task. Please try again.')
      console.error('Error completing task:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Complete Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Task Details */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 mb-2">{task.title}</h3>
            <p className="text-sm text-slate-600">{task.description}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Notes Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-slate-600" />
              <label className="block text-sm font-medium text-slate-700">
                Notes
                {task.requires_notes && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 h-32 resize-none ${
                task.requires_notes ? 'border-slate-300' : 'border-slate-200'
              } focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200`}
              placeholder={task.requires_notes ? "Notes are required for this task..." : "Add any notes or observations (optional)"}
              required={task.requires_notes}
            />
            {task.requires_notes && (
              <p className="text-xs text-slate-500 mt-1">Notes are required to complete this task</p>
            )}
          </div>

          {/* Photos Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Camera className="h-5 w-5 text-slate-600" />
              <label className="block text-sm font-medium text-slate-700">
                Photos
                {task.requires_photo && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>

            {/* Photo Upload Button */}
            <div className="space-y-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-lg p-6 hover:bg-slate-50 transition-colors ${
                  task.requires_photo ? 'border-slate-300' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {task.requires_photo ? 'Upload required photos' : 'Upload photos (optional)'}
                  </span>
                  <span className="text-xs text-slate-500">
                    Click to select images or drag and drop
                  </span>
                </div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {task.requires_photo && (
                <p className="text-xs text-slate-500">At least one photo is required to complete this task</p>
              )}
            </div>

            {/* Uploaded Photos Preview */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-slate-200"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {photo.name.length > 15 ? `${photo.name.substring(0, 15)}...` : photo.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Requirements Summary */}
          {(task.requires_photo || task.requires_notes) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Task Requirements</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                {task.requires_notes && (
                  <li className="flex items-center gap-2">
                    {notes.trim() ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    )}
                    Notes are required
                  </li>
                )}
                {task.requires_photo && (
                  <li className="flex items-center gap-2">
                    {photos.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    )}
                    Photo is required
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={submitting || (task.requires_notes && !notes.trim()) || (task.requires_photo && photos.length === 0)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            {submitting ? 'Completing...' : 'Complete Task'}
          </button>
        </div>
      </div>
    </div>
  )
}