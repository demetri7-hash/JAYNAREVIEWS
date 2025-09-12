'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Camera, FileText, Clock, User, AlertCircle, RefreshCw } from 'lucide-react'
import TaskCompletion from './TaskCompletion'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Task {
  id: string
  title: string
  description?: string
  is_required: boolean
  requires_photo: boolean
  requires_notes: boolean
  estimated_minutes?: number
  sequence_order: number
}

interface TaskCompletionData {
  id: string
  task_id: string
  completed_at: string
  completion_notes?: string
  photo_urls: string[]
  completed_by_user: {
    first_name: string
    last_name: string
    email: string
  }
}

interface ChecklistProps {
  templateId: string
  instanceId: string
  title: string
  description?: string
  onComplete?: () => void
  className?: string
}

export default function Checklist({
  templateId,
  instanceId,
  title,
  description,
  onComplete,
  className = ''
}: ChecklistProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<{ [taskId: string]: TaskCompletionData }>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load tasks and completions
  useEffect(() => {
    loadChecklistData()
  }, [templateId, instanceId])

  const loadChecklistData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load workflow tasks using correct table name
      const { data: tasksData, error: tasksError } = await supabase
        .from('workflow_tasks')
        .select('*')
        .eq('template_id', templateId)
        .order('order_index')

      if (tasksError) throw tasksError

      // Load existing completions for this workflow instance using correct table name
      const { data: completionsData, error: completionsError } = await supabase
        .from('task_completions')
        .select(`
          *,
          completed_by_user:users!completed_by(first_name, last_name, email)
        `)
        .eq('workflow_instance_id', instanceId)

      if (completionsError) throw completionsError

      setTasks(tasksData || [])
      
      // Convert completions array to lookup object
      const completionsLookup = (completionsData || []).reduce((acc: { [taskId: string]: TaskCompletionData }, completion: any) => {
        acc[completion.task_id] = completion
        return acc
      }, {} as { [taskId: string]: TaskCompletionData })
      
      setCompletions(completionsLookup)
    } catch (err) {
      console.error('Error loading checklist data:', err)
      setError('Failed to load checklist. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCompletion = async (completionData: {
    taskId: string
    isCompleted: boolean
    notes?: string
    photoUrls?: string[]
  }) => {
    try {
      setSaving(completionData.taskId)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (completionData.isCompleted) {
        // Create or update completion using correct field names
        const completionRecord = {
          workflow_instance_id: instanceId,
          task_id: completionData.taskId,
          completed_by: user.id,
          completed_at: new Date().toISOString(),
          completion_notes: completionData.notes,
          photo_urls: completionData.photoUrls || []
        }

        const { data, error } = await supabase
          .from('task_completions')
          .upsert(completionRecord, {
            onConflict: 'workflow_instance_id,task_id'
          })
          .select(`
            *,
            completed_by_user:users!completed_by(first_name, last_name, email)
          `)
          .single()

        if (error) throw error

        // Update local state
        setCompletions(prev => ({
          ...prev,
          [completionData.taskId]: data
        }))
      } else {
        // Remove completion using correct field names
        const { error } = await supabase
          .from('task_completions')
          .delete()
          .eq('workflow_instance_id', instanceId)
          .eq('task_id', completionData.taskId)

        if (error) throw error

        // Update local state
        setCompletions(prev => {
          const updated = { ...prev }
          delete updated[completionData.taskId]
          return updated
        })
      }

      // Check if all required tasks are complete
      const requiredTasks = tasks.filter(task => task.is_required)
      const completedRequiredTasks = requiredTasks.filter(task => completions[task.id] || completionData.taskId === task.id && completionData.isCompleted)
      
      if (completedRequiredTasks.length === requiredTasks.length && onComplete) {
        setTimeout(onComplete, 500) // Small delay to show completion state
      }
    } catch (err) {
      console.error('Error updating task completion:', err)
      setError('Failed to update task. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  const getProgress = () => {
    const completedTasks = Object.keys(completions).length
    const totalTasks = tasks.length
    const requiredTasks = tasks.filter(task => task.is_required).length
    const completedRequiredTasks = tasks.filter(task => task.is_required && completions[task.id]).length

    return {
      completed: completedTasks,
      total: totalTasks,
      required: requiredTasks,
      completedRequired: completedRequiredTasks,
      percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    }
  }

  const progress = getProgress()
  const allRequiredComplete = progress.completedRequired === progress.required

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-gray-600">Loading checklist...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button
          onClick={loadChecklistData}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-bold ${allRequiredComplete ? 'text-green-600' : 'text-gray-900'}`}>
              {progress.percentage}%
            </div>
            <div className="text-sm text-gray-500">
              {progress.completed} of {progress.total} tasks
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{progress.completedRequired} of {progress.required} required</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                allRequiredComplete ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          {allRequiredComplete && (
            <div className="mt-2 flex items-center text-green-600 text-sm">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              All required tasks completed!
            </div>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="p-6 space-y-4">
        {tasks.map((task) => {
          const completion = completions[task.id]
          const isSaving = saving === task.id

          return (
            <TaskCompletion
              key={task.id}
              task={task}
              workflowInstanceId={instanceId}
              onComplete={handleTaskCompletion}
              isCompleted={!!completion}
              existingNotes={completion?.completion_notes}
              existingPhotos={completion?.photo_urls || []}
              className={isSaving ? 'opacity-75' : ''}
            />
          )
        })}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Circle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No tasks in this checklist yet.</p>
          </div>
        )}
      </div>

      {/* Summary */}
      {tasks.length > 0 && (
        <div className="p-6 border-t bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>{progress.completed} Completed</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4 text-blue-500" />
              <span>{tasks.filter(t => t.requires_photo).length} Photo Required</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-purple-500" />
              <span>{tasks.filter(t => t.requires_notes).length} Notes Required</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}