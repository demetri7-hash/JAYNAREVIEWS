'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ManagerUpdate {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'announcement' | 'alert' | 'policy' | 'emergency';
  requires_acknowledgment: boolean;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

export default function ManagerUpdatesComponent() {
  const [updates, setUpdates] = useState<ManagerUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    type: 'announcement' as 'announcement' | 'alert' | 'policy' | 'emergency',
    requiresAcknowledgment: false,
    expiresAt: '',
    photo: null as File | null
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/manager/updates?showRead=true&limit=50');
      if (response.ok) {
        const data = await response.json();
        setUpdates(data.updates || []);
      } else {
        setError('Failed to load updates');
      }
    } catch (error) {
      console.error('Error loading updates:', error);
      setError('Error loading updates');
    } finally {
      setLoading(false);
    }
  };

  const createUpdate = async () => {
    if (!newUpdate.title.trim() || !newUpdate.message.trim()) {
      setError('Title and message are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const response = await fetch('/api/manager/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: newUpdate.title,
          message: newUpdate.message,
          priority: newUpdate.priority,
          type: newUpdate.type,
          requiresAcknowledgment: newUpdate.requiresAcknowledgment,
          expiresAt: newUpdate.expiresAt || null,
          photoUrl: null
        })
      });

      if (response.ok) {
        await loadUpdates();
        setNewUpdate({
          title: '',
          message: '',
          priority: 'medium',
          type: 'announcement',
          requiresAcknowledgment: false,
          expiresAt: '',
          photo: null
        });
        setCreating(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create update');
      }
    } catch (error) {
      console.error('Error creating update:', error);
      setError('Error creating update');
    } finally {
      setSaving(false);
    }
  };

  const toggleUpdateStatus = async (updateId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/manager/updates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateId, isActive: !isActive })
      });

      if (response.ok) {
        await loadUpdates();
      }
    } catch (error) {
      console.error('Error toggling update status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'policy': return '📋';
      case 'emergency': return '🚨';
      case 'alert': return '⚠️';
      default: return '📢';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Manager Updates</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading updates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manager Updates</h2>
        <Button 
          onClick={() => setCreating(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create New Update
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Create New Update Form */}
      {creating && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Create New Manager Update</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newUpdate.title}
                onChange={(e) => setNewUpdate(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter update title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={newUpdate.message}
                onChange={(e) => setNewUpdate(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter detailed message..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={newUpdate.priority}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Type
                </label>
                <select
                  value={newUpdate.type}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, type: e.target.value as 'announcement' | 'alert' | 'policy' | 'emergency' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="announcement">Announcement</option>
                  <option value="alert">Alert</option>
                  <option value="policy">Policy</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requiresAck"
                checked={newUpdate.requiresAcknowledgment || newUpdate.priority === 'critical'}
                onChange={(e) => setNewUpdate(prev => ({ ...prev, requiresAcknowledgment: e.target.checked }))}
                disabled={newUpdate.priority === 'critical'}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requiresAck" className="ml-2 block text-sm text-gray-700">
                Require user acknowledgment
              </label>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={createUpdate}
                disabled={saving || !newUpdate.title.trim() || !newUpdate.message.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? 'Creating...' : 'Create Update'}
              </Button>
              <Button 
                onClick={() => {
                  setCreating(false);
                  setNewUpdate({
                    title: '',
                    message: '',
                    priority: 'medium',
                    type: 'announcement',
                    requiresAcknowledgment: false,
                    expiresAt: '',
                    photo: null
                  });
                  setError('');
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Updates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Existing Updates</h3>
        {updates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No updates created yet. Create your first update above.
          </div>
        ) : (
          updates.map((update) => (
            <Card key={update.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{getTypeIcon(update.type)}</span>
                      <h4 className="font-semibold text-gray-900">{update.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(update.priority)}`}>
                        {update.priority.toUpperCase()}
                      </span>
                      {update.requires_acknowledgment && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          REQUIRES ACK
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{update.message}</p>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(update.created_at).toLocaleString()}
                      {update.expires_at && (
                        <span className="ml-4">
                          Expires: {new Date(update.expires_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button
                      onClick={() => toggleUpdateStatus(update.id, update.is_active)}
                      variant="outline"
                      size="sm"
                      className={update.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                    >
                      {update.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}