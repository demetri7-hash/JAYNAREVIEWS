'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChecklistItem, UserRole, Department, isManagerRole, getDepartmentPermissions, ROLE_LABELS, ROLE_PERMISSIONS } from '../../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskWithAssignee extends ChecklistItem {
  assignee?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export default function ManagerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'tasks' | 'users' | 'roles' | 'updates'>('tasks');
  const [tasks, setTasks] = useState<TaskWithAssignee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    department: 'all' as Department | 'all',
    status: 'all' as 'all' | 'pending' | 'completed',
    search: ''
  });

  const userRole = session?.user?.role as UserRole;
  const departmentPermissions = userRole ? getDepartmentPermissions(userRole) : [];

  // Redirect if not a manager
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }
    
    if (status === 'authenticated' && userRole && !isManagerRole(userRole)) {
      router.push('/');
      return;
    }
  }, [session, status, userRole, router]);

  // Fetch tasks and users
  useEffect(() => {
    if (!session?.user?.email || !userRole) return;

    const fetchData = async () => {
      try {
        console.log('Fetching manager dashboard data...', { userEmail: session?.user?.email, userRole });
        setError(null);
        
        // Fetch tasks with assignee info
        const tasksResponse = await fetch('/api/manager/tasks');
        console.log('Tasks response status:', tasksResponse.status);
        
        if (!tasksResponse.ok) {
          const errorText = await tasksResponse.text();
          console.error('Tasks API error:', errorText);
          throw new Error(`Tasks API failed: ${tasksResponse.status} - ${errorText}`);
        }
        
        const tasksData = await tasksResponse.json();
        console.log('Tasks data received:', tasksData?.length || 0, 'tasks');

        // Fetch all users for reassignment and user management
        const usersResponse = await fetch('/api/manager/users');
        console.log('Users response status:', usersResponse.status);
        
        if (!usersResponse.ok) {
          const errorText = await usersResponse.text();
          console.error('Users API error:', errorText);
          throw new Error(`Users API failed: ${usersResponse.status} - ${errorText}`);
        }
        
        const usersData = await usersResponse.json();
        console.log('Users data received:', usersData?.length || 0, 'users');

        setTasks(tasksData || []);
        setUsers(usersData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.email, userRole]);

  // Filter tasks based on manager's department permissions and current filters
  const filteredTasks = tasks.filter(task => {
    // First filter by manager's department permissions
    const hasPermission = task.departments.some((dept: string) => 
      departmentPermissions.includes(dept as Department)
    );
    if (!hasPermission) return false;

    // Apply additional filters
    if (filters.department !== 'all' && !task.departments.includes(filters.department)) {
      return false;
    }

    if (filters.status !== 'all') {
      const isCompleted = task.completed;
      if (filters.status === 'completed' && !isCompleted) return false;
      if (filters.status === 'pending' && isCompleted) return false;
    }

    if (filters.search && !task.task.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    return true;
  });

  const handleTaskSelection = (taskId: string, selected: boolean) => {
    if (selected) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === (filteredTasks || []).length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks((filteredTasks || []).map(task => task.id));
    }
  };

  const handleBulkOperation = async (operation: 'complete' | 'delete' | 'reassign', targetUserId?: string) => {
    if (selectedTasks.length === 0) return;

    try {
      const response = await fetch('/api/manager/bulk-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          taskIds: selectedTasks,
          targetUserId
        })
      });

      if (response.ok) {
        // Refresh tasks
        const tasksResponse = await fetch('/api/manager/tasks');
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
        setSelectedTasks([]);
      }
    } catch (error) {
      console.error('Error performing bulk operation:', error);
    }
  };

  const handleReassignTask = async (taskId: string, targetUserId: string) => {
    try {
      const response = await fetch('/api/manager/reassign-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, targetUserId })
      });

      if (response.ok) {
        // Refresh tasks
        const tasksResponse = await fetch('/api/manager/tasks');
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      }
    } catch (error) {
      console.error('Error reassigning task:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading manager dashboard...</p>
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg max-w-md">
              <p className="font-medium">Error loading dashboard:</p>
              <p className="text-sm mt-1">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!session || !userRole || !isManagerRole(userRole)) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Role: <span className="font-medium text-indigo-600">{ROLE_LABELS[userRole]}</span>
              </p>
              <p className="text-sm text-gray-500">
                Department Access: {departmentPermissions.join(', ')}
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Main
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tasks'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Task Management
              </button>
              {userRole === 'manager' && (
                <>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'users'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    User Management
                  </button>
                  <button
                    onClick={() => setActiveTab('roles')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'roles'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Role Configuration
                  </button>
                  <button
                    onClick={() => setActiveTab('updates')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'updates'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Manager Updates
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'tasks' && (
          <>
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value as Department | 'all' }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">All Departments</option>
                {departmentPermissions.map((dept: Department) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as 'all' | 'pending' | 'completed' }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search tasks..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ department: 'all', status: 'all', search: '' })}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Operations */}
        {selectedTasks.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedTasks.length} task(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkOperation('complete')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Mark Complete
                </button>
                <button
                  onClick={() => handleBulkOperation('delete')}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Tasks ({filteredTasks.length})
              </h2>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(filteredTasks || []).map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={(e) => handleTaskSelection(task.id, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{task.task}</div>
                      {task.notes && (
                        <div className="text-sm text-gray-500 mt-1">{task.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {(task.departments || []).map((dept: string) => (
                          <span
                            key={dept}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {dept}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {task.assignee?.name || 'Unassigned'}
                      </div>
                      {task.assignee && (
                        <div className="text-sm text-gray-500">{ROLE_LABELS[task.assignee.role]}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        task.completed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.completed ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <select
                          onChange={(e) => e.target.value && handleReassignTask(task.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          defaultValue=""
                        >
                          <option value="">Reassign...</option>
                          {(users || []).map(user => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({ROLE_LABELS[user.role]})
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No tasks found matching your filters.</p>
            </div>
          )}
        </div>
        </>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && userRole === 'manager' && (
          <UserManagementTab users={users} setUsers={setUsers} />
        )}

        {/* Role Configuration Tab */}
        {activeTab === 'roles' && userRole === 'manager' && (
          <RoleConfigurationTab />
        )}

        {/* Manager Updates Tab */}
        {activeTab === 'updates' && userRole === 'manager' && (
          <ManagerUpdatesTab />
        )}
      </div>
    </div>
  );
}

// Manager Updates Tab Component
function ManagerUpdatesTab() {
  interface ManagerUpdate {
    id: string;
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    type: 'announcement' | 'alert' | 'policy' | 'emergency';
    requires_acknowledgment: boolean;
    is_active: boolean;
    created_at: string;
    expires_at?: string;
  }

  const [updates, setUpdates] = useState<ManagerUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    type: 'announcement' as 'announcement' | 'alert' | 'policy' | 'emergency',
    requiresAcknowledgment: false,
    expiresAt: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/manager/updates');
      if (response.ok) {
        const data = await response.json();
        setUpdates(data.updates || []);
      } else {
        setError('Failed to load updates');
      }
    } catch (error) {
      console.error('Error loading updates:', error);
      setError('Error loading updates');
    } finally {
      setLoading(false);
    }
  };

  const createUpdate = async () => {
    if (!newUpdate.title.trim() || !newUpdate.message.trim()) {
      setError('Title and message are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const response = await fetch('/api/manager/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newUpdate.title,
          message: newUpdate.message,
          priority: newUpdate.priority,
          type: newUpdate.type,
          requiresAcknowledgment: newUpdate.requiresAcknowledgment,
          expiresAt: newUpdate.expiresAt || null
        })
      });

      if (response.ok) {
        await loadUpdates();
        setNewUpdate({
          title: '',
          message: '',
          priority: 'medium',
          type: 'announcement',
          requiresAcknowledgment: false,
          expiresAt: ''
        });
        setCreating(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create update');
      }
    } catch (error) {
      console.error('Error creating update:', error);
      setError('Error creating update');
    } finally {
      setSaving(false);
    }
  };

  const toggleUpdateStatus = async (updateId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/manager/updates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateId, isActive: !isActive })
      });

      if (response.ok) {
        await loadUpdates();
      }
    } catch (error) {
      console.error('Error toggling update status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'policy': return '📋';
      case 'emergency': return '🚨';
      case 'alert': return '⚠️';
      default: return '📢';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Manager Updates</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading updates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manager Updates</h2>
        <Button 
          onClick={() => setCreating(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create New Update
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Create New Update Form */}
      {creating && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Create New Manager Update</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newUpdate.title}
                onChange={(e) => setNewUpdate(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter update title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={newUpdate.message}
                onChange={(e) => setNewUpdate(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter detailed message..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={newUpdate.priority}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical (Forces Acknowledgment)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Type
                </label>
                <select
                  value={newUpdate.type}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, type: e.target.value as 'announcement' | 'alert' | 'policy' | 'emergency' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="announcement">Announcement</option>
                  <option value="alert">Alert</option>
                  <option value="policy">Policy/Procedure</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requiresAck"
                checked={newUpdate.requiresAcknowledgment || newUpdate.priority === 'critical'}
                onChange={(e) => setNewUpdate(prev => ({ ...prev, requiresAcknowledgment: e.target.checked }))}
                disabled={newUpdate.priority === 'critical'}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requiresAck" className="ml-2 block text-sm text-gray-700">
                Require user acknowledgment (automatically enabled for Critical priority)
              </label>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={createUpdate}
                disabled={saving || !newUpdate.title.trim() || !newUpdate.message.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Update'
                )}
              </Button>
              <Button 
                onClick={() => {
                  setCreating(false);
                  setNewUpdate({
                    title: '',
                    message: '',
                    priority: 'medium',
                    type: 'announcement',
                    requiresAcknowledgment: false,
                    expiresAt: ''
                  });
                  setError('');
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Updates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Existing Updates</h3>
        {updates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No updates created yet. Create your first update above.
          </div>
        ) : (
          (updates || []).map((update) => (
            <Card key={update.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{getTypeIcon(update.type)}</span>
                      <h4 className="font-semibold text-gray-900">{update.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(update.priority)}`}>
                        {update.priority.toUpperCase()}
                      </span>
                      {update.requires_acknowledgment && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          REQUIRES ACK
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{update.message}</p>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(update.created_at).toLocaleString()}
                      {update.expires_at && (
                        <span className="ml-4">
                          Expires: {new Date(update.expires_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button
                      onClick={() => toggleUpdateStatus(update.id, update.is_active)}
                      variant="outline"
                      size="sm"
                      className={update.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                    >
                      {update.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// User Management Tab Component
function UserManagementTab({ 
  users, 
  setUsers 
}: { 
  users: User[], 
  setUsers: React.Dispatch<React.SetStateAction<User[]>> 
}) {
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('staff');
  const [savingUser, setSavingUser] = useState<string | null>(null);
  const [savedUser, setSavedUser] = useState<string | null>(null);
  const [customizingPermissions, setCustomizingPermissions] = useState<string | null>(null);
  const [userPermissionOverrides, setUserPermissionOverrides] = useState<Record<string, Department[]>>({});

  // Load user permission overrides when component mounts or users change
  useEffect(() => {
    loadAllUserOverrides();
  }, [users]);

  const loadAllUserOverrides = async () => {
    const overrides: Record<string, Department[]> = {};
    
    for (const user of users) {
      try {
        const response = await fetch(`/api/manager/user-permissions?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.overrides && data.overrides.length > 0) {
            overrides[user.id] = data.overrides;
          }
        }
      } catch (error) {
        console.error(`Error loading overrides for user ${user.id}:`, error);
      }
    }
    
    setUserPermissionOverrides(overrides);
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    setSavingUser(userId);
    try {
      const response = await fetch('/api/manager/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
        setEditingUser(null);
        setSavedUser(userId);
        setTimeout(() => setSavedUser(null), 2000); // Reset after 2 seconds
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setSavingUser(null);
    }
  };

  const toggleUserPermission = (userId: string, department: Department) => {
    setUserPermissionOverrides(prev => {
      const current = prev[userId] || [];
      const updated = current.includes(department)
        ? current.filter(d => d !== department)
        : [...current, department];
      return { ...prev, [userId]: updated };
    });
  };

  const saveUserPermissions = async (userId: string) => {
    try {
      const departments = userPermissionOverrides[userId] || [];
      const response = await fetch('/api/manager/user-permissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, departments }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save user permissions');
      }
      setCustomizingPermissions(null);
      setSavedUser(userId);
      setTimeout(() => setSavedUser(null), 2000);
    } catch (error) {
      console.error('Error saving user permissions:', error);
    }
  };

  const getUserPermissions = (user: User): Department[] => {
    // Get base permissions from role
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    // Apply user-specific overrides if any exist
    const overrides = userPermissionOverrides[user.id] || [];
    // Return overrides if they exist, otherwise return role permissions
    return overrides.length > 0 ? overrides : rolePermissions;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Management</h2>
      <div className="grid gap-4">
        {(users || []).map(user => (
          <Card key={user.id} className={savedUser === user.id ? "ring-2 ring-green-500 transition-all duration-500" : ""}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <span>Departments:</span>
                    {(getUserPermissions(user) || []).length > 0 ? (
                      (getUserPermissions(user) || []).map(dept => (
                        <span key={dept} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {dept}
                        </span>
                      ))
                    ) : (
                      <span className="italic">None (tasks only)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {editingUser === user.id ? (
                    <div className="flex items-center gap-2">
                      <div className="w-40">
                        <Select value={selectedRole} onValueChange={(value: string) => setSelectedRole(value as UserRole)}>
                          <SelectTrigger className="w-full bg-white border-2 border-blue-200 focus:border-blue-500">
                            <SelectValue placeholder="Select role">
                              {ROLE_LABELS[selectedRole] || 'Select role'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="staff">
                              <span className="font-medium">Staff</span>
                            </SelectItem>
                            <SelectItem value="foh_team_member">
                              <span className="font-medium">FOH Team Member</span>
                            </SelectItem>
                            <SelectItem value="boh_team_member">
                              <span className="font-medium">BOH Team Member</span>
                            </SelectItem>
                            <SelectItem value="lead_prep_cook">
                              <span className="font-medium">Lead Prep Cook</span>
                            </SelectItem>
                            <SelectItem value="assistant_foh_manager">
                              <span className="font-medium">Assistant FOH Manager</span>
                            </SelectItem>
                            <SelectItem value="kitchen_manager">
                              <span className="font-medium">Kitchen Manager</span>
                            </SelectItem>
                            <SelectItem value="ordering_manager">
                              <span className="font-medium">Ordering Manager</span>
                            </SelectItem>
                            <SelectItem value="manager">
                              <span className="font-medium">General Manager</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={() => updateUserRole(user.id, selectedRole)} 
                        size="sm"
                        disabled={savingUser === user.id}
                        className="min-w-[70px]"
                      >
                        {savingUser === user.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Saving
                          </>
                        ) : (
                          'Save'
                        )}
                      </Button>
                      <Button 
                        onClick={() => {
                          setEditingUser(null);
                          setSelectedRole('staff');
                        }} 
                        variant="outline" 
                        size="sm"
                        disabled={savingUser === user.id}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : customizingPermissions === user.id ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">Customize Departments for {user.name}:</p>
                      <div className="flex flex-wrap gap-2">
                        {(['BOH', 'FOH', 'AM', 'PM', 'PREP', 'CLEAN', 'CATERING', 'SPECIAL', 'TRANSITION'] as Department[]).map(department => {
                          const hasAccess = (userPermissionOverrides[user.id] || getUserPermissions(user)).includes(department);
                          return (
                            <Button
                              key={department}
                              variant={hasAccess ? "default" : "outline"}
                              onClick={() => toggleUserPermission(user.id, department)}
                              size="sm"
                              className={hasAccess ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : "border-gray-300 hover:bg-gray-50"}
                            >
                              {department.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Button>
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => saveUserPermissions(user.id)} 
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Save Custom Permissions
                        </Button>
                        <Button 
                          onClick={() => {
                            setCustomizingPermissions(null);
                            setUserPermissionOverrides(prev => {
                              const { [user.id]: _, ...rest } = prev;
                              return rest;
                            });
                          }} 
                          variant="outline" 
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`${savedUser === user.id ? 'bg-green-100 border-green-500 text-green-700' : ''} transition-colors duration-500`}
                      >
                        {ROLE_LABELS[user.role]}
                        {savedUser === user.id && (
                          <span className="ml-1 text-green-600">✓</span>
                        )}
                      </Badge>
                      <Button 
                        onClick={() => {
                          setEditingUser(user.id);
                          setSelectedRole(user.role);
                        }} 
                        size="sm"
                        variant="outline"
                        className="hover:bg-blue-50 hover:border-blue-300"
                      >
                        Edit Role
                      </Button>
                      <Button 
                        onClick={() => {
                          setCustomizingPermissions(user.id);
                          // Initialize with current role permissions if no overrides exist
                          if (!userPermissionOverrides[user.id]) {
                            setUserPermissionOverrides(prev => ({
                              ...prev,
                              [user.id]: getUserPermissions(user)
                            }));
                          }
                        }} 
                        size="sm"
                        variant="outline"
                        className="hover:bg-purple-50 hover:border-purple-300 text-purple-700"
                      >
                        Custom Permissions
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Role Configuration Tab Component
function RoleConfigurationTab() {
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, Department[]>>({
    staff: [], // Staff see only assigned tasks, no department filtering needed
    foh_team_member: ['FOH', 'CLEAN', 'TRANSITION'],
    boh_team_member: ['BOH', 'PREP'],
    kitchen_manager: ['BOH', 'PREP'],
    ordering_manager: ['BOH', 'PREP'],
    lead_prep_cook: ['BOH', 'PREP'],
    assistant_foh_manager: ['FOH', 'TRANSITION'],
    manager: ['BOH', 'FOH', 'AM', 'PM', 'PREP', 'CLEAN', 'CATERING', 'SPECIAL', 'TRANSITION'],
  });

  const [savingRole, setSavingRole] = useState<UserRole | null>(null);
  const [savedRole, setSavedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load existing role permissions on component mount
  useEffect(() => {
    loadRolePermissions();
  }, []);

  const loadRolePermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/manager/role-permissions');
      
      if (response.ok) {
        const data = await response.json();
        if (data.permissions) {
          setRolePermissions(data.permissions);
        }
      } else {
        console.error('Failed to load role permissions');
        setError('Failed to load saved role permissions. Using defaults.');
      }
    } catch (error) {
      console.error('Error loading role permissions:', error);
      setError('Error loading role permissions. Using defaults.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDepartmentPermission = (role: UserRole, department: Department) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: prev[role].includes(department)
        ? prev[role].filter(d => d !== department)
        : [...prev[role], department]
    }));
  };

  const saveDepartmentConfig = async (role: UserRole) => {
    setSavingRole(role);
    setError('');
    try {
      const response = await fetch('/api/manager/role-permissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, departments: rolePermissions[role] }),
      });

      if (response.ok) {
        const data = await response.json();
        setSavedRole(role);
        setTimeout(() => setSavedRole(null), 3000); // Reset after 3 seconds
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save role permissions');
      }
    } catch (error) {
      console.error('Error updating role permissions:', error);
      setError('Network error occurred while saving');
    } finally {
      setSavingRole(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Role Configuration</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading role permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Role Configuration</h2>
        <button
          onClick={loadRolePermissions}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
        >
          Refresh Permissions
        </button>
      </div>
      
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {Object.entries(ROLE_LABELS).map(([role, label]) => (
          <Card key={role}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Select departments this role has access to. 
                  <span className="font-medium text-green-600 ml-2">Green = Access Granted</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {(['BOH', 'FOH', 'AM', 'PM', 'PREP', 'CLEAN', 'CATERING', 'SPECIAL', 'TRANSITION'] as Department[]).map(department => {
                    const hasAccess = rolePermissions[role as UserRole]?.includes(department);
                    return (
                      <Button
                        key={department}
                        variant={hasAccess ? "default" : "outline"}
                        onClick={() => toggleDepartmentPermission(role as UserRole, department)}
                        size="sm"
                        className={hasAccess ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : "border-gray-300 hover:bg-gray-50"}
                      >
                        {department.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Button>
                    );
                  })}
                </div>
                <Button 
                  onClick={() => saveDepartmentConfig(role as UserRole)} 
                  className="mt-4"
                  disabled={savingRole === role as UserRole}
                >
                  {savingRole === role as UserRole ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : savedRole === role as UserRole ? (
                    <>
                      <div className="w-4 h-4 mr-2 text-green-500">✓</div>
                      Saved!
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}