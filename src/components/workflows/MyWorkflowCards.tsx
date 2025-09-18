'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Calendar,
  Camera,
  FileText,
  ChevronRight
} from 'lucide-react';
import { MyWorkflowsProps } from '@/types/workflow';

interface WorkflowAssignmentWithProgress {
  id: string;
  workflow_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_at: string;
  started_at?: string;
  completed_at?: string;
  workflow: {
    id: string;
    name: string;
    description?: string;
    due_date?: string;
    due_time?: string;
    is_repeatable: boolean;
    recurrence_type?: string;
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  nextTask?: {
    id: string;
    title: string;
    description?: string;
    is_required: boolean;
    is_photo_mandatory: boolean;
    is_notes_mandatory: boolean;
  };
}

export default function MyWorkflowCards({ userId: _userId, userRole: _userRole }: MyWorkflowsProps) {
  const [assignments, setAssignments] = useState<WorkflowAssignmentWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    fetchMyWorkflows();
  }, [filter]);

  const fetchMyWorkflows = async () => {
    try {
      const response = await fetch(`/api/my-workflows?status=${filter}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWorkflow = async (assignmentId: string) => {
    try {
      const response = await fetch('/api/my-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment_id: assignmentId })
      });

      if (response.ok) {
        fetchMyWorkflows(); // Refresh the list
      }
    } catch (error) {
      console.error('Error starting workflow:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDateTime = (date?: string, time?: string) => {
    if (!date) return null;
    
    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString();
    
    if (time) {
      return `${dateStr} at ${time}`;
    }
    
    return dateStr;
  };

  const isOverdue = (dueDate?: string, dueTime?: string) => {
    if (!dueDate) return false;
    
    const now = new Date();
    const due = new Date(dueDate);
    
    if (dueTime) {
      const [hours, minutes] = dueTime.split(':').map(Number);
      due.setHours(hours, minutes, 0, 0);
    } else {
      due.setHours(23, 59, 59, 999);
    }
    
    return now > due;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <CheckCircle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No workflows assigned</h3>
            <p>You do not have any workflows assigned at the moment.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'completed', label: 'Completed' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as 'all' | 'pending' | 'in_progress' | 'completed')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Workflow Cards */}
      <div className="space-y-4">
        {assignments.map(assignment => {
          const { workflow, progress, nextTask } = assignment;
          const overdue = isOverdue(workflow.due_date, workflow.due_time);
          
          return (
            <Card 
              key={assignment.id} 
              className={`transition-all hover:shadow-md ${
                overdue && assignment.status !== 'completed' 
                  ? 'border-red-300 bg-red-50' 
                  : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    {workflow.description && (
                      <p className="text-sm text-gray-600">{workflow.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(assignment.status)}>
                      {getStatusIcon(assignment.status)}
                      <span className="ml-1 capitalize">
                        {assignment.status.replace('_', ' ')}
                      </span>
                    </Badge>
                    
                    {workflow.is_repeatable && (
                      <Badge variant="outline" className="text-xs">
                        {workflow.recurrence_type}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress.completed}/{progress.total} tasks</span>
                  </div>
                  <Progress value={progress.percentage} className="h-2" />
                </div>

                {/* Due Date */}
                {workflow.due_date && (
                  <div className={`flex items-center space-x-2 text-sm ${
                    overdue ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    <Calendar className="h-4 w-4" />
                    <span>
                      Due: {formatDateTime(workflow.due_date, workflow.due_time)}
                      {overdue && <span className="ml-2 font-medium">(Overdue)</span>}
                    </span>
                  </div>
                )}

                {/* Next Task */}
                {nextTask && assignment.status !== 'completed' && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Next Task:</span>
                      <div className="flex items-center space-x-1">
                        {nextTask.is_photo_mandatory && (
                          <div title="Photo required">
                            <Camera className="h-3 w-3 text-gray-500" />
                          </div>
                        )}
                        {nextTask.is_notes_mandatory && (
                          <div title="Notes required">
                            <FileText className="h-3 w-3 text-gray-500" />
                          </div>
                        )}
                        {nextTask.is_required && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm">{nextTask.title}</div>
                    {nextTask.description && (
                      <div className="text-xs text-gray-600">{nextTask.description}</div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-gray-500">
                    {assignment.status === 'pending' && 'Assigned'}
                    {assignment.status === 'in_progress' && 'Started'}
                    {assignment.status === 'completed' && 'Completed'} {' '}
                    {new Date(
                      assignment.completed_at || 
                      assignment.started_at || 
                      assignment.assigned_at
                    ).toLocaleDateString()}
                  </div>
                  
                  <div className="flex space-x-2">
                    {assignment.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => startWorkflow(assignment.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}
                    
                    {(assignment.status === 'in_progress' || assignment.status === 'completed') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // Navigate to workflow details/task completion page
                          window.location.href = `/workflows/${assignment.workflow_id}?assignment=${assignment.id}`;
                        }}
                      >
                        {assignment.status === 'completed' ? 'View Details' : 'Continue'}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}