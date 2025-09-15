'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  Eye,
  Edit,
  Copy
} from 'lucide-react'

interface Task {
  id?: string
  title: string
  description: string
  order_index: number
  estimated_minutes: number
  allow_notes: boolean
}

interface Checklist {
  id?: string
  name: string
  description: string
  category: string
  tasks: Task[]
}

export default function ChecklistsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newChecklist, setNewChecklist] = useState<Checklist>({
    name: '',
    description: '',
    category: 'Opening',
    tasks: []
  })

  // Check if user is manager
  const isManager = session?.user?.employee?.role === 'manager' || session?.user?.employee?.role === 'admin'

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (!isManager) {
      router.push('/')
      return
    }

    fetchChecklists()
  }, [session, isManager, router])

  const fetchChecklists = async () => {
    try {
      const response = await fetch('/api/checklists')
      const data = await response.json()
      
      if (data.success) {
        setChecklists(data.checklists)
      } else {
        console.error('Failed to fetch checklists:', data.error)
      }
    } catch (error) {
      console.error('Error fetching checklists:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTask = () => {
    const newTask: Task = {
      title: '',
      description: '',
      order_index: newChecklist.tasks.length + 1,
      estimated_minutes: 15,
      allow_notes: false
    }
    setNewChecklist({
      ...newChecklist,
      tasks: [...newChecklist.tasks, newTask]
    })
  }

  const updateTask = (index: number, field: keyof Task, value: string | number | boolean) => {
    const updatedTasks = [...newChecklist.tasks]
    updatedTasks[index] = { ...updatedTasks[index], [field]: value }
    setNewChecklist({ ...newChecklist, tasks: updatedTasks })
  }

  const removeTask = (index: number) => {
    const updatedTasks = newChecklist.tasks.filter((_, i) => i !== index)
    // Reorder tasks
    updatedTasks.forEach((task, i) => {
      task.order_index = i + 1
    })
    setNewChecklist({ ...newChecklist, tasks: updatedTasks })
  }

  const moveTask = (fromIndex: number, toIndex: number) => {
    const updatedTasks = [...newChecklist.tasks]
    const [movedTask] = updatedTasks.splice(fromIndex, 1)
    updatedTasks.splice(toIndex, 0, movedTask)
    
    // Update order indices
    updatedTasks.forEach((task, i) => {
      task.order_index = i + 1
    })
    
    setNewChecklist({ ...newChecklist, tasks: updatedTasks })
  }

  const saveChecklist = async () => {
    try {
      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChecklist)
      })

      const data = await response.json()
      
      if (data.success) {
        setChecklists([...checklists, data.checklist])
        setNewChecklist({
          name: '',
          description: '',
          category: 'Opening',
          tasks: []
        })
        setIsEditing(false)
        alert('Checklist saved successfully!')
      } else {
        alert('Failed to save checklist: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving checklist:', error)
      alert('Error saving checklist')
    }
  }

  const startEditing = (checklist?: Checklist) => {
    if (checklist) {
      setNewChecklist(checklist)
    } else {
      setNewChecklist({
        name: '',
        description: '',
        category: 'Opening',
        tasks: []
      })
    }
    setIsEditing(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checklist Builder</h1>
          <p className="text-gray-600 mt-2">Create and manage workflow checklists</p>
        </div>

        {!isEditing ? (
          // Checklist List View
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Checklists</h2>
              <button
                onClick={() => startEditing()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Checklist
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {checklists.map((checklist) => (
                <div key={checklist.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{checklist.name}</h3>
                      <p className="text-sm text-gray-500">{checklist.category}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {checklist.tasks?.length || 0} tasks
                    </span>
                  </div>
                  
                  {checklist.description && (
                    <p className="text-sm text-gray-600 mb-4">{checklist.description}</p>
                  )}
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedChecklist(checklist)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => startEditing(checklist)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Checklist Builder/Editor
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  {newChecklist.id ? 'Edit Checklist' : 'Create New Checklist'}
                </h2>
                <div className="space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveChecklist}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Checklist Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Checklist Name *
                  </label>
                  <input
                    type="text"
                    value={newChecklist.name}
                    onChange={(e) => setNewChecklist({ ...newChecklist, name: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., Opening Checklist"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={newChecklist.category}
                    onChange={(e) => setNewChecklist({ ...newChecklist, category: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="Opening">Opening</option>
                    <option value="Closing">Closing</option>
                    <option value="Prep">Prep</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newChecklist.description}
                    onChange={(e) => setNewChecklist({ ...newChecklist, description: e.target.value })}
                    rows={3}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Describe this checklist..."
                  />
                </div>
              </div>

              {/* Tasks */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Tasks</h3>
                  <button
                    onClick={addTask}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </button>
                </div>

                <div className="space-y-4">
                  {newChecklist.tasks.map((task, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Task Title *
                              </label>
                              <input
                                type="text"
                                value={task.title}
                                onChange={(e) => updateTask(index, 'title', e.target.value)}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="e.g., Turn on equipment"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estimated Minutes
                              </label>
                              <input
                                type="number"
                                value={task.estimated_minutes}
                                onChange={(e) => updateTask(index, 'estimated_minutes', parseInt(e.target.value) || 0)}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                min="1"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={task.description}
                              onChange={(e) => updateTask(index, 'description', e.target.value)}
                              rows={2}
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Detailed instructions..."
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={task.allow_notes}
                                onChange={(e) => updateTask(index, 'allow_notes', e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                              />
                              <span className="ml-2 text-sm text-gray-700">Allow notes on this task</span>
                            </label>
                            
                            <button
                              onClick={() => removeTask(index)}
                              className="inline-flex items-center p-1 border border-transparent rounded-md text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {newChecklist.tasks.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p>No tasks added yet. Click "Add Task" to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Checklist Preview Modal */}
        {selectedChecklist && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">{selectedChecklist.name}</h3>
                <button
                  onClick={() => setSelectedChecklist(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Plus className="h-6 w-6 transform rotate-45" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">{selectedChecklist.description}</p>
                <p className="text-xs text-gray-500 mt-1">Category: {selectedChecklist.category}</p>
              </div>

              <div className="space-y-3">
                {selectedChecklist.tasks?.map((task, index) => (
                  <div key={index} className="border border-gray-200 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 ml-4">{task.estimated_minutes}m</span>
                    </div>
                    {task.allow_notes && (
                      <p className="text-xs text-indigo-600 mt-2">📝 Notes allowed</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
