'use client';

import { useState, useEffect } from 'react';
import { Workflow, WorkflowTask } from '@/types/workflow';
import { Plus, Edit2, Trash2, Play, Calendar, Users, Settings } from 'lucide-react';

interface WorkflowManagementTabProps {
  onMessage: (message: { type: 'success' | 'error'; text: string }) => void;
}

export function WorkflowManagementTab({ onMessage }: WorkflowManagementTabProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_repeatable: false,
    recurrence_type: 'once' as 'once' | 'daily' | 'weekly' | 'monthly',
    due_date: '',
    due_time: '',
    departments: [] as string[],
    roles: [] as string[],
    assigned_users: [] as string[],
    is_active: true
  });

  const departments = ['Kitchen', 'Front of House', 'Management', 'Cleaning'];
  const roles = ['Manager', 'Lead Cook', 'Line Cook', 'Prep Cook', 'Server', 'Host'];

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workflows');
      if (!response.ok) throw new Error('Failed to fetch workflows');
      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      onMessage({ type: 'error', text: 'Failed to load workflows' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create workflow');
      
      onMessage({ type: 'success', text: 'Workflow created successfully' });
      setShowCreateForm(false);
      resetForm();
      fetchWorkflows();
    } catch (error) {
      console.error('Error creating workflow:', error);
      onMessage({ type: 'error', text: 'Failed to create workflow' });
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete workflow');
      
      onMessage({ type: 'success', text: 'Workflow deleted successfully' });
      fetchWorkflows();
      setSelectedWorkflow(null);
    } catch (error) {
      console.error('Error deleting workflow:', error);
      onMessage({ type: 'error', text: 'Failed to delete workflow' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_repeatable: false,
      recurrence_type: 'once',
      due_date: '',
      due_time: '',
      departments: [],
      roles: [],
      assigned_users: [],
      is_active: true
    });
    setEditingWorkflow(null);
  };

  const handleInputChange = (field: string, value: string | boolean | 'once' | 'daily' | 'weekly' | 'monthly') => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: 'departments' | 'roles' | 'assigned_users', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflow Management</h2>
          <p className="text-gray-600">Create and manage automated workflows for your team</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Workflow
        </button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingWorkflow) && (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workflow Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter workflow name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe this workflow..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departments
              </label>
              <div className="flex flex-wrap gap-2">
                {departments.map(dept => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleArrayToggle('departments', dept)}
                    className={`px-3 py-1 text-sm rounded ${
                      formData.departments.includes(dept)
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roles
              </label>
              <div className="flex flex-wrap gap-2">
                {roles.map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleArrayToggle('roles', role)}
                    className={`px-3 py-1 text-sm rounded ${
                      formData.roles.includes(role)
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_repeatable}
                  onChange={(e) => handleInputChange('is_repeatable', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Repeatable Workflow</span>
              </label>
            </div>

            {formData.is_repeatable && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recurrence
                </label>
                <select
                  value={formData.recurrence_type}
                  onChange={(e) => handleInputChange('recurrence_type', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="once">One Time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateWorkflow}
              disabled={!formData.name.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingWorkflow ? 'Update' : 'Create'} Workflow
            </button>
          </div>
        </div>
      )}

      {/* Workflows List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    setEditingWorkflow(workflow);
                    setFormData({
                      name: workflow.name,
                      description: workflow.description || '',
                      is_repeatable: workflow.is_repeatable,
                      recurrence_type: workflow.recurrence_type || 'once',
                      due_date: workflow.due_date || '',
                      due_time: workflow.due_time || '',
                      departments: workflow.departments,
                      roles: workflow.roles,
                      assigned_users: workflow.assigned_users,
                      is_active: workflow.is_active
                    });
                    setShowCreateForm(true);
                  }}
                  className="p-1 text-gray-500 hover:text-blue-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteWorkflow(workflow.id)}
                  className="p-1 text-gray-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {workflow.is_repeatable ? 
                  `${workflow.recurrence_type || 'once'}` : 
                  workflow.due_date ? new Date(workflow.due_date).toLocaleDateString() : 'No due date'
                }
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {workflow.departments.length} dept{workflow.departments.length !== 1 ? 's' : ''}, 
                {workflow.roles.length} role{workflow.roles.length !== 1 ? 's' : ''}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Settings className="h-4 w-4 mr-2" />
                {workflow.tasks?.length || 0} task{(workflow.tasks?.length || 0) !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className={`px-2 py-1 text-xs rounded ${
                workflow.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {workflow.is_active ? 'Active' : 'Inactive'}
              </span>
              
              <button
                onClick={() => setSelectedWorkflow(workflow)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>

      {workflows.length === 0 && (
        <div className="text-center py-8">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows created yet</h3>
          <p className="text-gray-600 mb-4">Create your first workflow to automate team tasks</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create First Workflow
          </button>
        </div>
      )}

      {/* Workflow Details Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{selectedWorkflow.name}</h3>
                <button
                  onClick={() => setSelectedWorkflow(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedWorkflow.description || 'No description'}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Departments</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkflow.departments.map(dept => (
                      <span key={dept} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Roles</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkflow.roles.map(role => (
                      <span key={role} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Schedule</h4>
                  <p className="text-gray-600">
                    {selectedWorkflow.is_repeatable 
                      ? `Repeats ${selectedWorkflow.recurrence_type}` 
                      : selectedWorkflow.due_date 
                        ? `Due: ${new Date(selectedWorkflow.due_date).toLocaleDateString()}`
                        : 'No specific due date'
                    }
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tasks</h4>
                  {selectedWorkflow.tasks && selectedWorkflow.tasks.length > 0 ? (
                    <div className="space-y-2">
                      {selectedWorkflow.tasks.map((workflowTask, index) => (
                        <div key={workflowTask.id} className="p-3 bg-gray-50 rounded">
                          <div className="font-medium">
                            {index + 1}. {workflowTask.task?.title || 'Task'}
                          </div>
                          {workflowTask.task?.description && (
                            <div className="text-sm text-gray-600 mt-1">
                              {workflowTask.task.description}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            {workflowTask.is_required ? 'Required' : 'Optional'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No tasks assigned yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}