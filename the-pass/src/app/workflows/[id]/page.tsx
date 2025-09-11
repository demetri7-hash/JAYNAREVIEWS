'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { 
  CheckCircle, 
  Circle, 
  Camera, 
  Star, 
  AlertTriangle,
  ArrowLeft,
  Save,
  Upload,
  MessageSquare
} from 'lucide-react'

interface WorksheetTask {
  id: number
  name: string
  task_description: string
  required: boolean
  photo_urls: string[]
  critical: boolean
  min_rating: number | null
  completed: boolean
  rating: number | null
  notes: string | null
}

interface Worksheet {
  id: string
  employee_id: string
  department: string
  shift_type: string
  checklist_data: WorksheetTask[]
  status: string
  completion_percentage: number
  started_at: string
  completed_at: string | null
}

export default function WorkflowExecution() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState<number | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchWorksheet()
  }, [session, params.id])

  const fetchWorksheet = async () => {
    try {
      const response = await fetch(`/api/worksheets/${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        setWorksheet(data.worksheet)
      } else {
        alert('Failed to load worksheet: ' + data.error)
        router.push('/')
      }
    } catch (error) {
      alert('Failed to load worksheet')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const updateTask = async (taskId: number, updates: Partial<WorksheetTask>) => {
    if (!worksheet) return

    setSaving(true)
    try {
      const updatedTasks = worksheet.checklist_data.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )

      const completedTasks = updatedTasks.filter(task => task.completed).length
      const completionPercentage = Math.round((completedTasks / updatedTasks.length) * 100)

      const response = await fetch(`/api/worksheets/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checklist_data: updatedTasks,
          completion_percentage: completionPercentage,
          status: completionPercentage === 100 ? 'completed' : 'in_progress'
        })
      })

      const data = await response.json()
      if (data.success) {
        setWorksheet(prev => prev ? {
          ...prev,
          checklist_data: updatedTasks,
          completion_percentage: completionPercentage,
          status: completionPercentage === 100 ? 'completed' : 'in_progress'
        } : null)
      } else {
        alert('Failed to update task: ' + data.error)
      }
    } catch (error) {
      alert('Failed to update task')
    } finally {
      setSaving(false)
    }
  }

  const toggleTaskCompletion = (taskId: number) => {
    const task = worksheet?.checklist_data.find(t => t.id === taskId)
    if (!task) return

    updateTask(taskId, { completed: !task.completed })
  }

  const updateTaskRating = (taskId: number, rating: number) => {
    updateTask(taskId, { rating })
  }

  const updateTaskNotes = (taskId: number, notes: string) => {
    updateTask(taskId, { notes })
  }

  const handlePhotoUpload = async (taskId: number, file: File) => {
    setUploadingPhoto(taskId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('task_id', taskId.toString())
      formData.append('worksheet_id', params.id as string)

      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        const task = worksheet?.checklist_data.find(t => t.id === taskId)
        if (task) {
          const updatedPhotoUrls = [...task.photo_urls, data.photo_url]
          updateTask(taskId, { photo_urls: updatedPhotoUrls })
        }
      } else {
        alert('Failed to upload photo: ' + data.error)
      }
    } catch (error) {
      alert('Failed to upload photo')
    } finally {
      setUploadingPhoto(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!worksheet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Worksheet not found</h2>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const completedTasks = worksheet.checklist_data.filter(task => task.completed).length
  const totalTasks = worksheet.checklist_data.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {worksheet.shift_type} - {worksheet.department}
                </h1>
                <p className="text-sm text-gray-500">
                  Started {new Date(worksheet.started_at).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {completedTasks}/{totalTasks} tasks completed ({worksheet.completion_percentage}%)
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${worksheet.completion_percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {worksheet.checklist_data.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-lg shadow p-6 ${
                task.critical ? 'border-l-4 border-red-500' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <button
                  onClick={() => toggleTaskCompletion(task.id)}
                  className={`mt-1 ${
                    task.completed
                      ? 'text-green-600 hover:text-green-700'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {task.completed ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3
                      className={`text-lg font-medium ${
                        task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {task.name}
                    </h3>
                    {task.critical && (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>

                  {task.task_description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {task.task_description}
                    </p>
                  )}

                  {/* Rating */}
                  {task.min_rating && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating (1-5)
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => updateTaskRating(task.id, rating)}
                            className={`${
                              task.rating && task.rating >= rating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            } hover:text-yellow-400`}
                          >
                            <Star className="h-5 w-5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Photo Upload */}
                  <div className="mt-3">
                    <div className="flex items-center space-x-2">
                      <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        {uploadingPhoto === task.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                        ) : (
                          <Camera className="h-4 w-4 mr-2" />
                        )}
                        Add Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handlePhotoUpload(task.id, file)
                            }
                          }}
                          disabled={uploadingPhoto === task.id}
                        />
                      </label>
                      {task.photo_urls.length > 0 && (
                        <span className="text-sm text-gray-500">
                          {task.photo_urls.length} photo(s) uploaded
                        </span>
                      )}
                    </div>

                    {/* Photo Gallery */}
                    {task.photo_urls.length > 0 && (
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {task.photo_urls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Task ${task.id} photo ${index + 1}`}
                            className="h-20 w-20 object-cover rounded-md border"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={task.notes || ''}
                      onChange={(e) => updateTaskNotes(task.id, e.target.value)}
                      placeholder="Add any notes or comments..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Complete Workflow Button */}
        {worksheet.completion_percentage === 100 && (
          <div className="mt-8 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-800 mb-2">
                🎉 Workflow Complete!
              </h3>
              <p className="text-green-600 mb-4">
                All tasks have been completed successfully.
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Saving Indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-md shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Saving...</span>
          </div>
        </div>
      )}
    </div>
  )
}
