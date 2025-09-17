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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading task details...</p>
        </div>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 brand-header">Error</h2>
          <p className="text-slate-600 mb-6 brand-subtitle">{error || 'Task not found'}</p>
          <button
            onClick={() => router.back()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in-up">
          <button
            onClick={() => router.back()}
            className="group flex items-center text-slate-600 hover:text-slate-900 transition-all duration-200 bg-white/70 hover:bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to My Tasks
          </button>
        </div>

        <div className="glass rounded-3xl border border-white/20 overflow-hidden animate-fade-in-scale">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-green-200/50 p-8">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2 brand-header">{assignment.task.title}</h1>
                <p className="text-green-700 font-medium text-lg">Task Completed ✨</p>
              </div>
            </div>
          </div>

          {/* Task Details */}
          <div className="p-8 border-b border-white/10">
            <h2 className="text-xl font-bold text-slate-900 mb-6 brand-header">Task Details</h2>
            
            {assignment.task.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Description</h3>
                <div className="bg-white/50 rounded-xl p-4 border border-white/20">
                  <p className="text-slate-600 leading-relaxed">{assignment.task.description}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center bg-slate-100 px-4 py-3 rounded-xl">
                <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                <div>
                  <span className="text-sm font-medium text-slate-700">Due Date</span>
                  <p className="text-slate-900 font-medium">{formatDueDate(assignment.due_date)}</p>
                </div>
              </div>
              
              <div className="flex items-center bg-slate-100 px-4 py-3 rounded-xl">
                <Clock className="w-5 h-5 mr-3 text-purple-500" />
                <div>
                  <span className="text-sm font-medium text-slate-700">Recurrence</span>
                  <p className="text-slate-900 font-medium capitalize">{assignment.recurrence}</p>
                </div>
              </div>

              {assignment.task.requires_notes && (
                <div className="flex items-center bg-blue-100 px-4 py-3 rounded-xl">
                  <FileText className="w-5 h-5 mr-3 text-blue-500" />
                  <span className="text-blue-700 font-medium">Notes required</span>
                </div>
              )}

              {assignment.task.requires_photo && (
                <div className="flex items-center bg-purple-100 px-4 py-3 rounded-xl">
                  <Camera className="w-5 h-5 mr-3 text-purple-500" />
                  <span className="text-purple-700 font-medium">Photo required</span>
                </div>
              )}
            </div>
          </div>

          {/* Completion Details */}
          {assignment.completion && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 brand-header">Completion Details</h2>
              
              <div className="space-y-6">
                <div className="flex items-center bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 rounded-xl">
                  <User className="w-5 h-5 mr-3 text-blue-500" />
                  <div>
                    <span className="text-sm font-medium text-slate-700">Completed by</span>
                    <p className="text-slate-900 font-medium">{assignment.completion.completed_by.name}</p>
                  </div>
                </div>

                <div className="flex items-center bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 rounded-xl">
                  <Clock className="w-5 h-5 mr-3 text-green-500" />
                  <div>
                    <span className="text-sm font-medium text-slate-700">Completed at</span>
                    <p className="text-slate-900 font-medium">{formatDateTime(assignment.completion.completed_at)}</p>
                  </div>
                </div>

                {assignment.completion.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Notes</h3>
                    <div className="bg-white/50 rounded-xl p-6 border border-white/20">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{assignment.completion.notes}</p>
                    </div>
                  </div>
                )}

                {assignment.completion.photo_url && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Photo</h3>
                    <div className="bg-white/50 rounded-xl p-6 border border-white/20">
                      <img 
                        src={assignment.completion.photo_url} 
                        alt="Task completion photo"
                        className="max-w-full h-auto rounded-xl shadow-lg"
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