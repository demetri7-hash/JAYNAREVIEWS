// Workflow System Types
// This file contains all TypeScript interfaces for the new workflow system

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
  is_repeatable: boolean;
  recurrence_type?: 'once' | 'daily' | 'weekly' | 'monthly';
  due_date?: string;
  due_time?: string;
  departments: string[];
  roles: string[];
  assigned_users: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Task count for display purposes
  task_count?: number;
  
  // Populated through joins
  tasks?: WorkflowTask[];
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface WorkflowTask {
  id: string;
  workflow_id: string;
  task_id: string;
  order_index: number;
  is_required: boolean;
  created_at: string;
  
  // Populated through joins
  task?: EnhancedTask;
}

export interface EnhancedTask {
  id: string;
  title: string;
  description?: string;
  requires_notes: boolean;
  requires_photo: boolean;
  tags: string[];
  is_photo_mandatory: boolean;
  is_notes_mandatory: boolean;
  created_at: string;
  
  // Legacy fields (to be deprecated)
  recurrence?: string;
  due_date?: string;
}

export interface WorkflowAssignment {
  id: string;
  workflow_id: string;
  assigned_to: string;
  assigned_by?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  started_at?: string;
  completed_at?: string;
  created_at: string;
  
  // Populated through joins
  workflow?: Workflow;
  assignee?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  assigner?: {
    id: string;
    name: string;
    email: string;
  };
  completions?: WorkflowTaskCompletion[];
}

export interface WorkflowTaskCompletion {
  id: string;
  workflow_assignment_id: string;
  task_id: string;
  completed_by?: string;
  notes?: string;
  photo_url?: string;
  completed_at: string;
  
  // Populated through joins
  task?: EnhancedTask;
  completed_by_user?: {
    id: string;
    name: string;
    email: string;
  };
}

// API Request/Response Types

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  is_repeatable: boolean;
  recurrence_type?: 'once' | 'daily' | 'weekly' | 'monthly';
  due_date?: string;
  due_time?: string;
  departments: string[];
  roles: string[];
  assigned_users: string[];
  tasks?: {
    task_id: string;
    order_index: number;
    is_required: boolean;
  }[];
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  is_repeatable?: boolean;
  recurrence_type?: 'once' | 'daily' | 'weekly' | 'monthly';
  due_date?: string;
  due_time?: string;
  departments?: string[];
  roles?: string[];
  assigned_users?: string[];
  is_active?: boolean;
  tasks?: {
    task_id: string;
    order_index: number;
    is_required: boolean;
  }[];
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  requires_notes?: boolean;
  requires_photo?: boolean;
  tags?: string[];
  is_photo_mandatory?: boolean;
  is_notes_mandatory?: boolean;
}

export interface AssignWorkflowRequest {
  workflow_id: string;
  assigned_to: string;
  due_date?: string;
}

export interface CompleteWorkflowTaskRequest {
  workflow_assignment_id: string;
  task_id: string;
  notes?: string;
  photo_url?: string;
}

export interface TaskSearchResult {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  is_photo_mandatory: boolean;
  is_notes_mandatory: boolean;
}

// Component Props Types

export interface WorkflowCardProps {
  assignment: WorkflowAssignment;
  onStart?: (assignmentId: string) => void;
  onComplete?: (assignmentId: string) => void;
  onViewDetails?: (assignmentId: string) => void;
}

export interface WorkflowCreatorProps {
  onSave?: (workflow: CreateWorkflowRequest) => void;
  onCancel?: () => void;
  existingWorkflow?: Workflow;
}

export interface TaskSelectorProps {
  selectedTasks: WorkflowTask[];
  onTasksChange: (tasks: WorkflowTask[]) => void;
  onCreateNewTask?: (task: CreateTaskRequest) => void;
}

export interface MyWorkflowsProps {
  userId: string;
  userRole: string;
}

// Utility Types

export type WorkflowStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type RecurrenceType = 'once' | 'daily' | 'weekly' | 'monthly';
export type UserRole = 'staff' | 'foh_team_member' | 'boh_team_member' | 'kitchen_manager' | 'ordering_manager' | 'lead_prep_cook' | 'assistant_foh_manager' | 'manager';
export type Department = 'BOH' | 'FOH' | 'AM' | 'PM' | 'PREP' | 'CLEAN' | 'CATERING' | 'SPECIAL' | 'TRANSITION';

// Filter and Search Types

export interface WorkflowFilters {
  status?: WorkflowStatus[];
  departments?: Department[];
  roles?: UserRole[];
  tags?: string[];
  search?: string;
  created_by?: string;
  is_repeatable?: boolean;
}

export interface TaskFilters {
  tags?: string[];
  search?: string;
  requires_photo?: boolean;
  requires_notes?: boolean;
  is_photo_mandatory?: boolean;
  is_notes_mandatory?: boolean;
}

// API Response Types

export interface WorkflowsResponse {
  workflows: Workflow[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface MyWorkflowsResponse {
  assignments: WorkflowAssignment[];
  total: number;
  pending: number;
  in_progress: number;
  completed_today: number;
}

export interface TaskSearchResponse {
  tasks: TaskSearchResult[];
  total: number;
  suggestions: string[];
}

// Error Types

export interface WorkflowError {
  code: string;
  message: string;
  field?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: WorkflowError;
  message?: string;
}