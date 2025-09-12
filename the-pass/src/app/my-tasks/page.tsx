'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  PhotoIcon, 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface TaskInstance {
  id: string;
  task_title: string;
  task_description: string;
  sort_order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  completed_at?: string;
  completed_by?: string;
  notes?: string;
  photo_url?: string;
  estimated_duration?: number;
  workflow_instance: {
    id: string;
    checklist_title: string;
    status: string;
    due_date?: string;
    assigned_by_name: string;
  };
}

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  created_by_name: string;
}

export default function MyTasks() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskInstance[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [selectedTask, setSelectedTask] = useState<TaskInstance | null>(null);
  const [notes, setNotes] = useState('');
  const [newComment, setNewComment] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.email) {
      router.push('/auth/signin');
      return;
    }
    fetchTasks();
  }, [session, status, router]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?employee_email=${session?.user?.email}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const fetchComments = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(prev => ({ ...prev, [taskId]: data }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string, taskNotes?: string) => {
    try {
      setUploading(true);
      
      let photoUrl: string | null = null;
      if (photoFile) {
        // In a real implementation, you would upload to your storage service
        // For now, we'll just use a placeholder
        photoUrl = `https://placeholder.com/photo-${Date.now()}`;
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          notes: taskNotes || notes,
          photo_url: photoUrl,
          completed_by: session?.user?.email,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        })
      });

      if (!response.ok) throw new Error('Failed to update task');
      
      await fetchTasks();
      setSelectedTask(null);
      setNotes('');
      setPhotoFile(null);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setUploading(false);
    }
  };

  const addComment = async (taskId: string) => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: newComment,
          created_by: session?.user?.email
        })
      });

      if (!response.ok) throw new Error('Failed to add comment');
      
      setNewComment('');
      await fetchComments(taskId);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIconSolid className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <CheckCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-600">Complete your assigned workflows and tasks</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {(['all', 'pending', 'in_progress', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.replace('_', ' ').toUpperCase()}
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab === 'all' ? tasks.length : tasks.filter(t => t.status === tab).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
                task.workflow_instance.due_date && isOverdue(task.workflow_instance.due_date) && task.status !== 'completed'
                  ? 'border-red-200'
                  : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                {/* Workflow Info */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    {task.workflow_instance.checklist_title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Assigned by {task.workflow_instance.assigned_by_name}
                  </p>
                </div>

                {/* Task Title */}
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {task.task_title}
                </h4>

                {/* Task Description */}
                {task.task_description && (
                  <p className="text-gray-600 text-sm mb-4">
                    {task.task_description}
                  </p>
                )}

                {/* Status & Due Date */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                  </div>
                  
                  {task.workflow_instance.due_date && (
                    <div className={`flex items-center text-xs ${
                      isOverdue(task.workflow_instance.due_date) && task.status !== 'completed'
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      <CalendarDaysIcon className="w-4 h-4 mr-1" />
                      {new Date(task.workflow_instance.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Estimated Duration */}
                {task.estimated_duration && (
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {task.estimated_duration} minutes
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'in_progress')}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Start Task
                    </button>
                  )}
                  
                  {task.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => updateTaskStatus(task.id, 'failed', 'Task failed - need assistance')}
                        className="px-3 py-2 border border-red-300 text-red-700 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
                      >
                        Failed
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      fetchComments(task.id);
                    }}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Completion Info */}
                {task.status === 'completed' && task.completed_at && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Completed {new Date(task.completed_at).toLocaleString()}
                    </p>
                    {task.notes && (
                      <p className="text-sm text-gray-600 mt-1">{task.notes}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? "You don't have any tasks assigned yet."
                : `You don't have any ${filter.replace('_', ' ')} tasks.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedTask.task_title}
                </h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {selectedTask.task_description && (
                <p className="text-gray-600 mb-4">{selectedTask.task_description}</p>
              )}

              {/* Notes Input */}
              {selectedTask.status === 'in_progress' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Add any notes about completing this task..."
                  />
                </div>
              )}

              {/* Photo Upload */}
              {selectedTask.status === 'in_progress' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo Documentation (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  {photoFile && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {photoFile.name}
                    </p>
                  )}
                </div>
              )}

              {/* Comments Section */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Comments</h4>
                <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                  {comments[selectedTask.id]?.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-md p-3">
                      <p className="text-sm text-gray-800">{comment.comment}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {comment.created_by_name} • {new Date(comment.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && addComment(selectedTask.id)}
                  />
                  <button
                    onClick={() => addComment(selectedTask.id)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedTask.status === 'in_progress' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => updateTaskStatus(selectedTask.id, 'completed', notes)}
                    disabled={uploading}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {uploading ? 'Completing...' : 'Mark Complete'}
                  </button>
                  <button
                    onClick={() => updateTaskStatus(selectedTask.id, 'failed', notes || 'Task failed - need assistance')}
                    disabled={uploading}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-md font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    Mark Failed
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
