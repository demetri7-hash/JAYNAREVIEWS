// Shared type definitions for the task management system

export type UserRole = 
  | 'staff' 
  | 'manager' 
  | 'kitchen_manager' 
  | 'ordering_manager' 
  | 'lead_prep_cook' 
  | 'assistant_foh_manager'

export type Department = 
  | 'BOH' 
  | 'FOH' 
  | 'AM' 
  | 'PM' 
  | 'PREP' 
  | 'CLEAN' 
  | 'CATERING' 
  | 'SPECIAL' 
  | 'TRANSITION'

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
  ordering_manager: ['CATERING', 'SPECIAL', 'PREP'], // Ordering and catering
  lead_prep_cook: ['PREP', 'BOH', 'AM'], // Prep and morning operations
  assistant_foh_manager: ['FOH', 'CLEAN', 'TRANSITION'], // Front of house operations
}

// Role display names
export const ROLE_LABELS: Record<UserRole, string> = {
  staff: 'Staff',
  manager: 'General Manager',
  kitchen_manager: 'Kitchen Manager',
  ordering_manager: 'Ordering Manager', 
  lead_prep_cook: 'Lead Prep Cook',
  assistant_foh_manager: 'Assistant FOH Manager',
}

// Helper function to check if a role has manager privileges
export function isManagerRole(role: UserRole): boolean {
  return role !== 'staff'
}

// Helper function to get department permissions for a role
export function getDepartmentPermissions(role: UserRole): Department[] {
  return ROLE_PERMISSIONS[role] || []
}