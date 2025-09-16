// Shared types for the restaurant task management system

export type UserRole = 'staff' | 'manager' | 'kitchen_manager' | 'ordering_manager' | 'lead_prep_cook' | 'assistant_foh_manager' | 'foh_team_member' | 'boh_team_member';

export type Department = 'BOH' | 'FOH' | 'AM' | 'PM' | 'PREP' | 'CLEAN' | 'CATERING' | 'SPECIAL' | 'TRANSITION';

export interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  notes?: string;
  due_date?: string;
  departments: Department[];
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department_permissions?: Department[];
}

// Role definitions with default department permissions
export const ROLE_PERMISSIONS: Record<UserRole, Department[]> = {
  staff: [], // Staff see only assigned tasks, no department filtering needed
  manager: ['BOH', 'FOH', 'AM', 'PM', 'PREP', 'CLEAN', 'CATERING', 'SPECIAL', 'TRANSITION'], // Full access
  kitchen_manager: ['BOH', 'PREP', 'AM', 'PM'], // Kitchen operations
  ordering_manager: ['CATERING', 'SPECIAL', 'PREP'], // Ordering and special events
  lead_prep_cook: ['PREP', 'BOH', 'AM'], // Prep leadership and morning prep
  assistant_foh_manager: ['FOH', 'CLEAN', 'TRANSITION'], // Front of house operations
  foh_team_member: ['FOH', 'CLEAN', 'TRANSITION'], // Front of house team member
  boh_team_member: ['BOH', 'PREP'] // Back of house team member
};

// Human-readable role labels
export const ROLE_LABELS: Record<UserRole, string> = {
  staff: 'Staff',
  manager: 'General Manager',
  kitchen_manager: 'Kitchen Manager',
  ordering_manager: 'Ordering Manager',
  lead_prep_cook: 'Lead Prep Cook',
  assistant_foh_manager: 'Assistant FOH Manager',
  foh_team_member: 'FOH Team Member',
  boh_team_member: 'BOH Team Member'
};

// Helper functions
export function isManagerRole(role: UserRole): boolean {
  return role !== 'staff';
}

export function getDepartmentPermissions(role: UserRole): Department[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function canAccessDepartment(userRole: UserRole, department: Department): boolean {
  const permissions = getDepartmentPermissions(userRole);
  return permissions.includes(department);
}

export function filterTasksByUserPermissions<T extends { departments: Department[] }>(
  tasks: T[],
  userRole: UserRole
): T[] {
  if (userRole === 'manager') {
    return tasks; // Managers can see all tasks
  }
  
  const permissions = getDepartmentPermissions(userRole);
  return tasks.filter(task => 
    task.departments.some(dept => permissions.includes(dept))
  );
}