'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Archive, 
  Edit, 
  CheckSquare,
  Square,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  Copy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TaskEditModal from './TaskEditModal';

interface Task {
  id: string;
  title: string;
  description: string;
  departments: string[];
  created_at: string;
  updated_at: string;
  archived: boolean;
  requires_photo: boolean;
  requires_notes: boolean;
}

export default function TaskManagementSimple() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showArchived, setShowArchived] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/manager/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const data = await response.json();
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkArchive = async () => {
    try {
      const taskIds = Array.from(selectedTasks);
      
      const response = await fetch('/api/manager/tasks/bulk-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskIds })
      });

      if (!response.ok) {
        throw new Error('Failed to archive tasks');
      }

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setTasks(prev => prev.map(task => 
          taskIds.includes(task.id) ? { ...task, archived: true } : task
        ));
        setSelectedTasks(new Set());
      } else {
        console.log('Archive response:', result.message);
      }
    } catch (error) {
      console.error('Error archiving tasks:', error);
    }
  };

  const handleSelectAll = () => {
    const visibleTasks = filteredTasks.filter(task => task.archived === showArchived);
    if (selectedTasks.size === visibleTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(visibleTasks.map(task => task.id)));
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleSaveTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/manager/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(prev => prev.filter(task => task.id !== taskId));
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleDuplicateTask = (task: Task) => {
    // Open edit modal with duplicated task data (no ID so it creates new)
    const duplicatedTask = {
      ...task,
      id: '', // Will be assigned by backend
      title: `${task.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingTask(duplicatedTask);
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArchived = task.archived === showArchived;
    return matchesSearch && matchesArchived;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Task Master List</h2>
          <p className="text-slate-600">All tasks ever created - edit and archive as needed</p>
        </div>
        <Button 
          onClick={fetchTasks}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{tasks.filter(t => !t.archived).length}</div>
            <div className="text-sm text-slate-600">Active Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-600">{tasks.filter(t => t.archived).length}</div>
            <div className="text-sm text-slate-600">Archived Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-800">{tasks.length}</div>
            <div className="text-sm text-slate-600">Total Tasks</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            variant={!showArchived ? "default" : "outline"}
            onClick={() => setShowArchived(false)}
            size="sm"
          >
            Active ({tasks.filter(t => !t.archived).length})
          </Button>
          <Button
            variant={showArchived ? "default" : "outline"}
            onClick={() => setShowArchived(true)}
            size="sm"
          >
            Archived ({tasks.filter(t => t.archived).length})
          </Button>
        </div>

        {/* Bulk Actions */}
        {selectedTasks.size > 0 && (
          <div className="flex gap-2">
            <Button
              onClick={handleBulkArchive}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Archive className="h-4 w-4" />
              Archive ({selectedTasks.size})
            </Button>
          </div>
        )}
      </div>

      {/* Task List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {showArchived ? 'Archived Tasks' : 'Active Tasks'} ({filteredTasks.length})
            </CardTitle>
            {filteredTasks.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center gap-2"
              >
                {selectedTasks.size === filteredTasks.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Select All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {searchTerm ? 'No tasks match your search.' : `No ${showArchived ? 'archived' : 'active'} tasks found.`}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
                    selectedTasks.has(task.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => {
                      const newSelected = new Set(selectedTasks);
                      if (newSelected.has(task.id)) {
                        newSelected.delete(task.id);
                      } else {
                        newSelected.add(task.id);
                      }
                      setSelectedTasks(newSelected);
                    }}
                    className="flex-shrink-0"
                  >
                    {selectedTasks.has(task.id) ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className="h-5 w-5 text-slate-400" />
                    )}
                  </button>

                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {task.departments.map(dept => (
                            <Badge key={dept} variant="secondary" className="text-xs">
                              {dept}
                            </Badge>
                          ))}
                          {task.requires_photo && (
                            <Badge variant="outline" className="text-xs">📷 Photo</Badge>
                          )}
                          {task.requires_notes && (
                            <Badge variant="outline" className="text-xs">📝 Notes</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        Created: {new Date(task.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditTask(task)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <div className="relative">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      
                      {openMenuId === task.id && (
                        <div className="absolute right-0 top-8 z-50 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                          <button
                            onClick={() => handleDuplicateTask(task)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Duplicate Task
                          </button>
                          <button
                            onClick={() => {
                              const updatedTask = { ...task, archived: !task.archived };
                              handleSaveTask(updatedTask);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Archive className="h-4 w-4" />
                            {task.archived ? 'Unarchive' : 'Archive'}
                          </button>
                          <hr className="my-1" />
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Task
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <TaskEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </div>
  );
}