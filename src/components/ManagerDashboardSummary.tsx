'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Activity, 
  Target, 
  Calendar,
  FileText,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// API Response Types
interface UserActivity {
  user_id: string;
  user_name: string;
  user_email: string;
  completed_today: number;
  pending_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
}

interface RecentCompletion {
  id: string;
  task_title: string;
  completed_by_name: string;
  completed_at: string;
  notes: string | null;
  has_photo: boolean;
}

interface TeamActivityStats {
  totalTasks: number;
  completedToday: number;
  pendingTasks: number;
  overdueTasks: number;
  totalUsers: number;
}

interface TeamActivityResponse {
  success: boolean;
  stats: TeamActivityStats;
  recentCompletions: RecentCompletion[];
  userActivity: UserActivity[];
}

interface ManagerStats {
  totalEmployees: number;
  activeEmployees: number;
  totalTasks: number;
  completedToday: number;
  pendingTasks: number;
  overdueTasks: number;
  weeklyCompletionRate: number;
  departmentEfficiency: number;
}

interface RecentActivity {
  id: string;
  type: 'task_completed' | 'workflow_assigned' | 'employee_update' | 'report_generated';
  description: string;
  timestamp: string;
  user?: string;
}

interface UpcomingDeadline {
  id: string;
  title: string;
  type: 'task' | 'report' | 'review';
  dueDate: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ManagerUpdate {
  id: string;
  title: string;
  message: string;
  title_en?: string;
  title_es?: string; 
  title_tr?: string;
  message_en?: string;
  message_es?: string;
  message_tr?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  type: 'announcement' | 'alert' | 'policy' | 'emergency';
  requires_acknowledgment?: boolean;
  manager_update_reads?: Array<{
    id: string;
    read_at: string;
    user_id: string;
  }>;
}

export default function ManagerDashboardSummary() {
  const router = useRouter();
  const [stats, setStats] = useState<ManagerStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([]);
  const [managerUpdates, setManagerUpdates] = useState<ManagerUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerSummary();
  }, []);

  const fetchManagerSummary = async () => {
    try {
      setLoading(true);
      
      // Use the existing team-activity API for manager statistics
      const teamActivityResponse = await fetch('/api/team-activity');
      if (teamActivityResponse.ok) {
        const teamData: TeamActivityResponse = await teamActivityResponse.json();
        if (teamData.success) {
          // Map team activity data to manager stats format
          setStats({
            totalEmployees: teamData.stats.totalUsers,
            activeEmployees: teamData.stats.totalUsers, // We don't have inactive count, so use total
            totalTasks: teamData.stats.totalTasks,
            completedToday: teamData.stats.completedToday,
            pendingTasks: teamData.stats.pendingTasks,
            overdueTasks: teamData.stats.overdueTasks,
            weeklyCompletionRate: teamData.stats.completedToday > 0 ? 
              Math.round((teamData.stats.completedToday / teamData.stats.totalTasks) * 100) : 0,
            departmentEfficiency: teamData.userActivity.length > 0 ?
              Math.round(teamData.userActivity.reduce((sum: number, user: UserActivity) => sum + user.completion_rate, 0) / teamData.userActivity.length) : 0
          });

          // Use recent completions as recent activity
          setRecentActivity(teamData.recentCompletions.slice(0, 5).map((completion: RecentCompletion) => ({
            id: completion.id,
            type: 'task_completed' as const,
            description: `${completion.completed_by_name} completed "${completion.task_title}"`,
            timestamp: completion.completed_at,
            user: completion.completed_by_name
          })));
        }
      }

      // Fetch manager updates using the existing API
      const updatesResponse = await fetch('/api/manager/updates?limit=3');
      if (updatesResponse.ok) {
        const updatesData = await updatesResponse.json();
        if (updatesData.success && updatesData.updates) {
          setManagerUpdates(updatesData.updates.slice(0, 3));
        }
      }

      // For upcoming deadlines, we'll create some mock data based on pending tasks
      // In a real implementation, you'd query tasks with due dates
      setUpcomingDeadlines([
        {
          id: '1',
          title: 'Weekly Report Due',
          type: 'report',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
          priority: 'high'
        },
        {
          id: '2', 
          title: 'Staff Performance Reviews',
          type: 'review',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
          priority: 'medium'
        }
      ]);

    } catch (error) {
      console.error('Error fetching manager summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'workflow_assigned': return <Target className="h-4 w-4 text-blue-500" />;
      case 'employee_update': return <Users className="h-4 w-4 text-purple-500" />;
      case 'report_generated': return <FileText className="h-4 w-4 text-indigo-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-2xl h-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Manager Dashboard
            </h1>
            <p className="text-slate-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600">Overall Efficiency</div>
            <div className="text-2xl font-bold text-green-600">
              {stats?.departmentEfficiency || 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass border-white/20 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats?.activeEmployees || 0}</div>
            <p className="text-xs text-slate-600">
              of {stats?.totalEmployees || 0} total
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-white/20 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tasks Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats?.completedToday || 0}</div>
            <p className="text-xs text-slate-600">
              {stats?.weeklyCompletionRate || 0}% weekly rate
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-white/20 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats?.pendingTasks || 0}</div>
            <p className="text-xs text-slate-600">
              {stats?.totalTasks || 0} total tasks
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-white/20 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats?.overdueTasks || 0}</div>
            <p className="text-xs text-slate-600">
              {stats?.overdueTasks ? 'Requires attention' : 'All on track'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 font-medium">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.slice(0, 5).map((deadline) => (
                  <div key={deadline.id} className="flex items-start justify-between p-3 bg-white/50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-slate-800 font-medium">{deadline.title}</p>
                      <p className="text-xs text-slate-500">
                        Due: {new Date(deadline.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(deadline.priority)}`}>
                      {deadline.priority}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">No upcoming deadlines</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Manager Updates */}
        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-500" />
              Recent Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {managerUpdates.length > 0 ? (
                managerUpdates.map((update) => (
                  <div key={update.id} className="p-3 bg-white/50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-slate-800">{update.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(update.priority)}`}>
                        {update.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{update.message}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(update.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">No recent updates</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/manager/employee-management')}
              className="flex items-center gap-2 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Manage Employees</span>
            </button>
            <button 
              onClick={() => router.push('/manager/workflows')}
              className="flex items-center gap-2 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <Target className="h-5 w-5" />
              <span className="text-sm font-medium">Create Workflow</span>
            </button>
            <button 
              onClick={() => router.push('/manager/reports')}
              className="flex items-center gap-2 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <FileText className="h-5 w-5" />
              <span className="text-sm font-medium">Generate Report</span>
            </button>
            <button 
              onClick={() => router.push('/manager/create-tasks')}
              className="flex items-center gap-2 p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Create Tasks</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}