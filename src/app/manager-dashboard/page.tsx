'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChecklistItem, UserRole, isManagerRole } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggleCompact } from '@/components/LanguageToggle';
import ManagerDashboardSummary from '@/components/ManagerDashboardSummary';
import EnhancedUserManagement from '@/components/EnhancedUserManagement';
import ManagerUpdatesComponent from '@/components/ManagerUpdatesComponent';
import TaskManagementSimple from '@/components/TaskManagementSimple';
import RoleConfigurationComponent from '@/components/RoleConfigurationComponent';
import { Settings, Users, Workflow, ArrowLeftRight, UserCog, BarChart3, Plus, ClipboardList, Megaphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ManagerTool = 'summary' | 'tasks' | 'users' | 'roles' | 'updates' | 'workflows' | 'transfers' | 'employee-mgmt' | 'reports' | 'task-creation';

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
  employee_status?: string;
  toast_employee_id?: string;
  archived_at?: string;
  archived_by?: string;
}

const managerTools = [
  { id: 'summary', label: 'Dashboard Summary', icon: BarChart3, description: 'Overview of today\'s progress and metrics' },
  { id: 'tasks', label: 'Task Management', icon: ClipboardList, description: 'Manage and assign tasks' },
  { id: 'users', label: 'User Management', icon: Users, description: 'Manage user accounts and permissions' },
  { id: 'roles', label: 'Role Configuration', icon: Settings, description: 'Configure user roles and permissions' },
  { id: 'updates', label: 'Manager Updates', icon: Megaphone, description: 'Send updates and announcements' },
  { id: 'workflows', label: 'Workflow Management', icon: Workflow, description: 'Create and manage workflows' },
  { id: 'transfers', label: 'Task Transfers', icon: ArrowLeftRight, description: 'Handle task transfers between staff' },
  { id: 'employee-mgmt', label: 'Employee Management', icon: UserCog, description: 'Advanced employee management' },
  { id: 'reports', label: 'Weekly Reports', icon: BarChart3, description: 'Generate and view reports' },
  { id: 'task-creation', label: 'Create Tasks', icon: Plus, description: 'Create new tasks and workflows' }
];

export default function ManagerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTool, setActiveTool] = useState<ManagerTool>('summary');
  const [tasks, setTasks] = useState<TaskWithAssignee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const userRole = session?.user?.role as UserRole;

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

  // Fetch data only when specific tools are selected that need it
  useEffect(() => {
    if (!session?.user?.email || !userRole) return;
    
    // Only fetch heavy data when specific tabs are accessed
    if (activeTool === 'tasks' || activeTool === 'users' || activeTool === 'roles') {
      fetchDataForTool(activeTool);
    }
  }, [session?.user?.email, userRole, activeTool]);

  const fetchDataForTool = async (tool: ManagerTool) => {
    try {
      setLoading(true);
      setError(null);
      
      if (tool === 'tasks') {
        const tasksResponse = await fetch('/api/manager/tasks');
        if (!tasksResponse.ok) {
          throw new Error(`Tasks API failed: ${tasksResponse.status}`);
        }
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.tasks || []);
      }
      
      if (tool === 'users' || tool === 'roles') {
        const usersResponse = await fetch('/api/manager/users');
        if (!usersResponse.ok) {
          throw new Error(`Users API failed: ${usersResponse.status}`);
        }
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Failed to load ${tool} data. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleToolSelection = (toolId: ManagerTool) => {
    setActiveTool(toolId);
    
    // Redirect to separate pages for heavy components
    switch (toolId) {
      case 'workflows':
        router.push('/manager/workflows');
        break;
      case 'transfers':
        router.push('/manager/task-transfers');
        break;
      case 'employee-mgmt':
        router.push('/manager/employee-management');
        break;
      case 'reports':
        router.push('/manager/reports');
        break;
      case 'task-creation':
        router.push('/manager/create-tasks');
        break;
      default:
        // Keep lightweight tools on the same page
        break;
    }
  };

  const getCurrentTool = () => {
    return managerTools.find(tool => tool.id === activeTool) || managerTools[0];
  };

  const renderToolContent = () => {
    switch (activeTool) {
      case 'summary':
        return <ManagerDashboardSummary />;
      
      case 'tasks':
        return <TaskManagementSimple />;
      
      case 'users':
        return (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading users...</p>
              </div>
            ) : (
              <EnhancedUserManagement 
                users={users} 
                setUsers={setUsers}
              />
            )}
          </div>
        );
      
      case 'roles':
        return <RoleConfigurationComponent />;
      
      case 'updates':
        return <ManagerUpdatesComponent />;
      
      case 'workflows':
      case 'transfers':
      case 'employee-mgmt':
      case 'reports':
      case 'task-creation':
        // These are handled by separate pages
        return (
          <Card className="glass border-white/20">
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-slate-600">Redirecting to {getCurrentTool().label}...</p>
            </CardContent>
          </Card>
        );
      
      default:
        return <ManagerDashboardSummary />;
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-ocean-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Manager Dashboard</h1>
            <p className="text-slate-600">Comprehensive management tools and insights</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggleCompact />
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Manager
            </Badge>
          </div>
        </div>

        {/* Tool Selector */}
        <div className="glass rounded-2xl p-6 mb-8 border border-white/20 relative z-[100000]">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative z-[100001]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Management Tool
              </label>
              <div className="relative z-[100002]">
                <Select value={activeTool} onValueChange={(value) => handleToolSelection(value as ManagerTool)}>
                  <SelectTrigger className="w-full md:w-80">
                    <SelectValue placeholder="Choose a management tool">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const IconComponent = getCurrentTool().icon;
                          return <IconComponent className="h-4 w-4" />;
                        })()}
                        {getCurrentTool().label}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-[100003] bg-white border border-slate-200 shadow-xl">
                    {managerTools.map((tool) => {
                      const IconComponent = tool.icon;
                      return (
                        <SelectItem key={tool.id} value={tool.id}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{tool.label}</div>
                              <div className="text-xs text-slate-500">{tool.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="text-sm text-slate-600">
              <div className="font-medium">{getCurrentTool().label}</div>
              <div className="text-xs">{getCurrentTool().description}</div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
            {successMessage}
          </div>
        )}

        {/* Tool Content */}
        <div className="animate-fade-in-up">
          {renderToolContent()}
        </div>
      </div>
    </div>
  );
}