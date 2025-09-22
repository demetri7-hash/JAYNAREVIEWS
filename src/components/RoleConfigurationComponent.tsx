'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type UserRole = 'staff' | 'foh_team_member' | 'boh_team_member' | 'lead_prep_cook' | 'assistant_foh_manager' | 'kitchen_manager' | 'ordering_manager' | 'manager';
type Department = 'BOH' | 'FOH' | 'AM' | 'PM' | 'PREP' | 'CLEAN' | 'CATERING' | 'SPECIAL' | 'TRANSITION';

const ROLE_LABELS: Record<UserRole, string> = {
  staff: 'Staff',
  foh_team_member: 'FOH Team Member',
  boh_team_member: 'BOH Team Member',
  lead_prep_cook: 'Lead Prep Cook',
  assistant_foh_manager: 'Assistant FOH Manager',
  kitchen_manager: 'Kitchen Manager',
  ordering_manager: 'Ordering Manager',
  manager: 'General Manager',
};

export default function RoleConfigurationComponent() {
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, Department[]>>({
    staff: [], // Staff see only assigned tasks, no department filtering needed
    foh_team_member: ['FOH', 'CLEAN', 'TRANSITION'],
    boh_team_member: ['BOH', 'PREP'],
    kitchen_manager: ['BOH', 'PREP'],
    ordering_manager: ['BOH', 'PREP'],
    lead_prep_cook: ['BOH', 'PREP'],
    assistant_foh_manager: ['FOH', 'TRANSITION'],
    manager: ['BOH', 'FOH', 'AM', 'PM', 'PREP', 'CLEAN', 'CATERING', 'SPECIAL', 'TRANSITION'],
  });

  const [savingRole, setSavingRole] = useState<UserRole | null>(null);
  const [savedRole, setSavedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load existing role permissions on component mount
  useEffect(() => {
    loadRolePermissions();
  }, []);

  const loadRolePermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/manager/role-permissions');
      
      if (response.ok) {
        const data = await response.json();
        if (data.permissions) {
          setRolePermissions(data.permissions);
        }
      } else {
        console.error('Failed to load role permissions');
        setError('Failed to load saved role permissions. Using defaults.');
      }
    } catch (error) {
      console.error('Error loading role permissions:', error);
      setError('Error loading role permissions. Using defaults.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDepartmentPermission = (role: UserRole, department: Department) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: prev[role].includes(department)
        ? prev[role].filter(d => d !== department)
        : [...prev[role], department]
    }));
  };

  const saveDepartmentConfig = async (role: UserRole) => {
    setSavingRole(role);
    setError('');
    try {
      const response = await fetch('/api/manager/role-permissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role, departments: rolePermissions[role] }),
      });

      if (response.ok) {
        setSavedRole(role);
        setTimeout(() => setSavedRole(null), 3000); // Reset after 3 seconds
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save role permissions');
      }
    } catch (error) {
      console.error('Error updating role permissions:', error);
      setError('Network error occurred while saving');
    } finally {
      setSavingRole(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Role Configuration</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading role permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Role Configuration</h2>
        <button
          onClick={loadRolePermissions}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
        >
          Refresh Permissions
        </button>
      </div>
      
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {Object.entries(ROLE_LABELS).map(([role, label]) => (
          <Card key={role}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Select departments this role has access to. 
                  <span className="font-medium text-green-600 ml-2">Green = Access Granted</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {(['BOH', 'FOH', 'AM', 'PM', 'PREP', 'CLEAN', 'CATERING', 'SPECIAL', 'TRANSITION'] as Department[]).map(department => {
                    const hasAccess = rolePermissions[role as UserRole]?.includes(department);
                    return (
                      <Button
                        key={department}
                        variant={hasAccess ? "default" : "outline"}
                        onClick={() => toggleDepartmentPermission(role as UserRole, department)}
                        size="sm"
                        className={hasAccess ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : "border-gray-300 hover:bg-gray-50"}
                      >
                        {department.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Button>
                    );
                  })}
                </div>
                <Button 
                  onClick={() => saveDepartmentConfig(role as UserRole)} 
                  className="mt-4"
                  disabled={savingRole === role as UserRole}
                >
                  {savingRole === role as UserRole ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : savedRole === role as UserRole ? (
                    <>
                      <div className="w-4 h-4 mr-2 text-green-500">✓</div>
                      Saved!
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}