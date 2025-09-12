'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  CalendarDaysIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { CalendarDaysIcon as CalendarDaysIconSolid } from '@heroicons/react/24/solid';

interface RecurringWorkflow {
  id: string;
  template_name: string;
  template_id: string;
  recurrence_pattern: 'daily' | 'weekly' | 'monthly';
  recurrence_config: {
    frequency?: number; // Every X days/weeks/months
    daysOfWeek?: number[]; // For weekly: [0,1,2,3,4,5,6] (Sunday = 0)
    dayOfMonth?: number; // For monthly: 1-31
    time?: string; // Time of day to assign (HH:MM)
  };
  assigned_to: string[];
  assigned_by: string;
  assigned_by_name: string;
  is_active: boolean;
  next_assignment: string;
  created_at: string;
  last_assigned?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  estimated_duration: number;
  tasks_count: number;
}

export default function RecurringWorkflows() {
  const { data: session } = useSession();
  const [workflows, setWorkflows] = useState<RecurringWorkflow[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<RecurringWorkflow | null>(null);

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [frequency, setFrequency] = useState(1);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [assignmentTime, setAssignmentTime] = useState('09:00');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  useEffect(() => {
    if (session?.user?.email) {
      Promise.all([
        fetchRecurringWorkflows(),
        fetchTemplates(),
        fetchEmployees()
      ]);
    }
  }, [session]);

  const fetchRecurringWorkflows = async () => {
    try {
      const response = await fetch('/api/recurring-workflows');
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data);
      }
    } catch (error) {
      console.error('Error fetching recurring workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/workflow/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleCreateWorkflow = async () => {
    try {
      const config: any = {
        frequency,
        time: assignmentTime
      };

      if (recurrencePattern === 'weekly') {
        config.daysOfWeek = selectedDays;
      } else if (recurrencePattern === 'monthly') {
        config.dayOfMonth = dayOfMonth;
      }

      const response = await fetch('/api/recurring-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: selectedTemplate,
          recurrence_pattern: recurrencePattern,
          recurrence_config: config,
          assigned_to: selectedEmployees,
          assigned_by: session?.user?.email
        })
      });

      if (response.ok) {
        await fetchRecurringWorkflows();
        resetForm();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating recurring workflow:', error);
    }
  };

  const toggleWorkflowStatus = async (workflowId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/recurring-workflows/${workflowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      });

      if (response.ok) {
        await fetchRecurringWorkflows();
      }
    } catch (error) {
      console.error('Error updating workflow status:', error);
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this recurring workflow?')) return;

    try {
      const response = await fetch(`/api/recurring-workflows/${workflowId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchRecurringWorkflows();
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  const resetForm = () => {
    setSelectedTemplate('');
    setRecurrencePattern('daily');
    setFrequency(1);
    setSelectedDays([]);
    setDayOfMonth(1);
    setAssignmentTime('09:00');
    setSelectedEmployees([]);
    setEditingWorkflow(null);
  };

  const getRecurrenceText = (workflow: RecurringWorkflow) => {
    const { recurrence_pattern, recurrence_config } = workflow;
    const freq = recurrence_config.frequency || 1;
    const time = recurrence_config.time || '09:00';

    if (recurrence_pattern === 'daily') {
      return freq === 1 ? `Daily at ${time}` : `Every ${freq} days at ${time}`;
    } else if (recurrence_pattern === 'weekly') {
      const days = recurrence_config.daysOfWeek || [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayText = days.map(d => dayNames[d]).join(', ');
      return freq === 1 ? `Weekly on ${dayText} at ${time}` : `Every ${freq} weeks on ${dayText} at ${time}`;
    } else {
      const day = recurrence_config.dayOfMonth || 1;
      return freq === 1 ? `Monthly on day ${day} at ${time}` : `Every ${freq} months on day ${day} at ${time}`;
    }
  };

  const getNextAssignmentText = (nextAssignment: string) => {
    const date = new Date(nextAssignment);
    const now = new Date();
    const diffHours = Math.abs(date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recurring workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recurring Workflows</h1>
              <p className="text-gray-600">Automate workflow assignments with scheduled patterns</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Recurring Workflow</span>
            </button>
          </div>
        </div>
      </div>

      {/* Workflows List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {workflows.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recurring workflows</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first recurring workflow to automate assignments.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Recurring Workflow
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <CalendarDaysIconSolid className={`w-6 h-6 mr-3 ${
                      workflow.is_active ? 'text-green-500' : 'text-gray-400'
                    }`} />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {workflow.template_name}
                    </h3>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => toggleWorkflowStatus(workflow.id, workflow.is_active)}
                      className={`p-1 rounded ${
                        workflow.is_active 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={workflow.is_active ? 'Pause' : 'Resume'}
                    >
                      {workflow.is_active ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingWorkflow(workflow);
                        setShowCreateModal(true);
                      }}
                      className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteWorkflow(workflow.id)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    {getRecurrenceText(workflow)}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <UsersIcon className="w-4 h-4 mr-2" />
                    {workflow.assigned_to.length} employee{workflow.assigned_to.length !== 1 ? 's' : ''}
                  </div>

                  <div className="bg-gray-50 rounded-md p-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Next Assignment</p>
                    <p className="text-sm text-gray-900">
                      {getNextAssignmentText(workflow.next_assignment)}
                    </p>
                  </div>

                  {workflow.last_assigned && (
                    <div className="text-xs text-gray-500">
                      Last assigned: {new Date(workflow.last_assigned).toLocaleDateString()}
                    </div>
                  )}

                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    workflow.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {workflow.is_active ? 'Active' : 'Paused'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingWorkflow ? 'Edit Recurring Workflow' : 'Create Recurring Workflow'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select a template...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.tasks_count} tasks, ~{template.estimated_duration}min)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recurrence Pattern */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recurrence Pattern
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['daily', 'weekly', 'monthly'] as const).map((pattern) => (
                      <button
                        key={pattern}
                        onClick={() => setRecurrencePattern(pattern)}
                        className={`p-3 border rounded-md text-center capitalize ${
                          recurrencePattern === pattern
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pattern}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <div className="flex items-center space-x-2">
                    <span>Every</span>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={frequency}
                      onChange={(e) => setFrequency(parseInt(e.target.value))}
                      className="w-16 border border-gray-300 rounded-md px-2 py-1 text-center"
                    />
                    <span>
                      {recurrencePattern === 'daily' && (frequency === 1 ? 'day' : 'days')}
                      {recurrencePattern === 'weekly' && (frequency === 1 ? 'week' : 'weeks')}
                      {recurrencePattern === 'monthly' && (frequency === 1 ? 'month' : 'months')}
                    </span>
                  </div>
                </div>

                {/* Weekly - Days Selection */}
                {recurrencePattern === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Days of Week
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {dayNames.map((day, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (selectedDays.includes(index)) {
                              setSelectedDays(selectedDays.filter(d => d !== index));
                            } else {
                              setSelectedDays([...selectedDays, index]);
                            }
                          }}
                          className={`p-2 border rounded-md text-xs text-center ${
                            selectedDays.includes(index)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Monthly - Day Selection */}
                {recurrencePattern === 'monthly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day of Month
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={dayOfMonth}
                      onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                      className="w-24 border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                )}

                {/* Assignment Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Time
                  </label>
                  <input
                    type="time"
                    value={assignmentTime}
                    onChange={(e) => setAssignmentTime(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                {/* Employee Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign To
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
                    {employees.map((employee) => (
                      <label key={employee.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee.email)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployees([...selectedEmployees, employee.email]);
                            } else {
                              setSelectedEmployees(selectedEmployees.filter(email => email !== employee.email));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{employee.name} ({employee.email})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateWorkflow}
                    disabled={!selectedTemplate || selectedEmployees.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingWorkflow ? 'Update' : 'Create'} Workflow
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
