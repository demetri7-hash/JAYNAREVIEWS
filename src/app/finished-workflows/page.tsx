'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Clock, 
  User, 
  Calendar, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Search
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface FinishedWorkflowAssignment {
  id: string;
  workflow_id: string;
  user_id: string;
  status: 'completed';
  assigned_at: string;
  started_at: string;
  completed_at: string;
  workflow: {
    id: string;
    name: string;
    description?: string;
    created_by: string;
    is_repeatable: boolean;
    recurrence_type?: string;
    due_date?: string;
    due_time?: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  task_completions: TaskCompletion[];
  total_tasks: number;
}

interface TaskCompletion {
  id: string;
  task_id: string;
  completed_by: string;
  notes?: string;
  photo_url?: string;
  completed_at: string;
  edited_by?: string;
  edited_at?: string;
  edit_history?: {
    edited_by: string;
    edited_at: string;
    previous_notes: string;
    new_notes: string;
  }[];
  task: {
    id: string;
    title: string;
    description?: string;
    tags: string[];
    is_photo_mandatory: boolean;
    is_notes_mandatory: boolean;
  };
  completed_by_user: {
    id: string;
    name: string;
    email: string;
  };
  edited_by_user?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function FinishedWorkflowsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [assignments, setAssignments] = useState<FinishedWorkflowAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<FinishedWorkflowAssignment | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false
  });

  const fetchFinishedWorkflows = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (selectedDate) {
        params.append('date', selectedDate);
      }

      const response = await fetch(`/api/finished-workflows?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Filter by search term if provided
        let filteredAssignments = data.assignments || [];
        if (searchTerm) {
          filteredAssignments = filteredAssignments.filter((assignment: FinishedWorkflowAssignment) =>
            assignment.workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignment.user.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setAssignments(filteredAssignments);
        setPagination(data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasMore: false
        });
      } else {
        console.error('Failed to fetch finished workflows');
      }
    } catch (error) {
      console.error('Error fetching finished workflows:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, searchTerm]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/');
      return;
    }

    // Fetch user role
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user?.role) {
          setUserRole(data.user.role);
        }
      })
      .catch(() => setUserRole(null))
      .finally(() => fetchFinishedWorkflows());
  }, [session, status, fetchFinishedWorkflows, router]);

  useEffect(() => {
    if (userRole !== null) {
      fetchFinishedWorkflows(1);
    }
  }, [selectedDate, searchTerm, userRole, fetchFinishedWorkflows]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchFinishedWorkflows(newPage);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const formatDuration = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Navigation currentPage="finished-workflows" />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 md:ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Loading finished workflows...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation currentPage="finished-workflows" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-50 md:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 brand-header">
                  Finished Workflows
                </h1>
                <p className="text-slate-600 mt-2">
                  Complete accountability log of all finished workflows
                </p>
              </div>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-auto"
                  placeholder="Filter by date"
                />
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search workflows or users..."
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-ocean-600">{pagination.total}</div>
                  <div className="text-sm text-slate-600">Total Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {assignments.reduce((acc, a) => acc + a.total_tasks, 0)}
                  </div>
                  <div className="text-sm text-slate-600">Tasks Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{pagination.totalPages}</div>
                  <div className="text-sm text-slate-600">Pages of History</div>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow List */}
          {assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card 
                  key={assignment.id} 
                  className="hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedWorkflow(assignment)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Main Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            {assignment.workflow.name}
                          </h3>
                          <Badge className="bg-green-100 text-green-800 ml-2">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                        
                        {assignment.workflow.description && (
                          <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                            {assignment.workflow.description}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center text-slate-600">
                            <User className="h-4 w-4 mr-2" />
                            <span>Completed by: <strong>{assignment.user.name}</strong></span>
                          </div>
                          
                          <div className="flex items-center text-slate-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>Duration: {formatDuration(assignment.started_at, assignment.completed_at)}</span>
                          </div>
                          
                          <div className="flex items-center text-slate-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Finished: {formatDateTime(assignment.completed_at)}</span>
                          </div>
                          
                          <div className="flex items-center text-slate-600">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            <span>{assignment.total_tasks} tasks completed</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action */}
                      <div className="flex items-center">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No finished workflows found
                </h3>
                <p className="text-slate-600">
                  {selectedDate || searchTerm 
                    ? 'Try adjusting your filters to see more results.'
                    : 'Completed workflows will appear here for full accountability.'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="glass rounded-2xl p-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = Math.max(1, pagination.page - 2) + i;
                      if (page > pagination.totalPages) return null;
                      
                      return (
                        <Button
                          key={page}
                          variant={page === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Detail Modal */}
      {selectedWorkflow && (
        <WorkflowDetailModal 
          assignment={selectedWorkflow}
          userRole={userRole}
          onClose={() => setSelectedWorkflow(null)}
          onUpdate={() => {
            fetchFinishedWorkflows(pagination.page);
            setSelectedWorkflow(null);
          }}
        />
      )}
    </>
  );
}

// WorkflowDetailModal Component
interface WorkflowDetailModalProps {
  assignment: FinishedWorkflowAssignment;
  userRole: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

function WorkflowDetailModal({ assignment, userRole, onClose, onUpdate }: WorkflowDetailModalProps) {
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const isManager = userRole === 'manager' || userRole === 'admin';

  const handleEditTask = async (taskCompletionId: string, newNotes: string) => {
    if (!isManager) return;

    try {
      setSaving(true);
      
      const response = await fetch('/api/task-completions/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          completion_id: taskCompletionId,
          notes: newNotes
        })
      });

      if (response.ok) {
        setEditingTask(null);
        setEditNotes('');
        onUpdate();
      } else {
        console.error('Failed to edit task completion');
      }
    } catch (error) {
      console.error('Error editing task completion:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {assignment.workflow.name}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span>Completed by: <strong>{assignment.user.name}</strong></span>
                <span>Finished: {formatDateTime(assignment.completed_at)}</span>
                <span>Total Tasks: {assignment.total_tasks}</span>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          {/* Workflow Description */}
          {assignment.workflow.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Description</h3>
              <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">
                {assignment.workflow.description}
              </p>
            </div>
          )}

          {/* Task Completions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Completed Tasks</h3>
            
            {assignment.task_completions.map((completion, index) => (
              <Card key={completion.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-slate-900 mb-2">
                        {index + 1}. {completion.task.title}
                      </h4>
                      {completion.task.description && (
                        <p className="text-slate-600 mb-3">
                          {completion.task.description}
                        </p>
                      )}
                      
                      {/* Task Requirements */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {completion.task.is_photo_mandatory && (
                          <Badge variant="outline" className="text-purple-600">
                            Photo Required
                          </Badge>
                        )}
                        {completion.task.is_notes_mandatory && (
                          <Badge variant="outline" className="text-blue-600">
                            Notes Required
                          </Badge>
                        )}
                        {completion.task.tags.map(tag => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {isManager && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingTask(completion.id);
                          setEditNotes(completion.notes || '');
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </div>

                  {/* Completion Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Notes */}
                    <div>
                      <h5 className="font-medium text-slate-900 mb-2">Notes</h5>
                      {editingTask === completion.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            rows={4}
                            className="w-full"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleEditTask(completion.id, editNotes)}
                              disabled={saving}
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingTask(null);
                                setEditNotes('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-slate-700">
                            {completion.notes || 'No notes provided'}
                          </p>
                          
                          {/* Edit History */}
                          {completion.edited_by && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <div className="flex items-center gap-2 text-sm text-orange-600">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">EDITED BY:</span>
                                <span>{completion.edited_by_user?.name}</span>
                                <span>on {formatDateTime(completion.edited_at!)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Photo */}
                    <div>
                      <h5 className="font-medium text-slate-900 mb-2">Photo</h5>
                      {completion.photo_url ? (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <Image 
                            src={completion.photo_url} 
                            alt="Task completion photo"
                            width={400}
                            height={200}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-slate-500">No photo provided</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Completion Info */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Completed by: <strong>{completion.completed_by_user.name}</strong></span>
                      </div>
                      <span>{formatDateTime(completion.completed_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">Workflow Completed</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-green-700">
              <div>
                <span className="font-medium">Started:</span> {formatDateTime(assignment.started_at)}
              </div>
              <div>
                <span className="font-medium">Completed:</span> {formatDateTime(assignment.completed_at)}
              </div>
              <div>
                <span className="font-medium">Duration:</span> {(() => {
                  const start = new Date(assignment.started_at);
                  const end = new Date(assignment.completed_at);
                  const diffMs = end.getTime() - start.getTime();
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                  return diffHours > 0 ? `${diffHours}h ${diffMins}m` : `${diffMins}m`;
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}