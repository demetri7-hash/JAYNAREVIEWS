'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { User } from '@/types'
import { 
  CheckCircle2, 
  Circle, 
  Camera, 
  AlertCircle,
  Play,
  Clock,
  User as UserIcon,
  ArrowLeft,
  Star,
  Upload
} from 'lucide-react'

interface Task {
  id: number
  name: string
  task_description: string
  required: boolean
  critical: boolean
  completed: boolean
  photo_urls: string[]
  rating: number | null
  notes: string | null
  min_rating: number | null
}

interface Worksheet {
  id: number
  employee_id: number
  department: string
  shift_type: string
  status: string
  completion_percentage: number
  started_at: string
  completed_at: string | null
  checklist_data: Task[]
}

interface WorkflowDashboardProps {
  user: User | null
  onBack: () => void
}

export default function WorkflowDashboard({ user, onBack }: WorkflowDashboardProps) {
  const { t } = useLanguage()
  const [activeWorksheets, setActiveWorksheets] = useState<Worksheet[]>([])
  const [selectedWorksheet, setSelectedWorksheet] = useState<Worksheet | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (user) {
      loadActiveWorksheets()
    }
  }, [user])

  const loadActiveWorksheets = async () => {
    try {
      const response = await fetch('/api/worksheets', {
        method: 'GET',
      })
      const data = await response.json()
      
      if (data.success) {
        // Filter for user's active worksheets
        const userWorksheets = data.worksheets.filter((ws: Worksheet) => 
          ws.employee_id === parseInt(user?.id || '0') && ws.status === 'in_progress'
        )
        setActiveWorksheets(userWorksheets)
      }
    } catch (error) {
      console.error('Failed to load worksheets:', error)
    } finally {
      setLoading(false)
    }
  }

  const startNewWorkflow = async (workflowType: string) => {
    if (!user) return
    
    setCreating(true)
    try {
      const response = await fetch('/api/workflow/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_type: workflowType,
          employee_name: user.name,
          employee_id: user.id,
          department: workflowType.includes('foh') ? 'FOH' : 'BOH'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Reload worksheets to show new one
        await loadActiveWorksheets()
      } else {
        alert('Failed to start workflow: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to start workflow:', error)
      alert('Failed to start workflow')
    } finally {
      setCreating(false)
    }
  }

  const updateTask = async (worksheetId: number, taskId: number, updates: Partial<Task>) => {
    try {
      const response = await fetch('/api/workflow/instances', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worksheet_id: worksheetId,
          task_id: taskId,
          updates
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setSelectedWorksheet(prev => {
          if (!prev) return null
          
          const updatedChecklist = prev.checklist_data.map(task => 
            task.id === taskId ? { ...task, ...updates } : task
          )
          
          const completedCount = updatedChecklist.filter(task => task.completed).length
          const completionPercentage = Math.round((completedCount / updatedChecklist.length) * 100)
          
          return {
            ...prev,
            checklist_data: updatedChecklist,
            completion_percentage: completionPercentage
          }
        })
        
        // Update active worksheets list
        setActiveWorksheets(prev => 
          prev.map(ws => 
            ws.id === worksheetId 
              ? { ...ws, completion_percentage: data.worksheet.completion_percentage }
              : ws
          )
        )
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const toggleTaskCompletion = (worksheetId: number, taskId: number, completed: boolean) => {
    updateTask(worksheetId, taskId, { completed })
  }

  const updateTaskRating = (worksheetId: number, taskId: number, rating: number) => {
    updateTask(worksheetId, taskId, { rating })
  }

  const updateTaskNotes = (worksheetId: number, taskId: number, notes: string) => {
    updateTask(worksheetId, taskId, { notes })
  }

  const renderTaskList = (worksheet: Worksheet) => {
    const tasksBySection = worksheet.checklist_data.reduce((acc, task) => {
      const section = task.task_description || 'General'
      if (!acc[section]) acc[section] = []
      acc[section].push(task)
      return acc
    }, {} as Record<string, Task[]>)

    return (
      <div className="space-y-6">
        {Object.entries(tasksBySection).map(([section, tasks]) => (
          <div key={section} className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              {section}
              <span className="text-sm text-gray-500">
                ({tasks.filter(t => t.completed).length}/{tasks.length})
              </span>
            </h3>
            
            <div className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`p-3 rounded-lg border ${
                    task.critical 
                      ? 'border-red-200 bg-red-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTaskCompletion(worksheet.id, task.id, !task.completed)}
                      className="mt-1 flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-medium ${
                          task.completed ? 'text-green-600 line-through' : 'text-gray-900'
                        }`}>
                          {task.name}
                        </p>
                        
                        {task.critical && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        
                        {task.min_rating && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      
                      {task.min_rating && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-600">Rating:</span>
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => updateTaskRating(worksheet.id, task.id, rating)}
                              className={`w-6 h-6 rounded-full border-2 text-xs font-bold ${
                                task.rating && task.rating >= rating
                                  ? 'bg-yellow-400 border-yellow-400 text-white'
                                  : 'border-gray-300 text-gray-400 hover:border-yellow-400'
                              }`}
                            >
                              {rating}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <textarea
                        placeholder="Add notes..."
                        value={task.notes || ''}
                        onChange={(e) => updateTaskNotes(worksheet.id, task.id, e.target.value)}
                        className="w-full mt-2 p-2 text-sm border border-gray-200 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                      />
                      
                      {(task as any).photo_required && (
                        <div className="mt-2">
                          <button className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50">
                            <Camera className="w-4 h-4" />
                            Add Photo (Required)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading workflows...</p>
        </div>
      </div>
    )
  }

  if (selectedWorksheet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedWorksheet(null)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {selectedWorksheet.shift_type} - {selectedWorksheet.department}
                </h1>
                <p className="text-sm text-gray-600">
                  Started {new Date(selectedWorksheet.started_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedWorksheet.completion_percentage}%
                </div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
              
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - selectedWorksheet.completion_percentage / 100)}`}
                    className="text-blue-600 transition-all duration-300"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto p-4">
          {renderTaskList(selectedWorksheet)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflow Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          
          <button 
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-6">
        {/* Active Workflows */}
        {activeWorksheets.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Active Workflows ({activeWorksheets.length})
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              {activeWorksheets.map((worksheet) => (
                <div 
                  key={worksheet.id}
                  onClick={() => setSelectedWorksheet(worksheet)}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">
                      {worksheet.shift_type} - {worksheet.department}
                    </h3>
                    <span className="text-2xl font-bold text-blue-600">
                      {worksheet.completion_percentage}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${worksheet.completion_percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Started {new Date(worksheet.started_at).toLocaleTimeString()}</span>
                    <span>{worksheet.checklist_data.filter(t => t.completed).length}/{worksheet.checklist_data.length} tasks</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Start New Workflow */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-green-600" />
            Start New Workflow
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => startNewWorkflow('foh-opening')}
              disabled={creating}
              className="bg-white rounded-lg border border-gray-200 p-6 text-left hover:shadow-md transition-shadow disabled:opacity-50"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">FOH Opening</h3>
                  <p className="text-sm text-gray-600">33 tasks • ~90 min</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Complete morning setup including dining room, bathrooms, expo station, and bar.
              </p>
            </button>
            
            <button
              onClick={() => startNewWorkflow('foh-closing')}
              disabled={creating}
              className="bg-white rounded-lg border border-gray-200 p-6 text-left hover:shadow-md transition-shadow disabled:opacity-50"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">FOH Closing</h3>
                  <p className="text-sm text-gray-600">13 tasks • ~75 min</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                End-of-day cleanup including dining room, expo station, and restocking.
              </p>
            </button>
            
            <button
              onClick={() => startNewWorkflow('boh-prep')}
              disabled={creating}
              className="bg-white rounded-lg border border-gray-200 p-6 text-left hover:shadow-md transition-shadow disabled:opacity-50"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">BOH Prep</h3>
                  <p className="text-sm text-gray-600">6 tasks • ~120 min</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Kitchen prep workflow including inventory checks and task assignments.
              </p>
            </button>
            
            <button
              onClick={() => startNewWorkflow('missing-ingredients')}
              disabled={creating}
              className="bg-white rounded-lg border border-gray-200 p-6 text-left hover:shadow-md transition-shadow disabled:opacity-50"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Missing Items</h3>
                  <p className="text-sm text-gray-600">Real-time reporting</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Report missing ingredients or supplies immediately to management.
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
