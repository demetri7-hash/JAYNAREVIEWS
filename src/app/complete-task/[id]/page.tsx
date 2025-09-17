'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, Clock, FileText, Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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
}

export default function CompleteTask() {
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment()
    }
  }, [assignmentId])

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch assignment details')
      }

      const data = await response.json()
      setAssignment(data.assignment)
    } catch (error) {
      console.error('Error fetching assignment:', error)
      setError(error instanceof Error ? error.message : 'Failed to load assignment')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPhotos([file]) // Only allow one photo for simplicity
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotos([])
    setPhotoPreview(null)
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const uploadPhotoToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `task-completions/${fileName}`

      const { data, error } = await supabase.storage
        .from('task-photos')
        .upload(filePath, file)

      if (error) {
        console.error('Error uploading photo:', error)
        return null
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('task-photos')
        .getPublicUrl(filePath)

      return urlData.publicUrl
    } catch (error) {
      console.error('Error in photo upload:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    // Validation
    if (assignment?.task.requires_notes && !notes.trim()) {
      setError('Notes are required for this task')
      setSubmitting(false)
      return
    }

    if (assignment?.task.requires_photo && photos.length === 0) {
      setError('At least one photo is required for this task')
      setSubmitting(false)
      return
    }

    try {
      let photoUrl = null
      
      // Upload photo to Supabase Storage if provided
      if (photos.length > 0) {
        photoUrl = await uploadPhotoToStorage(photos[0])
        if (!photoUrl) {
          setError('Failed to upload photo. Please try again.')
          setSubmitting(false)
          return
        }
      }

      const response = await fetch(`/api/assignments/${assignmentId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: notes.trim() || null,
          photo_url: photoUrl,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to complete task')
      }

      // Success - redirect back to My Tasks
      router.push('/my-tasks')
    } catch (error) {
      console.error('Error completing task:', error)
      setError(error instanceof Error ? error.message : 'Failed to complete task')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDueDate = (dateString: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading assignment...</p>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 brand-header">Assignment Not Found</h2>
          <p className="text-slate-600 mb-6 brand-subtitle">The assignment you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/my-tasks')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25"
          >
            Back to My Tasks
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in-up">
          <button
            onClick={() => router.back()}
            className="group flex items-center text-slate-600 hover:text-slate-900 transition-all duration-200 bg-white/70 hover:bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to My Tasks
          </button>
        </div>

        <div className="glass rounded-3xl p-8 animate-fade-in-scale">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-2 brand-header">Complete Task</h1>
              <p className="text-slate-600 brand-subtitle">Mark this task as completed</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 animate-fade-in-up">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Task Details */}
          <div className="bg-white/50 rounded-2xl p-6 mb-8 border border-white/20">
            <h3 className="text-xl font-bold text-slate-900 mb-3 brand-header">{assignment.task.title}</h3>
            {assignment.task.description && (
              <p className="text-slate-600 mb-4 leading-relaxed">{assignment.task.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center bg-blue-100 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-blue-700 font-medium">Due: {formatDueDate(assignment.due_date)}</span>
              </div>
              <div className="flex items-center bg-purple-100 px-3 py-2 rounded-lg">
                <span className="text-purple-700 font-medium capitalize">{assignment.recurrence}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Notes Section */}
            {assignment.task.requires_notes && (
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Completion Notes *
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what you did, any issues encountered, etc."
                  required={assignment.task.requires_notes}
                />
              </div>
            )}

            {/* Photos Section */}
            {assignment.task.requires_photo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Camera className="w-4 h-4 inline mr-1" />
                  Upload Photo *
                </label>
                <div className="space-y-4">
                  {/* Mobile-First Camera Button */}
                  <div className="flex flex-col space-y-3">
                    <label
                      htmlFor="camera"
                      className="flex items-center justify-center w-full py-4 px-4 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-400 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <span className="text-lg font-medium text-blue-700">Take Photo</span>
                        <p className="text-sm text-blue-600 mt-1">Tap to open camera</p>
                      </div>
                    </label>
                    <input
                      type="file"
                      id="camera"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                    
                    <label
                      htmlFor="gallery"
                      className="flex items-center justify-center w-full py-3 px-4 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-center">
                        <span className="text-base font-medium text-gray-700">Choose from Gallery</span>
                        <p className="text-sm text-gray-500 mt-1">Select existing photo</p>
                      </div>
                    </label>
                    <input
                      type="file"
                      id="gallery"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </div>
                  
                  {/* Photo Preview */}
                  {photoPreview && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">Photo Preview:</p>
                      <div className="relative inline-block">
                        <img
                          src={photoPreview}
                          alt="Photo preview"
                          className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
                          style={{ maxHeight: '300px' }}
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Optional Notes for non-required tasks */}
            {!assignment.task.requires_notes && (
              <div>
                <label htmlFor="optional_notes" className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="optional_notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional comments or observations..."
                />
              </div>
            )}

            {/* Optional Photo for non-required tasks */}
            {!assignment.task.requires_photo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Camera className="w-4 h-4 inline mr-1" />
                  Add Photo (Optional)
                </label>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-3">
                    <label
                      htmlFor="optional-camera"
                      className="flex items-center justify-center w-full py-3 px-4 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 bg-gray-50 hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-center">
                        <Camera className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                        <span className="text-base font-medium text-gray-700">Take Photo</span>
                      </div>
                    </label>
                    <input
                      type="file"
                      id="optional-camera"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                    
                    <label
                      htmlFor="optional-gallery"
                      className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-600">Choose from Gallery</span>
                    </label>
                    <input
                      type="file"
                      id="optional-gallery"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </div>
                  
                  {photoPreview && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Photo Preview:</p>
                      <div className="relative inline-block">
                        <img
                          src={photoPreview}
                          alt="Photo preview"
                          className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
                          style={{ maxHeight: '300px' }}
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}