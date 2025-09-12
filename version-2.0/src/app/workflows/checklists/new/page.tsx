'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Save, 
  Trash2, 
  GripVertical, 
  Clock, 
  Camera, 
  FileText, 
  AlertCircle,
  ArrowLeft 
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

interface Task {
  id: string
  title: string
  description: string
  estimated_minutes: number
  requires_photo: boolean
  requires_note: boolean
  is_critical: boolean
  sort_order: number
}

interface Checklist {
  id?: string
  name: string
  description: string
  department: 'FOH' | 'BOH' | 'BOTH'
  category: string
  tasks: Task[]
}

export default function ChecklistBuilder() {
  const { data: session } = useSession()
  const router = useRouter()
  const [checklist, setChecklist] = useState<Checklist>({
    name: '',
    description: '',
    department: 'BOTH',
    category: 'daily',
    tasks: []
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Check permissions
  useEffect(() => {
    if (!session?.user?.employee) return
    
    const userRole = session.user.employee.role
    if (!['manager', 'admin'].includes(userRole)) {
      router.push('/')
    }
  }, [session, router])

  const addTask = () => {
    const newTask: Task = {
      id: `temp-${Date.now()}`,
      title: '',
      description: '',
      estimated_minutes: 5,
      requires_photo: false,
      requires_note: false,
      is_critical: false,
      sort_order: checklist.tasks.length + 1
    }
    setChecklist(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }))
  }

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setChecklist(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    }))
    
    // Clear specific task errors
    if (errors[`task-${taskId}`]) {
      setErrors(prev => ({
        ...prev,
        [`task-${taskId}`]: ''
      }))
    }
  }

  const removeTask = (taskId: string) => {
    setChecklist(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
        .map((task, index) => ({ ...task, sort_order: index + 1 }))
    }))
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const tasks = Array.from(checklist.tasks)
    const [reorderedTask] = tasks.splice(result.source.index, 1)
    tasks.splice(result.destination.index, 0, reorderedTask)

    // Update sort orders
    const updatedTasks = tasks.map((task, index) => ({
      ...task,
      sort_order: index + 1
    }))

    setChecklist(prev => ({
      ...prev,
      tasks: updatedTasks
    }))
  }

  const validateChecklist = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!checklist.name.trim()) {
      newErrors.name = 'Checklist name is required'
    }

    if (checklist.tasks.length === 0) {
      newErrors.tasks = 'At least one task is required'
    }

    checklist.tasks.forEach((task, index) => {
      if (!task.title.trim()) {
        newErrors[`task-${task.id}`] = 'Task title is required'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveChecklist = async () => {
    if (!validateChecklist()) return

    setSaving(true)
    try {
      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...checklist,
          tasks: checklist.tasks.map(({ id, ...task }) => task) // Remove temp IDs
        })
      })

      const data = await response.json()
      
      if (data.success) {
        router.push('/workflows/checklists')
      } else {
        setErrors({ submit: data.error || 'Failed to save checklist' })
      }
    } catch (error) {
      setErrors({ submit: 'Network error occurred' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Checklist</h1>
              <p className="text-gray-600">Build workflows with drag-and-drop tasks</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/workflows/checklists')}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={saveChecklist}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Checklist'}</span>
            </button>
          </div>
        </div>

        {/* Checklist Details */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Checklist Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Checklist Name *
              </label>
              <input
                type="text"
                value={checklist.name}
                onChange={(e) => setChecklist(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Morning Opening Checklist"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={checklist.department}
                onChange={(e) => setChecklist(prev => ({ 
                  ...prev, 
                  department: e.target.value as 'FOH' | 'BOH' | 'BOTH' 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="BOTH">Both (FOH & BOH)</option>
                <option value="FOH">Front of House</option>
                <option value="BOH">Back of House</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={checklist.category}
                onChange={(e) => setChecklist(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="opening">Opening</option>
                <option value="closing">Closing</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="cleaning">Cleaning</option>
                <option value="inventory">Inventory</option>
                <option value="prep">Prep</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={checklist.description}
              onChange={(e) => setChecklist(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe when and how this checklist should be used..."
            />
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <button
              onClick={addTask}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </button>
          </div>

          {errors.tasks && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.tasks}</p>
            </div>
          )}

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {checklist.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border rounded-lg p-4 bg-gray-50 ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          } ${errors[`task-${task.id}`] ? 'border-red-300' : 'border-gray-200'}`}
                        >
                          <div className="flex items-start space-x-4">
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="mt-2 text-gray-400 hover:text-gray-600 cursor-grab"
                            >
                              <GripVertical className="h-5 w-5" />
                            </div>

                            {/* Task Content */}
                            <div className="flex-1 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <input
                                    type="text"
                                    value={task.title}
                                    onChange={(e) => updateTask(task.id, { title: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                      errors[`task-${task.id}`] ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Task title..."
                                  />
                                  {errors[`task-${task.id}`] && (
                                    <p className="mt-1 text-sm text-red-600">{errors[`task-${task.id}`]}</p>
                                  )}
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <input
                                    type="number"
                                    value={task.estimated_minutes}
                                    onChange={(e) => updateTask(task.id, { 
                                      estimated_minutes: parseInt(e.target.value) || 5 
                                    })}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                    min="1"
                                    max="120"
                                  />
                                  <span className="text-sm text-gray-600">minutes</span>
                                </div>
                              </div>

                              <textarea
                                value={task.description}
                                onChange={(e) => updateTask(task.id, { description: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Task description (optional)..."
                              />

                              {/* Task Options */}
                              <div className="flex flex-wrap items-center gap-4">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={task.requires_photo}
                                    onChange={(e) => updateTask(task.id, { requires_photo: e.target.checked })}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <Camera className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-700">Requires Photo</span>
                                </label>

                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={task.requires_note}
                                    onChange={(e) => updateTask(task.id, { requires_note: e.target.checked })}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <FileText className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-700">Requires Note</span>
                                </label>

                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={task.is_critical}
                                    onChange={(e) => updateTask(task.id, { is_critical: e.target.checked })}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                  />
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                  <span className="text-sm text-gray-700">Critical Task</span>
                                </label>
                              </div>
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={() => removeTask(task.id)}
                              className="mt-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {checklist.tasks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tasks yet. Click "Add Task" to get started.</p>
            </div>
          )}
        </div>

        {errors.submit && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}
      </div>
    </div>
  )
}
