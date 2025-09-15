'use client'

import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { ArrowLeft, Save, Plus, GripVertical, Trash2 } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  order_index: number
  estimated_minutes: number
  allow_notes: boolean
}

interface Checklist {
  id: string
  name: string
  description: string
  category: string
  tasks: Task[]
}

export default function EditChecklist() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [checklist, setChecklist] = useState<Checklist | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [draggedTask, setDraggedTask] = useState<number | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Check if user has manager permissions
    if (session.user?.employee?.role !== 'manager' && session.user?.employee?.role !== 'admin') {
      router.push('/')
      return
    }

    fetchChecklist()
  }, [session, status, router, params.id])

  const fetchChecklist = async () => {
    try {
      const response = await fetch(`/api/checklists/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setChecklist(data.checklist)
      } else {
        console.error('Failed to fetch checklist')
        router.push('/workflows/checklists')
      }
    } catch (error) {
      console.error('Error fetching checklist:', error)
      router.push('/workflows/checklists')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!checklist) return

    setSaving(true)
    try {
      const response = await fetch(`/api/checklists/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: checklist.name,
          description: checklist.description,
          category: checklist.category,
          tasks: checklist.tasks
        }),
      })

      if (response.ok) {
        router.push('/workflows/checklists')
      } else {
        console.error('Failed to update checklist')
      }
    } catch (error) {
      console.error('Error updating checklist:', error)
    } finally {
      setSaving(false)
    }
  }

  const addTask = () => {
    if (!checklist) return

    const newTask: Task = {
      id: `temp-${Date.now()}`,
      title: 'New Task',
      description: '',
      order_index: checklist.tasks.length,
      estimated_minutes: 15,
      allow_notes: false
    }

    setChecklist({
      ...checklist,
      tasks: [...checklist.tasks, newTask]
    })
  }

  const updateTask = (index: number, updates: Partial<Task>) => {
    if (!checklist) return

    const updatedTasks = [...checklist.tasks]
    updatedTasks[index] = { ...updatedTasks[index], ...updates }
    
    setChecklist({
      ...checklist,
      tasks: updatedTasks
    })
  }

  const deleteTask = (index: number) => {
    if (!checklist) return

    const updatedTasks = checklist.tasks.filter((_, i) => i !== index)
    // Reorder indices
    updatedTasks.forEach((task, i) => {
      task.order_index = i
    })

    setChecklist({
      ...checklist,
      tasks: updatedTasks
    })
  }

  const handleDragStart = (index: number) => {
    setDraggedTask(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    
    if (draggedTask === null || draggedTask === targetIndex || !checklist) return

    const updatedTasks = [...checklist.tasks]
    const draggedItem = updatedTasks[draggedTask]
    
    // Remove dragged item
    updatedTasks.splice(draggedTask, 1)
    
    // Insert at new position
    if (draggedTask < targetIndex) {
      updatedTasks.splice(targetIndex - 1, 0, draggedItem)
    } else {
      updatedTasks.splice(targetIndex, 0, draggedItem)
    }
    
    // Update order indices
    updatedTasks.forEach((task, index) => {
      task.order_index = index
    })
    
    setChecklist({
      ...checklist,
      tasks: updatedTasks
    })
    
    setDraggedTask(null)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading checklist...</p>
        </div>
      </div>
    )
  }

  if (!checklist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Checklist not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Edit Checklist: {checklist.name}
              </h1>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Checklist Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Checklist Name
              </label>
              <input
                type="text"
                value={checklist.name}
                onChange={(e) => setChecklist({ ...checklist, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={checklist.category}
                onChange={(e) => setChecklist({ ...checklist, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Opening">Opening</option>
                <option value="Closing">Closing</option>
                <option value="Prep">Prep</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Inventory">Inventory</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={checklist.description || ''}
              onChange={(e) => setChecklist({ ...checklist, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Optional description..."
            />
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
            <button
              onClick={addTask}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </button>
          </div>

          <div className="space-y-4">
            {checklist.tasks.map((task, index) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 cursor-move"
              >
                <div className="flex items-start space-x-3">
                  <GripVertical className="h-5 w-5 text-gray-400 mt-2" />
                  
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => updateTask(index, { title: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Task title"
                      />
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={task.estimated_minutes}
                          onChange={(e) => updateTask(index, { estimated_minutes: parseInt(e.target.value) || 15 })}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          min="1"
                          max="120"
                        />
                        <span className="text-sm text-gray-500">minutes</span>
                      </div>
                    </div>

                    <textarea
                      value={task.description}
                      onChange={(e) => updateTask(index, { description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Task description (optional)"
                      rows={2}
                    />

                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={task.allow_notes}
                          onChange={(e) => updateTask(index, { allow_notes: e.target.checked })}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Allow notes</span>
                      </label>

                      <button
                        onClick={() => deleteTask(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {checklist.tasks.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No tasks yet. Click "Add Task" to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
