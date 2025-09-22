'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Camera, 
  FileText, 
  AlertCircle,
  ChevronRight 
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage, staticTranslations } from '@/contexts/LanguageContext';

interface WorkflowTask {
  id: string;
  title: string;
  description?: string;
  is_required: boolean;
  is_photo_mandatory: boolean;
  is_notes_mandatory: boolean;
  order_index: number;
  completed_at?: string;
  notes?: string;
  photo_url?: string;
}

interface WorkflowAssignment {
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
  };
  tasks: WorkflowTask[];
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export default function WorkflowExecutionPage() {
  const { id: workflowId } = useParams();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('assignment');
  const router = useRouter();
  const { data: session, status } = useSession();

  const [assignment, setAssignment] = useState<WorkflowAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const { language } = useLanguage();

  useEffect(() => {
    if (status === 'authenticated' && assignmentId) {
      fetchWorkflowAssignment();
    }
  }, [status, assignmentId]);

  const fetchWorkflowAssignment = async () => {
    try {
      const response = await fetch(`/api/workflow-assignments/${assignmentId}`);
      if (response.ok) {
        const data = await response.json();
        setAssignment(data);
        
        // Find the first incomplete task
        const firstIncompleteIndex = data.tasks.findIndex((task: WorkflowTask) => !task.completed_at);
        if (firstIncompleteIndex !== -1) {
          setCurrentTaskIndex(firstIncompleteIndex);
        }
      } else {
        setError('Failed to load workflow assignment');
      }
    } catch (error) {
      console.error('Error fetching workflow assignment:', error);
      setError('Failed to load workflow assignment');
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string, notes?: string, photoUrl?: string) => {
    try {
      const response = await fetch('/api/workflow-tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          assignment_id: assignmentId,
          task_id: taskId,
          notes,
          photo_url: photoUrl
        })
      });

      if (response.ok) {
        // Refresh the assignment data
        await fetchWorkflowAssignment();
        
        // Move to next task if available
        if (assignment && currentTaskIndex < assignment.tasks.length - 1) {
          setCurrentTaskIndex(currentTaskIndex + 1);
        }
      } else {
        setError('Failed to complete task');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      setError('Failed to complete task');
    }
  };

  const startWorkflow = async () => {
    try {
      const response = await fetch('/api/my-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ assignment_id: assignmentId })
      });

      if (response.ok) {
        await fetchWorkflowAssignment();
      } else {
        setError('Failed to start workflow');
      }
    } catch (error) {
      console.error('Error starting workflow:', error);
      setError('Failed to start workflow');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">{staticTranslations.loadingWorkflow[language]}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/');
    return null;
  }

  if (error || !assignment) {
    return (
      <>
        <Navigation currentPage="workflows" />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 md:ml-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="glass rounded-2xl p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{staticTranslations.workflowNotFound[language]}</h1>
              <p className="text-slate-600 mb-6">{error || staticTranslations.workflowNotFoundMessage[language]}</p>
              <Button onClick={() => router.push('/workflows')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {staticTranslations.backToMyTasks[language]}
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const currentTask = assignment.tasks[currentTaskIndex];
  const isWorkflowCompleted = assignment.status === 'completed';
  const isTaskCompleted = currentTask?.completed_at;

  return (
    <>
      <Navigation currentPage="workflows" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 md:ml-64">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/workflows')}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {staticTranslations.backToMyTasks[language]}
              </Button>
              
              <Badge className={`${
                assignment.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : assignment.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {assignment.status === 'completed' && <CheckCircle className="w-4 h-4 mr-1" />}
                {assignment.status === 'in_progress' && <Clock className="w-4 h-4 mr-1" />}
                {assignment.status === 'pending' && <Clock className="w-4 h-4 mr-1" />}
                {assignment.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-2 brand-header">
              {assignment.workflow.name}
            </h1>
            
            {assignment.workflow.description && (
              <p className="text-slate-600 mb-4">{assignment.workflow.description}</p>
            )}

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>{staticTranslations.overallProgress[language]}</span>
                <span>{assignment.progress.completed}/{assignment.progress.total} {staticTranslations.tasksCompleted[language]}</span>
              </div>
              <Progress value={assignment.progress.percentage} className="h-3" />
            </div>

            {/* Due Date */}
            {assignment.workflow.due_date && (
              <div className="mt-4 flex items-center text-sm text-slate-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>Due: {new Date(assignment.workflow.due_date).toLocaleDateString()}</span>
                {assignment.workflow.due_time && (
                  <span> at {assignment.workflow.due_time}</span>
                )}
              </div>
            )}
          </div>

          {/* Workflow Actions */}
          {assignment.status === 'pending' && (
            <div className="glass rounded-2xl p-6 mb-6 text-center">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Ready to Start?</h2>
              <p className="text-slate-600 mb-4">Click the button below to begin this workflow.</p>
              <Button 
                onClick={startWorkflow}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start Workflow
              </Button>
            </div>
          )}

          {/* Current Task */}
          {assignment.status === 'in_progress' && currentTask && (
            <div className="glass rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Current Task ({currentTaskIndex + 1} of {assignment.tasks.length})
                </h2>
                {isTaskCompleted && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{currentTask.title}</h3>
                {currentTask.description && (
                  <p className="text-slate-600 mb-4">{currentTask.description}</p>
                )}

                {/* Task Requirements */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentTask.is_required && (
                    <Badge variant="outline" className="text-red-600 border-red-300">
                      Required
                    </Badge>
                  )}
                  {currentTask.is_photo_mandatory && (
                    <Badge variant="outline" className="text-purple-600 border-purple-300">
                      <Camera className="w-3 h-3 mr-1" />
                      Photo Required
                    </Badge>
                  )}
                  {currentTask.is_notes_mandatory && (
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      <FileText className="w-3 h-3 mr-1" />
                      Notes Required
                    </Badge>
                  )}
                </div>

                {/* Task Completion */}
                {!isTaskCompleted && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => completeTask(currentTask.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Complete
                    </Button>
                    
                    {(currentTask.is_photo_mandatory || currentTask.is_notes_mandatory) && (
                      <Button 
                        variant="outline"
                        onClick={() => router.push(`/complete-workflow-task/${assignmentId}/${currentTask.id}`)}
                      >
                        Complete with Details
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                )}

                {isTaskCompleted && (
                  <div className="text-sm text-green-600">
                    ✓ Completed on {new Date(currentTask.completed_at!).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Navigation between tasks */}
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  disabled={currentTaskIndex === 0}
                  onClick={() => setCurrentTaskIndex(currentTaskIndex - 1)}
                >
                  Previous Task
                </Button>
                
                <Button 
                  variant="outline"
                  disabled={currentTaskIndex === assignment.tasks.length - 1}
                  onClick={() => setCurrentTaskIndex(currentTaskIndex + 1)}
                >
                  Next Task
                </Button>
              </div>
            </div>
          )}

          {/* All Tasks Overview */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">All Tasks</h2>
            <div className="space-y-3">
              {assignment.tasks.map((task, index) => (
                <div 
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    task.completed_at 
                      ? 'bg-green-50 border-green-200' 
                      : index === currentTaskIndex && assignment.status === 'in_progress'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      task.completed_at 
                        ? 'bg-green-500 text-white' 
                        : index === currentTaskIndex && assignment.status === 'in_progress'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {task.completed_at ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-slate-900">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-slate-600">{task.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {task.is_required && (
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    )}
                    {task.is_photo_mandatory && (
                      <Camera className="w-4 h-4 text-purple-500" />
                    )}
                    {task.is_notes_mandatory && (
                      <FileText className="w-4 h-4 text-blue-500" />
                    )}
                    
                    {index === currentTaskIndex && assignment.status === 'in_progress' && !task.completed_at && (
                      <Badge className="bg-blue-100 text-blue-800">Current</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completion Message */}
          {isWorkflowCompleted && (
            <div className="glass rounded-2xl p-6 mt-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Workflow Completed!</h2>
              <p className="text-slate-600 mb-4">
                Great job! You have successfully completed all tasks in this workflow.
              </p>
              <p className="text-sm text-slate-500">
                Completed on {new Date(assignment.completed_at!).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}