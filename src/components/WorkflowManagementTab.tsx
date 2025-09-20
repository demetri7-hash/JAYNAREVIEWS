'use client';

import { useState, useEffect } from 'react';
import { Workflow, WorkflowTask, EnhancedTask } from '@/types/workflow';
import { ROLE_LABELS, Department, UserRole } from '@/types';
import { Plus, Edit2, Trash2, Play, Calendar, Users, Settings, GripVertical, X } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface WorkflowManagementTabProps {
  onMessage: (message: { type: 'success' | 'error'; text: string }) => void;
}

interface TaskOption extends EnhancedTask {
  isSelected?: boolean;
}

interface WorkflowTaskWithOrder {
  id: string;
  task_id: string;
  order_index: number;
  is_required: boolean;
  task?: EnhancedTask;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Sortable Task Item Component
function SortableTaskItem({ 
  task, 
  onRemove, 
  onToggleRequired 
}: { 
  task: WorkflowTaskWithOrder; 
  onRemove: (id: string) => void;
  onToggleRequired: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900">{task.task?.title}</div>
        {task.task?.description && (
          <div className="text-sm text-gray-600 truncate">{task.task.description}</div>
        )}
      </div>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={task.is_required}
          onChange={() => onToggleRequired(task.id)}
          className="rounded border-gray-300"
        />
        <span className="text-sm text-gray-600">Required</span>
      </label>

      <button
        onClick={() => onRemove(task.id)}
        className="p-1 text-gray-500 hover:text-red-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function WorkflowManagementTab({ onMessage }: WorkflowManagementTabProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  // Task and user management state
  const [availableTasks, setAvailableTasks] = useState<TaskOption[]>([]);
  const [workflowTasks, setWorkflowTasks] = useState<WorkflowTaskWithOrder[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [draggedTask, setDraggedTask] = useState<WorkflowTaskWithOrder | null>(null);

  // New task creation state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    requires_notes: false,
    requires_photo: false,
    is_photo_mandatory: false,
    is_notes_mandatory: false
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_repeatable: false,
    recurrence_type: 'once' as 'once' | 'daily' | 'weekly' | 'monthly',
    due_date: '',
    due_time: '',
    departments: [] as string[],
    roles: [] as string[],
    assigned_users: [] as string[],
    is_active: true
  });

  const departments: Department[] = ['BOH', 'FOH', 'AM', 'PM', 'PREP', 'CLEAN', 'CATERING', 'SPECIAL', 'TRANSITION'];
  const roles: UserRole[] = ['staff', 'manager', 'kitchen_manager', 'ordering_manager', 'lead_prep_cook', 'assistant_foh_manager', 'foh_team_member', 'boh_team_member'];

  // Department labels for better UX
  const DEPARTMENT_LABELS: Record<Department, string> = {
    BOH: 'Back of House',
    FOH: 'Front of House', 
    AM: 'Morning Shift',
    PM: 'Evening Shift',
    PREP: 'Prep Kitchen',
    CLEAN: 'Cleaning',
    CATERING: 'Catering',
    SPECIAL: 'Special Events',
    TRANSITION: 'Shift Transition'
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchWorkflows();
    fetchAvailableTasks();
    fetchAvailableUsers();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workflows');
      if (!response.ok) throw new Error('Failed to fetch workflows');
      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      onMessage({ type: 'error', text: 'Failed to load workflows' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setAvailableTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      onMessage({ type: 'error', text: 'Failed to load available tasks' });
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch('/api/manager/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setAvailableUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      onMessage({ type: 'error', text: 'Failed to load users' });
    }
  };

  const handleCreateWorkflow = async () => {
    try {
      // First create the workflow
      const workflowResponse = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!workflowResponse.ok) {
        const errorData = await workflowResponse.json();
        throw new Error(errorData.error || 'Failed to create workflow');
      }
      
      const workflowData = await workflowResponse.json();
      const workflowId = workflowData.workflow?.id;

      // Then add tasks to the workflow if any are selected
      if (workflowId && workflowTasks.length > 0) {
        for (const workflowTask of workflowTasks) {
          const taskResponse = await fetch('/api/workflow-tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workflow_id: workflowId,
              task_id: workflowTask.task_id,
              order_index: workflowTask.order_index,
              is_required: workflowTask.is_required
            })
          });

          if (!taskResponse.ok) {
            console.error('Failed to add task to workflow:', workflowTask.task?.title);
          }
        }
      }
      
      onMessage({ type: 'success', text: 'Workflow created successfully' });
      setShowCreateForm(false);
      resetForm();
      fetchWorkflows();
    } catch (error) {
      console.error('Error creating workflow:', error);
      onMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create workflow' });
    }
  };

  const handleCreateTask = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          frequency: 'once', // Default for workflow tasks
          due_date: new Date().toISOString().split('T')[0],
          due_time: '09:00',
          departments: formData.departments.length > 0 ? formData.departments : ['BOH'],
          assignees: []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }
      
      const data = await response.json();
      const createdTask = data.task;
      
      // Add to available tasks and reset form
      setAvailableTasks(prev => [createdTask, ...prev]);
      setNewTask({
        title: '',
        description: '',
        requires_notes: false,
        requires_photo: false,
        is_photo_mandatory: false,
        is_notes_mandatory: false
      });
      setShowTaskCreator(false);
      
      onMessage({ type: 'success', text: 'Task created successfully' });
    } catch (error) {
      console.error('Error creating task:', error);
      onMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create task' });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = workflowTasks.find(t => t.id === active.id);
    setDraggedTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedTask(null);

    if (!over || active.id === over.id) {
      return;
    }

    setWorkflowTasks((tasks) => {
      const oldIndex = tasks.findIndex(task => task.id === active.id);
      const newIndex = tasks.findIndex(task => task.id === over.id);

      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      // Update order indices
      return newTasks.map((task, index) => ({
        ...task,
        order_index: index
      }));
    });
  };

  const addTaskToWorkflow = (task: TaskOption) => {
    const newWorkflowTask: WorkflowTaskWithOrder = {
      id: `temp-${Date.now()}`, // Temporary ID for UI
      task_id: task.id,
      order_index: workflowTasks.length,
      is_required: true,
      task
    };
    setWorkflowTasks(prev => [...prev, newWorkflowTask]);
  };

  const removeTaskFromWorkflow = (taskId: string) => {
    setWorkflowTasks(prev => 
      prev.filter(t => t.id !== taskId)
        .map((task, index) => ({ ...task, order_index: index }))
    );
  };

  const toggleTaskRequired = (taskId: string) => {
    setWorkflowTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, is_required: !task.is_required }
          : task
      )
    );
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete workflow');
      
      onMessage({ type: 'success', text: 'Workflow deleted successfully' });
      fetchWorkflows();
      setSelectedWorkflow(null);
    } catch (error) {
      console.error('Error deleting workflow:', error);
      onMessage({ type: 'error', text: 'Failed to delete workflow' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_repeatable: false,
      recurrence_type: 'once',
      due_date: '',
      due_time: '',
      departments: [],
      roles: [],
      assigned_users: [],
      is_active: true
    });
    setEditingWorkflow(null);
    setWorkflowTasks([]);
    setShowTaskCreator(false);
  };

  const handleInputChange = (field: string, value: string | boolean | 'once' | 'daily' | 'weekly' | 'monthly') => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: 'departments' | 'roles' | 'assigned_users', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflow Management</h2>
          <p className="text-gray-600">Create and manage automated workflows for your team</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Workflow
        </button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingWorkflow) && (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workflow Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter workflow name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe this workflow..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departments
              </label>
              <div className="flex flex-wrap gap-2">
                {departments.map(dept => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleArrayToggle('departments', dept)}
                    className={`px-3 py-1 text-sm rounded ${
                      formData.departments.includes(dept)
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    {DEPARTMENT_LABELS[dept]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roles
              </label>
              <div className="flex flex-wrap gap-2">
                {roles.map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleArrayToggle('roles', role)}
                    className={`px-3 py-1 text-sm rounded ${
                      formData.roles.includes(role)
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    {ROLE_LABELS[role as UserRole]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_repeatable}
                  onChange={(e) => handleInputChange('is_repeatable', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Repeatable Workflow</span>
              </label>
            </div>

            {formData.is_repeatable && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recurrence
                </label>
                <select
                  value={formData.recurrence_type}
                  onChange={(e) => handleInputChange('recurrence_type', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="once">One Time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </div>

          {/* Task Management Section */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">Workflow Tasks</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowTaskCreator(true)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  New Task
                </button>
              </div>
            </div>

            {/* Available Tasks Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Existing Tasks
              </label>
              <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                {availableTasks.filter(task => !workflowTasks.some(wt => wt.task_id === task.id)).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-2 hover:bg-white rounded">
                    <div>
                      <div className="font-medium text-sm">{task.title}</div>
                      {task.description && (
                        <div className="text-xs text-gray-600">{task.description}</div>
                      )}
                    </div>
                    <button
                      onClick={() => addTaskToWorkflow(task)}
                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Tasks with Drag and Drop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Tasks ({workflowTasks.length})
              </label>
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={workflowTasks.map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {workflowTasks.map((task) => (
                      <SortableTaskItem
                        key={task.id}
                        task={task}
                        onRemove={removeTaskFromWorkflow}
                        onToggleRequired={toggleTaskRequired}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {draggedTask && (
                    <div className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-lg">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{draggedTask.task?.title}</div>
                      </div>
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
              {workflowTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded border-2 border-dashed">
                  No tasks selected. Add tasks from the list above or create new ones.
                </div>
              )}
            </div>

            {/* User Assignment Section */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Users
              </label>
              <div className="flex flex-wrap gap-2">
                {availableUsers.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleArrayToggle('assigned_users', user.id)}
                    className={`px-3 py-1 text-sm rounded ${
                      formData.assigned_users.includes(user.id)
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    {user.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Task Creator Modal */}
          {showTaskCreator && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <h5 className="font-medium text-blue-900 mb-3">Create New Task</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="Task description"
                  />
                </div>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newTask.requires_notes}
                      onChange={(e) => setNewTask(prev => ({ ...prev, requires_notes: e.target.checked }))}
                      className="rounded border-blue-300"
                    />
                    <span className="text-sm text-blue-700">Requires Notes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newTask.requires_photo}
                      onChange={(e) => setNewTask(prev => ({ ...prev, requires_photo: e.target.checked }))}
                      className="rounded border-blue-300"
                    />
                    <span className="text-sm text-blue-700">Requires Photo</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  onClick={() => setShowTaskCreator(false)}
                  className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!newTask.title.trim()}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Task
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateWorkflow}
              disabled={!formData.name.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingWorkflow ? 'Update' : 'Create'} Workflow
            </button>
          </div>
        </div>
      )}

      {/* Workflows List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    setEditingWorkflow(workflow);
                    setFormData({
                      name: workflow.name,
                      description: workflow.description || '',
                      is_repeatable: workflow.is_repeatable,
                      recurrence_type: workflow.recurrence_type || 'once',
                      due_date: workflow.due_date || '',
                      due_time: workflow.due_time || '',
                      departments: workflow.departments,
                      roles: workflow.roles,
                      assigned_users: workflow.assigned_users,
                      is_active: workflow.is_active
                    });
                    setShowCreateForm(true);
                  }}
                  className="p-1 text-gray-500 hover:text-blue-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteWorkflow(workflow.id)}
                  className="p-1 text-gray-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {workflow.is_repeatable ? 
                  `${workflow.recurrence_type || 'once'}` : 
                  workflow.due_date ? new Date(workflow.due_date).toLocaleDateString() : 'No due date'
                }
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {workflow.departments.length} dept{workflow.departments.length !== 1 ? 's' : ''}, 
                {workflow.roles.length} role{workflow.roles.length !== 1 ? 's' : ''}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Settings className="h-4 w-4 mr-2" />
                {workflow.tasks?.length || 0} task{(workflow.tasks?.length || 0) !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className={`px-2 py-1 text-xs rounded ${
                workflow.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {workflow.is_active ? 'Active' : 'Inactive'}
              </span>
              
              <button
                onClick={() => setSelectedWorkflow(workflow)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>

      {workflows.length === 0 && (
        <div className="text-center py-8">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows created yet</h3>
          <p className="text-gray-600 mb-4">Create your first workflow to automate team tasks</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create First Workflow
          </button>
        </div>
      )}

      {/* Workflow Details Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{selectedWorkflow.name}</h3>
                <button
                  onClick={() => setSelectedWorkflow(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedWorkflow.description || 'No description'}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Departments</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkflow.departments.map(dept => (
                      <span key={dept} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Roles</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkflow.roles.map(role => (
                      <span key={role} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                        {ROLE_LABELS[role as UserRole] || role}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Schedule</h4>
                  <p className="text-gray-600">
                    {selectedWorkflow.is_repeatable 
                      ? `Repeats ${selectedWorkflow.recurrence_type}` 
                      : selectedWorkflow.due_date 
                        ? `Due: ${new Date(selectedWorkflow.due_date).toLocaleDateString()}`
                        : 'No specific due date'
                    }
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tasks</h4>
                  {selectedWorkflow.tasks && selectedWorkflow.tasks.length > 0 ? (
                    <div className="space-y-2">
                      {selectedWorkflow.tasks.map((workflowTask, index) => (
                        <div key={workflowTask.id} className="p-3 bg-gray-50 rounded">
                          <div className="font-medium">
                            {index + 1}. {workflowTask.task?.title || 'Task'}
                          </div>
                          {workflowTask.task?.description && (
                            <div className="text-sm text-gray-600 mt-1">
                              {workflowTask.task.description}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            {workflowTask.is_required ? 'Required' : 'Optional'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No tasks assigned yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}