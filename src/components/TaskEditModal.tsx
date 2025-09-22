'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  title: string;
  description: string;
  departments: string[];
  archived: boolean;
  requires_photo: boolean;
  requires_notes: boolean;
  created_at: string;
  updated_at: string;
}

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (updatedTask: Task) => void;
}

const AVAILABLE_DEPARTMENTS = [
  'FOH', 'BOH', 'Kitchen', 'Management', 'All Departments'
];

export default function TaskEditModal({ isOpen, onClose, task, onSave }: TaskEditModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departments: [] as string[],
    requires_photo: false,
    requires_notes: false,
    archived: false
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        departments: task.departments,
        requires_photo: task.requires_photo,
        requires_notes: task.requires_notes,
        archived: task.archived
      });
    }
  }, [task]);

  const handleDepartmentToggle = (department: string) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.includes(department)
        ? prev.departments.filter(d => d !== department)
        : [...prev.departments, department]
    }));
  };

  const handleSave = async () => {
    if (!task) return;
    
    // Validation
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }
    
    if (formData.departments.length === 0) {
      setError('At least one department must be selected');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/manager/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          departments: formData.departments,
          requires_photo: formData.requires_photo,
          requires_notes: formData.requires_notes,
          archived: formData.archived
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      onSave(updatedTask);
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-slate-800">Edit Task</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter task title..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter task description..."
            />
          </div>

          {/* Departments */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Departments *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_DEPARTMENTS.map((dept) => (
                <label
                  key={dept}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.departments.includes(dept)}
                    onChange={() => handleDepartmentToggle(dept)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{dept}</span>
                </label>
              ))}
            </div>
            {formData.departments.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.departments.map(dept => (
                  <Badge key={dept} variant="secondary" className="text-xs">
                    {dept}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Task Requirements
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requires_photo}
                  onChange={(e) => setFormData(prev => ({ ...prev, requires_photo: e.target.checked }))}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">📷 Requires Photo</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requires_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, requires_notes: e.target.checked }))}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">📝 Requires Notes</span>
              </label>
            </div>
          </div>

          {/* Archive Status */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.archived}
                onChange={(e) => setFormData(prev => ({ ...prev, archived: e.target.checked }))}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Archive this task</span>
            </label>
          </div>

          {/* Task Info */}
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
            <div>Created: {new Date(task.created_at).toLocaleString()}</div>
            <div>Last Updated: {new Date(task.updated_at).toLocaleString()}</div>
            <div className="mt-1 font-medium">
              Note: Changes will update this task everywhere it&apos;s used in workflows
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-slate-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}