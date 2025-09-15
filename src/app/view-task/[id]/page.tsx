'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Calendar, Clock, FileText, Camera, User } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string | null
  requires_notes: boolean
  requires_photo: boolean
  created_at: string
}

interface Assignment {
  id: string
  task_id: string
  due_date: string
  status: 'pending' | 'completed' | 'overdue'
  recurrence: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'once'
  task: Task
  completion?: {
    id: string
    notes: string | null
    photo_url: string | null
    completed_at: string
    completed_by: {
      name: string
      email: string
    }
  }
}

export default function ViewTask({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTaskDetails()
  }, [params.id])

  const fetchTaskDetails = async () => {
    try {
      const response = await fetch(`/api/assignments/${params.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch task details')
      }

      const data = await response.json()
      setAssignment(data.assignment)
    } catch (error) {
      console.error('Error fetching task details:', error)
      setError(error instanceof Error ? error.message : 'Failed to load task details')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      timeZone: 'America/Los_Angeles',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Task not found'}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Tasks
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-green-50 border-b border-green-200 p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{assignment.task.title}</h1>
                <p className="text-green-700 font-medium">Task Completed</p>
              </div>
            </div>
          </div>

          {/* Task Details */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Task Details</h2>
            
            {assignment.task.description && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{assignment.task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="font-medium mr-2">Due Date:</span>
                {formatDueDate(assignment.due_date)}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span className="font-medium mr-2">Recurrence:</span>
                <span className="capitalize">{assignment.recurrence}</span>
              </div>

              {assignment.task.requires_notes && (
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="w-4 h-4 mr-2" />
                  Notes required
                </div>
              )}

              {assignment.task.requires_photo && (
                <div className="flex items-center text-sm text-gray-600">
                  <Camera className="w-4 h-4 mr-2" />
                  Photo required
                </div>
              )}
            </div>
          </div>

          {/* Completion Details */}
          {assignment.completion && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Completion Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-medium mr-2">Completed by:</span>
                  {assignment.completion.completed_by.name}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="font-medium mr-2">Completed at:</span>
                  {formatDateTime(assignment.completion.completed_at)}
                </div>

                {assignment.completion.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-gray-700 whitespace-pre-wrap">{assignment.completion.notes}</p>
                    </div>
                  </div>
                )}

                {assignment.completion.photo_url && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Photo</h3>
                    <div className="bg-gray-50 rounded-md p-3">
                      <img 
                        src={assignment.completion.photo_url} 
                        alt="Task completion photo"
                        className="max-w-full h-auto rounded-md shadow-sm"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}