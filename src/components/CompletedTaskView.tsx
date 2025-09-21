'use client'

import { useState } from 'react'
import { Calendar, User, Camera, FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

interface TaskCompletion {
  id: string
  task_id: string
  task_title: string
  completed_by: {
    id: string
    name: string
    role: string
  }
  completed_at: string
  notes?: string
  photos?: {
    id: string
    filename: string
    url: string
    uploaded_at: string
  }[]
}

interface CompletedTaskViewProps {
  completions: TaskCompletion[]
  loading?: boolean
}

export default function CompletedTaskView({ completions, loading }: CompletedTaskViewProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  const toggleExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const openImageModal = (imageUrl: string) => {
    window.open(imageUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (completions.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Completed Tasks</h3>
        <p className="text-slate-600">Completed tasks with notes and photos will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {completions.map((completion) => {
        const isExpanded = expandedTasks.has(completion.id)
        const hasNotes = completion.notes && completion.notes.trim().length > 0
        const hasPhotos = completion.photos && completion.photos.length > 0

        return (
          <div key={completion.id} className="bg-white rounded-lg border border-slate-200 shadow-sm">
            {/* Header */}
            <div 
              className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => toggleExpanded(completion.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 mb-2">{completion.task_title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{completion.completed_by.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(completion.completed_at).toLocaleDateString()} at {new Date(completion.completed_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Indicators */}
                  <div className="flex items-center gap-2">
                    {hasNotes && (
                      <div className="flex items-center gap-1 text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-xs">
                        <FileText className="h-3 w-3" />
                        <span>Notes</span>
                      </div>
                    )}
                    {hasPhotos && (
                      <div className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
                        <Camera className="h-3 w-3" />
                        <span>{completion.photos?.length} Photo{(completion.photos?.length || 0) > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Expand/Collapse Button */}
                  {(hasNotes || hasPhotos) && (
                    <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (hasNotes || hasPhotos) && (
              <div className="border-t border-slate-200 p-4 bg-slate-50">
                <div className="space-y-4">
                  {/* Notes Section */}
                  {hasNotes && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium text-slate-900">Notes</h4>
                      </div>
                      <div className="bg-white rounded-lg border border-slate-200 p-3">
                        <p className="text-slate-700 whitespace-pre-wrap">{completion.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Photos Section */}
                  {hasPhotos && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Camera className="h-4 w-4 text-green-600" />
                        <h4 className="font-medium text-slate-900">
                          Photos ({completion.photos?.length})
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {completion.photos?.map((photo, index) => (
                          <div key={photo.id} className="relative group cursor-pointer">
                            <img
                              src={photo.url}
                              alt={`Task completion photo ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                              onClick={() => openImageModal(photo.url)}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                              <ExternalLink className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                              {photo.filename.length > 15 ? `${photo.filename.substring(0, 15)}...` : photo.filename}
                            </div>
                            <div className="absolute top-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No Additional Content Message */}
            {!hasNotes && !hasPhotos && (
              <div className="border-t border-slate-200 p-4 bg-slate-50">
                <p className="text-sm text-slate-500 italic text-center">
                  Task completed without additional notes or photos
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}