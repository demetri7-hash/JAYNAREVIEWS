'use client'

import { useState, useEffect } from 'react'
import { Plus, AlertCircle, CheckCircle, Camera, FileText } from 'lucide-react'

interface Workflow {
  id: string
  name: string
  description: string
  department: string
}

interface TaskTemplate {
  id: string
  title: string
  description: string
  estimated_duration: number
  priority: 'low' | 'medium' | 'high'
  requires_photo: boolean
  requires_notes: boolean
}

interface NewTask {
  title: string
  description: string
  location: string
  priority: 'low' | 'medium' | 'high'
  estimated_duration: number
  instructions: string
  template_id?: string
  workflow_id?: string
  requires_photo: boolean
  requires_notes: boolean
  frequency: string
  due_date: string
  due_time: string
  departments: string[]
  assignees?: string[]
}

export default function TaskCreationTab() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null)

  const [newTask, setNewTask] = useState<NewTask>({
    title: '',
    description: '',
    location: '',
    priority: 'medium',
    estimated_duration: 30,
    instructions: '',
    requires_photo: false,
    requires_notes: false,
    frequency: 'once',
    due_date: new Date().toISOString().split('T')[0], // Today's date
    due_time: '09:00',
    departments: [],
    assignees: []
  })

  const locations = ['Main Kitchen', 'Prep Area', 'Dining Room', 'Bar', 'Storage', 'Office', 'Exterior']

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [workflowsRes, templatesRes] = await Promise.all([
        fetch('/api/workflows'),
        fetch('/api/task-templates')
      ])

      if (!workflowsRes.ok || !templatesRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [workflowsData, templatesData] = await Promise.all([
        workflowsRes.json(),
        templatesRes.json()
      ])

      setWorkflows(workflowsData.workflows || [])
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
      priority: template.priority,
      estimated_duration: template.estimated_duration,
      requires_photo: template.requires_photo,
      requires_notes: template.requires_notes,
      template_id: template.id
    }))
  }

  const createTask = async () => {
    try {
      setSubmitting(true)
      setError(null)

      // Validate required fields
      if (!newTask.title) {
        setError('Task title is required')
        return
      }
      
      if (!newTask.due_date || !newTask.due_time) {
        setError('Due date and time are required')
        return
      }
      
      if (!newTask.departments || newTask.departments.length === 0) {
        setError('At least one department must be selected')
        return
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newTask)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create task')
      }

      setSuccess('Task created successfully!')
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
      console.error('Error creating task:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      location: '',
      priority: 'medium',
      estimated_duration: 30,
      instructions: '',
      requires_photo: false,
      requires_notes: false,
      frequency: 'once',
      due_date: new Date().toISOString().split('T')[0],
      due_time: '09:00',
      departments: [],
      assignees: []
    })
    setSelectedTemplate(null)
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
                <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                  <span>{template.estimated_duration} min</span>
                  <span className={`px-2 py-1 rounded-full ${
                    template.priority === 'high' ? 'bg-red-100 text-red-800' :
                    template.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {template.priority}
                  </span>
                </div>
                <div className="flex gap-2 text-xs">
                  {template.requires_photo && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      <Camera className="h-3 w-3" />
                      Photo Required
                    </span>
                  )}
                  {template.requires_notes && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded">
                      <FileText className="h-3 w-3" />
                      Notes Required
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Creation Form */}
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Workflow (Optional)</label>
                <select
                  value={newTask.workflow_id || ''}
                  onChange={(e) => setNewTask(prev => ({ ...prev, workflow_id: e.target.value || undefined }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="">No Workflow</option>
                  {workflows.map(workflow => (
                    <option key={workflow.id} value={workflow.id}>{workflow.name}</option>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
                <select
                  value={newTask.frequency}
                  onChange={(e) => setNewTask(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="once">One Time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Due Time</label>
                <input
                  type="time"
                  value={newTask.due_time}
                  onChange={(e) => setNewTask(prev => ({ ...prev, due_time: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Departments</label>
                <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-300">
                  {[
                    { value: 'BOH', label: 'Back of House' },
                    { value: 'FOH', label: 'Front of House' },
                    { value: 'PREP', label: 'Prep' },
                    { value: 'CLEAN', label: 'Cleaning' },
                    { value: 'AM', label: 'Morning Shift' },
                    { value: 'PM', label: 'Evening Shift' }
                  ].map(dept => (
                    <div key={dept.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`dept-${dept.value}`}
                        checked={newTask.departments.includes(dept.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTask(prev => ({ 
                              ...prev, 
                              departments: [...prev.departments, dept.value] 
                            }));
                          } else {
                            setNewTask(prev => ({ 
                              ...prev, 
                              departments: prev.departments.filter(d => d !== dept.value) 
                            }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor={`dept-${dept.value}`} className="ml-3 text-sm text-slate-700">
                        {dept.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Special Instructions</label>
              <textarea
                value={newTask.instructions}
                onChange={(e) => setNewTask(prev => ({ ...prev, instructions: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 h-24"
                placeholder="Any special instructions or notes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Completion Requirements</label>
              <div className="space-y-3 p-3 bg-slate-50 rounded-lg border">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requires_photo"
                    checked={newTask.requires_photo}
                    onChange={(e) => setNewTask(prev => ({ ...prev, requires_photo: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="requires_photo" className="ml-3 flex items-center gap-2 text-sm text-slate-700">
                    <Camera className="h-4 w-4 text-blue-500" />
                    Require photo upload when completing this task
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requires_notes"
                    checked={newTask.requires_notes}
                    onChange={(e) => setNewTask(prev => ({ ...prev, requires_notes: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="requires_notes" className="ml-3 flex items-center gap-2 text-sm text-slate-700">
                    <FileText className="h-4 w-4 text-purple-500" />
                    Require completion notes when finishing this task
                  </label>
                </div>
              </div>
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
            disabled={submitting || !newTask.title}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" />
            {submitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  )
}