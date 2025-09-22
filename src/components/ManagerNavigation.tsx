'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Settings,
  UserCheck,
  Activity,
  CheckSquare,
  MessageSquare,
  RefreshCw,
  Calendar,
  Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LanguageToggleCompact } from '@/components/LanguageToggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

type ManagerTool = 
  | 'dashboard' 
  | 'tasks' 
  | 'users' 
  | 'roles' 
  | 'updates' 
  | 'analytics'
  | 'workflows'
  | 'create-tasks'
  | 'employee-management'
  | 'reports'
  | 'task-transfers';

interface ManagerNavigationProps {
  currentTool: ManagerTool;
  title: string;
  subtitle?: string;
}

const toolsConfig = [
  { 
    id: 'dashboard' as ManagerTool, 
    label: 'Dashboard Overview', 
    icon: BarChart3,
    path: '/manager-dashboard'
  },
  { 
    id: 'tasks' as ManagerTool, 
    label: 'Task Management', 
    icon: CheckSquare,
    path: '/manager-dashboard?tool=tasks'
  },
  { 
    id: 'users' as ManagerTool, 
    label: 'User Management', 
    icon: Users,
    path: '/manager/employee-management'
  },
  { 
    id: 'roles' as ManagerTool, 
    label: 'Role Configuration', 
    icon: Settings,
    path: '/manager-dashboard?tool=roles'
  },
  { 
    id: 'updates' as ManagerTool, 
    label: 'Manager Updates', 
    icon: MessageSquare,
    path: '/manager-dashboard?tool=updates'
  },
  { 
    id: 'analytics' as ManagerTool, 
    label: 'Analytics & Reports', 
    icon: Activity,
    path: '/manager-dashboard?tool=analytics'
  },
  { 
    id: 'workflows' as ManagerTool, 
    label: 'Workflow Management', 
    icon: RefreshCw,
    path: '/manager/workflows'
  },
  { 
    id: 'create-tasks' as ManagerTool, 
    label: 'Create Tasks', 
    icon: Plus,
    path: '/manager/create-tasks'
  },
  { 
    id: 'employee-management' as ManagerTool, 
    label: 'User Management', 
    icon: UserCheck,
    path: '/manager/employee-management'
  },
  { 
    id: 'reports' as ManagerTool, 
    label: 'Reports & Analytics', 
    icon: FileText,
    path: '/manager/reports'
  },
  { 
    id: 'task-transfers' as ManagerTool, 
    label: 'Task Transfers', 
    icon: Calendar,
    path: '/manager/task-transfers'
  }
];

export default function ManagerNavigation({ currentTool, title, subtitle }: ManagerNavigationProps) {
  const router = useRouter();

  const getCurrentTool = () => {
    return toolsConfig.find(tool => tool.id === currentTool) || toolsConfig[0];
  };

  const handleToolSelection = (toolId: ManagerTool) => {
    const tool = toolsConfig.find(t => t.id === toolId);
    if (tool) {
      router.push(tool.path);
    }
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-6">
        {/* Tool Selector */}
        <div className="glass rounded-xl p-4 border border-white/20 relative z-[100000]">
          <div className="relative z-[100001]">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Management Tools
            </label>
            <div className="relative z-[100002]">
              <Select value={currentTool} onValueChange={(value) => handleToolSelection(value as ManagerTool)}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Choose a management tool">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const IconComponent = getCurrentTool().icon;
                        return <IconComponent className="h-4 w-4" />;
                      })()}
                      <span>{getCurrentTool().label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent 
                  className="w-64 z-[99999] bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl"
                  style={{ position: 'fixed', zIndex: 99999 }}
                >
                  {toolsConfig.map((tool) => {
                    const IconComponent = tool.icon;
                    return (
                      <SelectItem key={tool.id} value={tool.id} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{tool.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
          {subtitle && <p className="text-slate-600">{subtitle}</p>}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <LanguageToggleCompact />
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          Manager
        </Badge>
      </div>
    </div>
  );
}