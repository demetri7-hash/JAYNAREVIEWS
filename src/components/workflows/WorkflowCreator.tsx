'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/buttons';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  X, 
  GripVertical, 
  Clock,
  Users,
  UserCheck
} from 'lucide-react';
import { 
  CreateWorkflowRequest, 
  TaskSearchResult, 
  WorkflowCreatorProps,
  UserRole,
  Department 
} from '@/types/workflow';

export default function WorkflowCreator({ 
  onSave, 
  onCancel, 
  existingWorkflow 
}: WorkflowCreatorProps) {
  const [formData, setFormData] = useState<CreateWorkflowRequest>({
    name: '',
    description: '',
    is_repeatable: false,
    recurrence_type: 'once',
    due_date: '',
    due_time: '',
    departments: [],
    roles: [],
    assigned_users: [],
    tasks: []
  });

  const [taskSearch, setTaskSearch] = useState('');
  const [searchResults, setSearchResults] = useState<TaskSearchResult[]>([]);
  const [, setIsSearching] = useState(false);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskTags, setNewTaskTags] = useState('');

  const departments: Department[] = ['BOH', 'FOH', 'AM', 'PM', 'PREP', 'CLEAN', 'CATERING', 'SPECIAL', 'TRANSITION'];
  const roles: UserRole[] = ['staff', 'foh_team_member', 'boh_team_member', 'kitchen_manager', 'ordering_manager', 'lead_prep_cook', 'assistant_foh_manager'];

  // Initialize form with existing workflow if editing
  useEffect(() => {
    if (existingWorkflow) {
      setFormData({
        name: existingWorkflow.name,
        description: existingWorkflow.description || '',
        is_repeatable: existingWorkflow.is_repeatable,
        recurrence_type: existingWorkflow.recurrence_type || 'once',
        due_date: existingWorkflow.due_date || '',
        due_time: existingWorkflow.due_time || '',
        departments: existingWorkflow.departments || [],
        roles: existingWorkflow.roles || [],
        assigned_users: existingWorkflow.assigned_users || [],
        tasks: existingWorkflow.tasks?.map(t => ({
          task_id: t.task_id,
          order_index: t.order_index,
          is_required: t.is_required
        })) || []
      });
    }
  }, [existingWorkflow]);

  // Search for tasks
  const searchTasks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/tasks/search?q=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.tasks || []);
      }
    } catch (error) {
      console.error('Error searching tasks:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchTasks(taskSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [taskSearch]);

  // Add task to workflow
  const addTask = (task: TaskSearchResult) => {
    if (formData.tasks?.some(t => t.task_id === task.id)) {
      return; // Task already added
    }

    setFormData(prev => ({
      ...prev,
      tasks: [...(prev.tasks || []), {
        task_id: task.id,
        order_index: (prev.tasks || []).length,
        is_required: true
      }]
    }));
    setTaskSearch('');
    setSearchResults([]);
  };

  // Remove task from workflow
  const removeTask = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: (prev.tasks || [])
        .filter(t => t.task_id !== taskId)
        .map((t, index) => ({ ...t, order_index: index }))
    }));
  };

  // Move task up/down
  const moveTask = (taskId: string, direction: 'up' | 'down') => {
    const tasks = [...(formData.tasks || [])];
    const currentIndex = tasks.findIndex(t => t.task_id === taskId);
    
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= tasks.length) return;
    
    // Swap tasks
    [tasks[currentIndex], tasks[newIndex]] = [tasks[newIndex], tasks[currentIndex]];
    
    // Update order indices
    tasks.forEach((task, index) => {
      task.order_index = index;
    });
    
    setFormData(prev => ({ ...prev, tasks }));
  };

  // Create new task
  const createNewTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch('/api/tasks/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          tags: newTaskTags.split(',').map(t => t.trim()).filter(Boolean),
          is_photo_mandatory: false,
          is_notes_mandatory: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        addTask(data.task);
        setShowNewTaskForm(false);
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskTags('');
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!formData.name.trim() || (formData.tasks?.length || 0) === 0) {
      alert('Please provide a workflow name and at least one task.');
      return;
    }

    if (formData.departments.length === 0 && formData.roles.length === 0 && formData.assigned_users.length === 0) {
      alert('Please assign the workflow to at least one department, role, or user.');
      return;
    }

    onSave?.(formData);
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel?.()}>
      <DialogContent className="w-full max-w-lg sm:max-w-xl lg:max-w-4xl max-h-[90vh] overflow-y-auto mx-4 bg-white border border-gray-300 shadow-lg z-50">{/* Fixed: Added solid white background and border to make modal visible */}
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {existingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-1 sm:px-0">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Workflow Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workflow name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this workflow accomplishes"
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          {/* Schedule Settings */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              Schedule Settings
            </h3>

            <div className="flex items-center space-x-3 py-2">
              <Checkbox
                id="repeatable"
                checked={formData.is_repeatable}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, is_repeatable: checked as boolean }))
                }
                className="h-5 w-5"
              />
              <Label htmlFor="repeatable" className="text-sm font-medium cursor-pointer">
                Repeating Workflow
              </Label>
            </div>

            {formData.is_repeatable && (
              <div>
                <Label className="text-sm font-medium">Recurrence</Label>
                <Select
                  value={formData.recurrence_type}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, recurrence_type: value as 'once' | 'daily' | 'weekly' | 'monthly' }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="due_date" className="text-sm font-medium">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="due_time" className="text-sm font-medium">Due Time</Label>
                <Input
                  id="due_time"
                  type="time"
                  value={formData.due_time}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, due_time: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Assignment Settings */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              Assignment Settings
            </h3>

            <div>
              <Label className="text-sm font-medium">Departments</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                {departments.map(dept => (
                  <div key={dept} className="flex items-center space-x-2 p-2 rounded-lg border bg-gray-50 hover:bg-gray-100">
                    <Checkbox
                      id={`dept-${dept}`}
                      checked={formData.departments.includes(dept)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            departments: [...prev.departments, dept]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            departments: prev.departments.filter(d => d !== dept)
                          }));
                        }
                      }}
                      className="h-5 w-5"
                    />
                    <Label htmlFor={`dept-${dept}`} className="text-sm font-medium cursor-pointer flex-1">
                      {dept}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Roles</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                {roles.map(role => (
                  <div key={role} className="flex items-center space-x-2 p-2 rounded-lg border bg-gray-50 hover:bg-gray-100">
                    <Checkbox
                      id={`role-${role}`}
                      checked={formData.roles.includes(role)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            roles: [...prev.roles, role]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            roles: prev.roles.filter(r => r !== role)
                          }));
                        }
                      }}
                      className="h-5 w-5"
                    />
                    <Label htmlFor={`role-${role}`} className="text-sm font-medium capitalize cursor-pointer flex-1">
                      {role.replace(/_/g, ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
              Tasks ({formData.tasks?.length || 0})
            </h3>

            {/* Task Search */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search for tasks to add..."
                    value={taskSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTaskSearch(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewTaskForm(true)}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="relative z-10 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((task: TaskSearchResult) => (
                    <div
                      key={task.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => addTask(task)}
                    >
                      <div className="font-medium">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                      )}
                      {task.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {task.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* New Task Form */}
            {showNewTaskForm && (
              <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm sm:text-base">Create New Task</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewTaskForm(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Input
                  placeholder="Task title"
                  value={newTaskTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTaskTitle(e.target.value)}
                  className="h-11"
                />
                
                <Textarea
                  placeholder="Task description (optional)"
                  value={newTaskDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTaskDescription(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                
                <Input
                  placeholder="Tags (comma-separated)"
                  value={newTaskTags}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTaskTags(e.target.value)}
                  className="h-11"
                />
                
                <Button 
                  onClick={createNewTask} 
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Create & Add Task
                </Button>
              </div>
            )}

            {/* Selected Tasks */}
            <div className="space-y-3">
              {(formData.tasks || []).map((workflowTask, index) => (
                <div key={workflowTask.task_id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border rounded-lg bg-white">
                  {/* Mobile: Stack controls vertically, Desktop: Side-by-side */}
                  <div className="flex items-center gap-2 sm:flex-col sm:gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveTask(workflowTask.task_id, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveTask(workflowTask.task_id, 'down')}
                      disabled={index === (formData.tasks?.length || 0) - 1}
                      className="h-8 w-8 p-0"
                    >
                      ↓
                    </Button>
                  </div>
                  
                  <GripVertical className="hidden sm:block h-4 w-4 text-gray-400" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base">Task {index + 1}</div>
                    <div className="text-xs sm:text-sm text-gray-600 truncate">ID: {workflowTask.task_id}</div>
                  </div>
                  
                  {/* Mobile: Full width controls, Desktop: Right-aligned */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={workflowTask.is_required}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            tasks: (prev.tasks || []).map(t =>
                              t.task_id === workflowTask.task_id
                                ? { ...t, is_required: checked as boolean }
                                : t
                            )
                          }));
                        }}
                        className="h-5 w-5"
                      />
                      <Label className="text-sm font-medium cursor-pointer">Required</Label>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTask(workflowTask.task_id)}
                      className="w-full sm:w-auto"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {existingWorkflow ? 'Update Workflow' : 'Create Workflow'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}