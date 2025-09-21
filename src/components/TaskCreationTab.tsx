'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, Users, MapPin, AlertCircle, CheckCircle } from 'lucide-react'

interface User {
  id: string
  name: string
  department: string
  role: string
}

interface TaskTemplate {
  id: string
  title: string
  description: string
  department: string
  estimated_duration: number
  priority: 'low' | 'medium' | 'high'
}

interface NewTask {
  title: string
  description: string
  assigned_to: string
  department: string
  location: string
  priority: 'low' | 'medium' | 'high'
  due_date: string
  estimated_duration: number
  instructions: string
  template_id?: string
}

export default function TaskCreationTab() {
  const [users, setUsers] = useState<User[]>([])
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null)

  const [newTask, setNewTask] = useState<NewTask>({
    title: '',
    description: '',
    assigned_to: '',
    department: '',
    location: '',
    priority: 'medium',
    due_date: '',
    estimated_duration: 30,
    instructions: ''
  })

  const [bulkTasks, setBulkTasks] = useState<Partial<NewTask>[]>([{
    assigned_to: '',
    due_date: '',
    instructions: ''
  }])

  const departments = ['Kitchen', 'Front of House', 'Management', 'Cleaning', 'Prep']
  const locations = ['Main Kitchen', 'Prep Area', 'Dining Room', 'Bar', 'Storage', 'Office', 'Exterior']

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersRes, templatesRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/task-templates')
      ])

      if (!usersRes.ok || !templatesRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [usersData, templatesData] = await Promise.all([
        usersRes.json(),
        templatesRes.json()
      ])

      setUsers(usersData.users || [])
      setTemplates(templatesData.templates || [])
    } catch (err) {
      setError('Failed to load data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const applyTemplate = (template: TaskTemplate) => {
    setSelectedTemplate(template)
    setNewTask(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      department: template.department,
      priority: template.priority,
      estimated_duration: template.estimated_duration,
      template_id: template.id
    }))
  }

  const createTask = async () => {
    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      })

      if (!response.ok) throw new Error('Failed to create task')

      setSuccess('Task created successfully!')
      resetForm()
    } catch (err) {
      setError('Failed to create task')
      console.error('Error creating task:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const createBulkTasks = async () => {
    try {
      setSubmitting(true)
      setError(null)

      const tasksToCreate = bulkTasks.map(task => ({
        ...newTask,
        ...task
      }))

      const response = await fetch('/api/tasks/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: tasksToCreate })
      })

      if (!response.ok) throw new Error('Failed to create tasks')

      setSuccess(`${bulkTasks.length} tasks created successfully!`)
      resetBulkForm()
    } catch (err) {
      setError('Failed to create bulk tasks')
      console.error('Error creating bulk tasks:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      assigned_to: '',
      department: '',
      location: '',
      priority: 'medium',
      due_date: '',
      estimated_duration: 30,
      instructions: ''
    })
    setSelectedTemplate(null)
  }

  const resetBulkForm = () => {
    setBulkTasks([{
      assigned_to: '',
      due_date: '',
      instructions: ''
    }])
  }

  const addBulkTask = () => {
    setBulkTasks(prev => [...prev, {
      assigned_to: '',
      due_date: '',
      instructions: ''
    }])
  }

  const removeBulkTask = (index: number) => {
    setBulkTasks(prev => prev.filter((_, i) => i !== index))
  }

  const updateBulkTask = (index: number, field: string, value: string) => {
    setBulkTasks(prev => prev.map((task, i) => 
      i === index ? { ...task, [field]: value } : task
    ))
  }

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Create Tasks</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setBulkMode(!bulkMode)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              bulkMode 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {bulkMode ? 'Single Task' : 'Bulk Create'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Templates Section */}
      {templates.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Task Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div 
                key={template.id} 
                className={`border border-slate-200 rounded-lg p-4 cursor-pointer transition-colors hover:bg-slate-50 ${
                  selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => applyTemplate(template)}
              >
                <h4 className="font-medium text-slate-900 mb-2">{template.title}</h4>
                <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{template.department}</span>
                  <span className={`px-2 py-1 rounded-full ${
                    template.priority === 'high' ? 'bg-red-100 text-red-800' :
                    template.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {template.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Single Task Creation */}
      {!bulkMode && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Create New Task</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 h-24"
                  placeholder="Describe the task"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                  <select
                    value={newTask.department}
                    onChange={(e) => setNewTask(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <select
                    value={newTask.location}
                    onChange={(e) => setNewTask(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select Location</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assign To</label>
                <select
                  value={newTask.assigned_to}
                  onChange={(e) => setNewTask(prev => ({ ...prev, assigned_to: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select Employee</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newTask.estimated_duration}
                    onChange={(e) => setNewTask(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Special Instructions</label>
                <textarea
                  value={newTask.instructions}
                  onChange={(e) => setNewTask(prev => ({ ...prev, instructions: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 h-20"
                  placeholder="Any special instructions or notes"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={createTask}
              disabled={submitting || !newTask.title || !newTask.assigned_to}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-4 w-4" />
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </div>
      )}

      {/* Bulk Task Creation */}
      {bulkMode && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Bulk Task Creation</h3>
          
          {/* Common Task Details */}
          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-4">Common Task Details</h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="Common title for all tasks"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                <select
                  value={newTask.department}
                  onChange={(e) => setNewTask(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Individual Task Assignments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-slate-900">Individual Assignments</h4>
              <button
                onClick={addBulkTask}
                className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Assignment
              </button>
            </div>

            {bulkTasks.map((task, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Assign To</label>
                    <select
                      value={task.assigned_to || ''}
                      onChange={(e) => updateBulkTask(index, 'assigned_to', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2"
                    >
                      <option value="">Select Employee</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} - {user.department}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                    <input
                      type="datetime-local"
                      value={task.due_date || ''}
                      onChange={(e) => updateBulkTask(index, 'due_date', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Special Instructions</label>
                    <input
                      type="text"
                      value={task.instructions || ''}
                      onChange={(e) => updateBulkTask(index, 'instructions', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2"
                      placeholder="Task-specific notes"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => removeBulkTask(index)}
                      className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={resetBulkForm}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={createBulkTasks}
              disabled={submitting || !newTask.title || bulkTasks.some(task => !task.assigned_to)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-4 w-4" />
              {submitting ? 'Creating...' : `Create ${bulkTasks.length} Tasks`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}