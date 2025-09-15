'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChecklistItem, UserRole, Department, isManagerRole, getDepartmentPermissions, ROLE_LABELS } from '../../types';
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
  const [activeTab, setActiveTab] = useState<'tasks' | 'users' | 'roles'>('tasks');
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
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id));
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
                {filteredTasks.map((task) => (
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
                        {task.departments.map((dept: string) => (
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
                          {users.map(user => (
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

  const updateUserRole = async (userId: string, newRole: UserRole) => {
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
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Management</h2>
      <div className="grid gap-4">
        {users.map(user => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  {editingUser === user.id ? (
                    <div className="flex items-center gap-2">
                      <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="kitchen_manager">Kitchen Manager</SelectItem>
                          <SelectItem value="ordering_manager">Ordering Manager</SelectItem>
                          <SelectItem value="manager">General Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={() => updateUserRole(user.id, selectedRole)} size="sm">
                        Save
                      </Button>
                      <Button onClick={() => setEditingUser(null)} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{ROLE_LABELS[user.role]}</Badge>
                      <Button 
                        onClick={() => {
                          setEditingUser(user.id);
                          setSelectedRole(user.role);
                        }} 
                        size="sm"
                      >
                        Edit Role
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
    kitchen_manager: ['BOH', 'PREP'],
    ordering_manager: ['BOH', 'PREP'],
    lead_prep_cook: ['BOH', 'PREP'],
    assistant_foh_manager: ['FOH', 'TRANSITION'],
    manager: ['BOH', 'FOH', 'AM', 'PM', 'PREP', 'CLEAN', 'CATERING', 'SPECIAL', 'TRANSITION'],
  });

  const toggleDepartmentPermission = (role: UserRole, department: Department) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: prev[role].includes(department)
        ? prev[role].filter(d => d !== department)
        : [...prev[role], department]
    }));
  };

  const saveDepartmentConfig = async (role: UserRole) => {
    try {
      const response = await fetch('/api/manager/role-permissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, departments: rolePermissions[role] }),
      });

      if (response.ok) {
        // Show success message
        console.log('Role permissions updated');
      }
    } catch (error) {
      console.error('Error updating role permissions:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Role Configuration</h2>
      <div className="grid gap-6">
        {Object.entries(ROLE_LABELS).map(([role, label]) => (
          <Card key={role}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Select departments this role has access to:</p>
                <div className="flex flex-wrap gap-2">
                  {(['BOH', 'FOH', 'AM', 'PM', 'PREP', 'CLEAN', 'CATERING', 'SPECIAL', 'TRANSITION'] as Department[]).map(department => (
                    <Button
                      key={department}
                      variant={rolePermissions[role as UserRole]?.includes(department) ? "default" : "outline"}
                      onClick={() => toggleDepartmentPermission(role as UserRole, department)}
                      size="sm"
                    >
                      {department.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Button>
                  ))}
                </div>
                <Button onClick={() => saveDepartmentConfig(role as UserRole)} className="mt-4">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}