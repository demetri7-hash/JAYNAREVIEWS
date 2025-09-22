'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'pending' | 'completed' | 'transferred';
  assignee?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  departments?: string[];
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  staff: 'Staff',
  foh_team_member: 'FOH Team Member',
  boh_team_member: 'BOH Team Member',
  lead_prep_cook: 'Lead Prep Cook',
  assistant_foh_manager: 'Assistant FOH Manager',
  kitchen_manager: 'Kitchen Manager',
  ordering_manager: 'Ordering Manager',
  manager: 'General Manager',
};

export default function TaskManagementComponent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/manager/tasks');
      if (!response.ok) {
        throw new Error(`Tasks API failed: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/manager/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleReassignTask = async (taskId: string, newAssigneeId: string) => {
    try {
      const response = await fetch('/api/manager/reassign-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ taskId, assigneeId: newAssigneeId }),
      });

      if (response.ok) {
        await fetchTasks(); // Refresh tasks
      } else {
        setError('Failed to reassign task');
      }
    } catch (error) {
      console.error('Error reassigning task:', error);
      setError('Error reassigning task');
    }
  };

  const getFilteredTasks = () => {
    const now = new Date();
    return tasks.filter(task => {
      switch (filter) {
        case 'pending':
          return task.status === 'pending';
        case 'completed':
          return task.status === 'completed';
        case 'overdue':
          return task.status === 'pending' && task.due_date && new Date(task.due_date) < now;
        default:
          return true;
      }
    });
  };

  const filteredTasks = getFilteredTasks();

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Task Management</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Task Management</h2>
        <Button onClick={fetchTasks} variant="outline">
          Refresh Tasks
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {(['all', 'pending', 'completed', 'overdue'] as const).map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? "default" : "outline"}
            onClick={() => setFilter(filterType)}
            size="sm"
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            {filterType !== 'all' && (
              <Badge variant="secondary" className="ml-2">
                {getFilteredTasks().length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Tasks Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {tasks.filter(t => t.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {tasks.filter(t => t.status === 'pending' && t.due_date && new Date(t.due_date) < new Date()).length}
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tasks found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Task</th>
                    <th className="text-left p-2">Assignee</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Due Date</th>
                    <th className="text-left p-2">Departments</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-gray-600">{task.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="text-sm font-medium">
                            {task.assignee?.name || 'Unassigned'}
                          </div>
                          {task.assignee && (
                            <div className="text-xs text-gray-500">
                              {ROLE_LABELS[task.assignee.role] || task.assignee.role}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge 
                          variant={
                            task.status === 'completed' ? 'default' : 
                            task.status === 'transferred' ? 'secondary' : 'outline'
                          }
                          className={
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'transferred' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {task.due_date ? (
                          <div className={
                            new Date(task.due_date) < new Date() && task.status === 'pending' 
                              ? 'text-red-600 font-medium' 
                              : ''
                          }>
                            {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        ) : (
                          'No due date'
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {(task.departments || []).map((dept: string) => (
                            <Badge key={dept} variant="outline" className="text-xs">
                              {dept}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-2">
                        <select
                          onChange={(e) => e.target.value && handleReassignTask(task.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          defaultValue=""
                        >
                          <option value="">Reassign...</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({ROLE_LABELS[user.role] || user.role})
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}