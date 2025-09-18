'use client';

import { useState, useEffect } from 'react';
import { UserRole, Department, ROLE_LABELS, ROLE_PERMISSIONS } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employee_status?: string;
  toast_employee_id?: string;
}

interface ToastEmployee {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  phoneNumber: string;
  externalId: string;
  isActive: boolean;
}

interface EnhancedUserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export default function EnhancedUserManagement({ users, setUsers }: EnhancedUserManagementProps) {
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('staff');
  const [savingUser, setSavingUser] = useState<string | null>(null);
  const [savedUser, setSavedUser] = useState<string | null>(null);
  const [customizingPermissions, setCustomizingPermissions] = useState<string | null>(null);
  const [userPermissionOverrides, setUserPermissionOverrides] = useState<Record<string, Department[]>>({});
  
  // TOAST employee matching states
  const [toastEmployees, setToastEmployees] = useState<ToastEmployee[]>([]);
  const [loadingToastEmployees, setLoadingToastEmployees] = useState(false);
  const [matchingUser, setMatchingUser] = useState<string | null>(null);
  const [selectedToastEmployee, setSelectedToastEmployee] = useState<string>('');
  const [toastMatchings, setToastMatchings] = useState<Record<string, ToastEmployee>>({});
  
  // Archive states
  const [archivingUser, setArchivingUser] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Load data when component mounts or users change
  useEffect(() => {
    loadAllUserOverrides();
    loadToastEmployees();
    loadToastMatchings();
  }, [users]);

  const loadAllUserOverrides = async () => {
    const overrides: Record<string, Department[]> = {};
    
    for (const user of users) {
      try {
        const response = await fetch(`/api/manager/user-permissions?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.overrides && data.overrides.length > 0) {
            overrides[user.id] = data.overrides;
          }
        }
      } catch (error) {
        console.error(`Error loading overrides for user ${user.id}:`, error);
      }
    }
    
    setUserPermissionOverrides(overrides);
  };

  const loadToastEmployees = async () => {
    setLoadingToastEmployees(true);
    try {
      const response = await fetch('/api/toast-employees-simple');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setToastEmployees(data.employees || []);
        }
      }
    } catch (error) {
      console.error('Error loading TOAST employees:', error);
    } finally {
      setLoadingToastEmployees(false);
    }
  };

  const loadToastMatchings = async () => {
    try {
      const response = await fetch('/api/employee-management');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const matchings: Record<string, ToastEmployee> = {};
          data.users.forEach((user: User & { toast_employee_id?: string }) => {
            if (user.toast_employee_id) {
              const toastEmployee = toastEmployees.find(emp => emp.id === user.toast_employee_id);
              if (toastEmployee) {
                matchings[user.id] = toastEmployee;
              }
            }
          });
          setToastMatchings(matchings);
        }
      }
    } catch (error) {
      console.error('Error loading TOAST matchings:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    setSavingUser(userId);
    try {
      const response = await fetch('/api/employee-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_role',
          userId,
          data: { role: newRole }
        }),
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
        setSavedUser(userId);
        setTimeout(() => setSavedUser(null), 3000);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setSavingUser(null);
      setEditingUser(null);
    }
  };

  const toggleUserPermission = (userId: string, department: Department) => {
    setUserPermissionOverrides(prev => {
      const currentOverrides = prev[userId] || getUserPermissions(users.find(u => u.id === userId)!);
      const newOverrides = currentOverrides.includes(department)
        ? currentOverrides.filter(d => d !== department)
        : [...currentOverrides, department];
      
      return {
        ...prev,
        [userId]: newOverrides
      };
    });
  };

  const saveUserPermissions = async (userId: string) => {
    const departments = userPermissionOverrides[userId];
    try {
      const response = await fetch('/api/employee-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_permissions',
          userId,
          data: { departments }
        }),
      });

      if (response.ok) {
        setCustomizingPermissions(null);
        setSavedUser(userId);
        setTimeout(() => setSavedUser(null), 3000);
      }
    } catch (error) {
      console.error('Error saving user permissions:', error);
    }
  };

  const linkToastEmployee = async (userId: string, toastEmployeeId: string) => {
    try {
      const response = await fetch('/api/employee-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'link_employee',
          userId,
          data: { toastEmployeeId }
        }),
      });

      if (response.ok) {
        const toastEmployee = toastEmployees.find(emp => emp.id === toastEmployeeId);
        if (toastEmployee) {
          setToastMatchings(prev => ({
            ...prev,
            [userId]: toastEmployee
          }));
          // Update the user in the users array to include the toast_employee_id
          setUsers(prev => prev.map(user => 
            user.id === userId ? { ...user, toast_employee_id: toastEmployeeId } : user
          ));
        }
        setMatchingUser(null);
        setSelectedToastEmployee('');
        setSavedUser(userId);
        setTimeout(() => setSavedUser(null), 3000);
      }
    } catch (error) {
      console.error('Error linking TOAST employee:', error);
    }
  };

  const archiveUser = async (userId: string) => {
    setArchivingUser(userId);
    try {
      const response = await fetch('/api/employee-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'archive_user',
          userId,
          data: {}
        }),
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, employee_status: 'archived' } : user
        ));
      }
    } catch (error) {
      console.error('Error archiving user:', error);
    } finally {
      setArchivingUser(null);
    }
  };

  const restoreUser = async (userId: string) => {
    setArchivingUser(userId);
    try {
      const response = await fetch('/api/employee-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore_user',
          userId,
          data: {}
        }),
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, employee_status: 'active' } : user
        ));
      }
    } catch (error) {
      console.error('Error restoring user:', error);
    } finally {
      setArchivingUser(null);
    }
  };

  const getUserPermissions = (user: User): Department[] => {
    // Get base permissions from role
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    // Apply user-specific overrides if any exist
    const overrides = userPermissionOverrides[user.id] || [];
    // Return overrides if they exist, otherwise return role permissions
    return overrides.length > 0 ? overrides : rolePermissions;
  };

  const filteredUsers = users.filter(user => 
    showArchived ? user.employee_status === 'archived' : user.employee_status !== 'archived'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowArchived(!showArchived)}
            variant="outline"
            className={showArchived ? "bg-orange-50 border-orange-300 text-orange-700" : ""}
          >
            {showArchived ? "Show Active Users" : "Show Archived Users"}
            <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
              {showArchived ? 
                users.filter(u => u.employee_status === 'archived').length :
                users.filter(u => u.employee_status !== 'archived').length
              }
            </span>
          </Button>
          {loadingToastEmployees && (
            <div className="flex items-center text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Loading TOAST employees...
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map(user => {
          const isArchived = user.employee_status === 'archived';
          const toastEmployee = toastMatchings[user.id];
          const hasToastMatch = !!toastEmployee;
          
          return (
            <Card key={user.id} className={`${savedUser === user.id ? "ring-2 ring-green-500 transition-all duration-500" : ""} ${isArchived ? "bg-gray-50 border-gray-300" : ""}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className={`font-semibold ${isArchived ? "text-gray-500" : ""}`}>
                          {user.name}
                          {isArchived && <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">ARCHIVED</span>}
                        </h3>
                        <p className={`text-sm ${isArchived ? "text-gray-400" : "text-gray-600"}`}>{user.email}</p>
                      </div>
                    </div>
                    
                    {/* TOAST Employee Link Status */}
                    <div className="mt-3 flex items-center gap-2">
                      {hasToastMatch ? (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <span className="font-medium">Linked to TOAST: {toastEmployee.name}</span>
                            {toastEmployee.jobTitle && <span className="text-green-600 ml-1">({toastEmployee.jobTitle})</span>}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="font-medium">⚠️ No TOAST employee linked - Required for personalized data</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Department Permissions */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium">Departments:</span>
                      {(getUserPermissions(user) || []).length > 0 ? (
                        (getUserPermissions(user) || []).map(dept => (
                          <span key={dept} className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                            {dept}
                          </span>
                        ))
                      ) : (
                        <span className="italic text-gray-400">None (tasks only)</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 min-w-0">
                    {/* TOAST Employee Matching Interface */}
                    {matchingUser === user.id ? (
                      <div className="flex items-center gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
                        <Select value={selectedToastEmployee} onValueChange={setSelectedToastEmployee}>
                          <SelectTrigger className="w-48 bg-white border-2 border-green-300 focus:border-green-500">
                            <SelectValue placeholder="Select TOAST employee">
                              {selectedToastEmployee ? 
                                toastEmployees.find(emp => emp.id === selectedToastEmployee)?.name 
                                : 'Select TOAST employee'
                              }
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {toastEmployees.map(employee => (
                              <SelectItem key={employee.id} value={employee.id}>
                                <div className="flex flex-col text-left">
                                  <span className="font-medium">{employee.name}</span>
                                  {employee.jobTitle && <span className="text-xs text-gray-500">{employee.jobTitle}</span>}
                                  {employee.email && <span className="text-xs text-gray-400">{employee.email}</span>}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={() => linkToastEmployee(user.id, selectedToastEmployee)} 
                          size="sm"
                          disabled={!selectedToastEmployee}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Link
                        </Button>
                        <Button 
                          onClick={() => {
                            setMatchingUser(null);
                            setSelectedToastEmployee('');
                          }} 
                          variant="outline" 
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : editingUser === user.id ? (
                      /* Role Editing Interface */
                      <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <Select value={selectedRole} onValueChange={(value: string) => setSelectedRole(value as UserRole)}>
                          <SelectTrigger className="w-40 bg-white border-2 border-blue-200 focus:border-blue-500">
                            <SelectValue placeholder="Select role">
                              {ROLE_LABELS[selectedRole] || 'Select role'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="foh_team_member">FOH Team Member</SelectItem>
                            <SelectItem value="boh_team_member">BOH Team Member</SelectItem>
                            <SelectItem value="lead_prep_cook">Lead Prep Cook</SelectItem>
                            <SelectItem value="assistant_foh_manager">Assistant FOH Manager</SelectItem>
                            <SelectItem value="kitchen_manager">Kitchen Manager</SelectItem>
                            <SelectItem value="ordering_manager">Ordering Manager</SelectItem>
                            <SelectItem value="manager">General Manager</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={() => updateUserRole(user.id, selectedRole)} 
                          size="sm"
                          disabled={savingUser === user.id}
                          className="min-w-[70px]"
                        >
                          {savingUser === user.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Saving
                            </>
                          ) : (
                            'Save'
                          )}
                        </Button>
                        <Button 
                          onClick={() => {
                            setEditingUser(null);
                            setSelectedRole('staff');
                          }} 
                          variant="outline" 
                          size="sm"
                          disabled={savingUser === user.id}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : customizingPermissions === user.id ? (
                      /* Permission Customization Interface */
                      <div className="space-y-3 bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-gray-700">Customize Departments for {user.name}:</p>
                        <div className="flex flex-wrap gap-2">
                          {(['BOH', 'FOH', 'AM', 'PM', 'PREP', 'CLEAN', 'CATERING', 'SPECIAL', 'TRANSITION'] as Department[]).map(department => {
                            const hasAccess = (userPermissionOverrides[user.id] || getUserPermissions(user)).includes(department);
                            return (
                              <Button
                                key={department}
                                variant={hasAccess ? "default" : "outline"}
                                onClick={() => toggleUserPermission(user.id, department)}
                                size="sm"
                                className={hasAccess ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : "border-gray-300 hover:bg-gray-50"}
                              >
                                {department.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Button>
                            );
                          })}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => saveUserPermissions(user.id)} 
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Save Custom Permissions
                          </Button>
                          <Button 
                            onClick={() => {
                              setCustomizingPermissions(null);
                              setUserPermissionOverrides(prev => {
                                const { [user.id]: _, ...rest } = prev;
                                return rest;
                              });
                            }} 
                            variant="outline" 
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Action Buttons */
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          variant="outline" 
                          className={`${savedUser === user.id ? 'bg-green-100 border-green-500 text-green-700' : ''} transition-colors duration-500`}
                        >
                          {ROLE_LABELS[user.role]}
                          {savedUser === user.id && (
                            <span className="ml-1 text-green-600">✓</span>
                          )}
                        </Badge>
                        
                        {!isArchived && (
                          <>
                            <Button 
                              onClick={() => {
                                setMatchingUser(user.id);
                                setSelectedToastEmployee(user.toast_employee_id || '');
                              }} 
                              size="sm"
                              variant="outline"
                              className="hover:bg-green-50 hover:border-green-300 text-green-700"
                            >
                              {hasToastMatch ? 'Change TOAST Link' : 'Link TOAST Employee'}
                            </Button>
                            
                            <Button 
                              onClick={() => {
                                setEditingUser(user.id);
                                setSelectedRole(user.role);
                              }} 
                              size="sm"
                              variant="outline"
                              className="hover:bg-blue-50 hover:border-blue-300"
                            >
                              Edit Role
                            </Button>
                            
                            <Button 
                              onClick={() => {
                                setCustomizingPermissions(user.id);
                                if (!userPermissionOverrides[user.id]) {
                                  setUserPermissionOverrides(prev => ({
                                    ...prev,
                                    [user.id]: getUserPermissions(user)
                                  }));
                                }
                              }} 
                              size="sm"
                              variant="outline"
                              className="hover:bg-purple-50 hover:border-purple-300 text-purple-700"
                            >
                              Custom Permissions
                            </Button>
                            
                            <Button 
                              onClick={() => archiveUser(user.id)} 
                              size="sm"
                              variant="outline"
                              disabled={archivingUser === user.id}
                              className="hover:bg-red-50 hover:border-red-300 text-red-700"
                            >
                              {archivingUser === user.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                                  Archiving...
                                </>
                              ) : (
                                'Archive'
                              )}
                            </Button>
                          </>
                        )}
                        
                        {isArchived && (
                          <Button 
                            onClick={() => restoreUser(user.id)} 
                            size="sm"
                            disabled={archivingUser === user.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {archivingUser === user.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Restoring...
                              </>
                            ) : (
                              'Restore User'
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Warning for unlinked users */}
                {!hasToastMatch && !isArchived && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
                      <div className="text-sm text-yellow-800">
                        <strong>Action Required:</strong> This user must be linked to a TOAST employee before they can access personalized data, schedules, or advanced features. 
                        <Button 
                          onClick={() => {
                            setMatchingUser(user.id);
                            setSelectedToastEmployee('');
                          }}
                          size="sm"
                          className="ml-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          Link Now
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg font-medium">
            {showArchived ? 'No archived users found' : 'No active users found'}
          </p>
          <p className="text-sm mt-2">
            {showArchived ? 'All users are currently active.' : 'Users will appear here once they sign in.'}
          </p>
        </div>
      )}
    </div>
  );
}