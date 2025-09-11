// Core Types from existing schema
export interface Employee {
  id: string
  name: string
  email?: string
  department: 'FOH' | 'BOH' | 'BOTH'
  role: string
  avatar_url?: string
  language: 'en' | 'es' | 'tr'
  is_active?: boolean
  last_seen?: string
  status?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Worksheet {
  id: string
  employee_id: string  // UUID foreign key to employees
  department: 'FOH' | 'BOH'
  shift_type: string
  date?: string
  started_at?: string
  completed_at?: string | null
  checklist_data: any[] // JSONB array (not object!)
  photo_urls?: string[] | null
  notes?: string | null
  status: 'in_progress' | 'completed' | 'abandoned'
  message_id?: string | null
  channel_id?: string | null
  completion_percentage?: number
  assigned_to?: string | null
  priority?: 'low' | 'medium' | 'high'
  estimated_duration?: number | null
  actual_duration?: number | null
  created_at: string
  updated_at: string
}

export interface ChecklistItem {
  id: number
  name: string
  task_description: string
  required: boolean
  photo_urls?: string[]
  critical: boolean
  min_rating?: number
  completed?: boolean
  rating?: number
  notes?: string
}

export interface CloseReview {
  id: string
  employee_id: string
  department: 'FOH' | 'BOH'
  shift_type: string
  overall_rating: number
  cleanliness_rating: number
  equipment_rating: number
  inventory_rating: number
  comments?: string
  photos?: string[]
  issues?: string[]
  improvements?: string[]
  created_at: string
  updated_at: string
}

// Enhanced Types for The Pass
export interface Channel {
  id: string
  name: string
  display_name?: string
  description?: string
  type: 'workflow' | 'management' | 'utility'
  department: 'FOH' | 'BOH' | 'BOTH'
  is_active?: boolean
  last_message_at?: string
  message_count?: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  channel_id: string
  user_id?: string
  content?: string
  message_type: 'text' | 'workflow' | 'photo' | 'review' | 'system' | 'alert'
  metadata?: any // JSONB field from database
  thread_id?: string
  worksheet_id?: string
  review_id?: string
  edited_at?: string
  is_deleted?: boolean
  reaction_data?: any
  reactions?: any[]
  reply_count?: number
  created_at: string
  updated_at: string
}

export interface MessageMetadata {
  // Workflow specific
  worksheet_id?: string
  checklist_item_id?: string
  completion_percentage?: number
  workflow_status?: 'started' | 'in_progress' | 'completed' | 'paused'
  
  // Photo specific
  photo_url?: string
  photo_caption?: string
  
  // Review specific
  review_id?: string
  rating?: number
  
  // System/Analytics specific
  stats?: {
    completed_workflows?: number
    active_employees?: number
    pending_issues?: number
    completion_rate?: number
  }
  
  // General
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  tags?: string[]
  mentions?: string[]
}

export interface MessageReaction {
  emoji: string
  user_id: string
  created_at: string
}

export interface WorkflowTemplate {
  id: string
  name: string
  department: 'FOH' | 'BOH'
  shift_type: string
  description?: string
  items: WorkflowTemplateItem[]
  estimated_duration: number
  language: Language
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WorkflowTemplateItem {
  id: string
  template_id: string
  description: string
  category: string
  required: boolean
  photo_required: boolean
  order_index: number
  estimated_minutes: number
}

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  department?: 'FOH' | 'BOH' | 'MANAGER'
  position?: string
  language_preference: Language
  notification_settings: NotificationSettings
  status: 'online' | 'away' | 'busy' | 'offline'
  last_seen: string
  created_at: string
}

export interface NotificationSettings {
  workflow_updates: boolean
  mentions: boolean
  reviews: boolean
  system_alerts: boolean
  email_notifications: boolean
  push_notifications: boolean
}

// Language Support
export type Language = 'en' | 'es' | 'tr'

export interface TranslationKey {
  en: string
  es: string
  tr: string
}

// Real-time Events
export interface RealtimeEvent {
  type: 'workflow_start' | 'workflow_complete' | 'message_sent' | 'photo_uploaded' | 'review_submitted'
  channel_id: string
  user_id: string
  data: any
  timestamp: string
}

// Supabase Database Type Definition
export interface Database {
  public: {
    Tables: {
      employees: {
        Row: Employee
        Insert: Omit<Employee, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at'>>
      }
      worksheets: {
        Row: Worksheet
        Insert: Omit<Worksheet, 'id' | 'created_at' | 'updated_at' | 'date' | 'started_at' | 'completed_at'>
        Update: Partial<Omit<Worksheet, 'id' | 'created_at'>>
      }
      channels: {
        Row: Channel
        Insert: Omit<Channel, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Channel, 'id' | 'created_at' | 'updated_at'>>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Message, 'id' | 'created_at' | 'updated_at'>>
      }
      close_reviews: {
        Row: CloseReview
        Insert: Omit<CloseReview, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CloseReview, 'id' | 'created_at' | 'updated_at'>>
      }
      inventory_items: {
        Row: {
          id: string
          name: string
          category: string
          current_stock: number
          minimum_stock: number
          unit: string
          supplier?: string
          cost_per_unit?: number
          last_ordered?: string
          notes?: string
          is_active?: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          category: string
          current_stock?: number
          minimum_stock?: number
          unit?: string
          supplier?: string
          cost_per_unit?: number
          last_ordered?: string
          notes?: string
          is_active?: boolean
        }
        Update: Partial<{
          name: string
          category: string
          current_stock: number
          minimum_stock: number
          unit: string
          supplier?: string
          cost_per_unit?: number
          last_ordered?: string
          notes?: string
          is_active?: boolean
        }>
      }
      recipes: {
        Row: {
          id: string
          name: string
          description?: string
          ingredients: any
          instructions?: string
          prep_time?: number
          serving_size?: number
          category?: string
          photo_urls?: string[]
          is_active?: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string
          ingredients?: any
          instructions?: string
          prep_time?: number
          serving_size?: number
          category?: string
          photo_urls?: string[]
          is_active?: boolean
        }
        Update: Partial<{
          name: string
          description?: string
          ingredients: any
          instructions?: string
          prep_time?: number
          serving_size?: number
          category?: string
          photo_urls?: string[]
          is_active?: boolean
        }>
      }
      orders: {
        Row: {
          id: string
          supplier: string
          items: any
          total_amount?: number
          status: 'pending' | 'ordered' | 'received' | 'cancelled'
          ordered_by?: string
          ordered_date?: string
          expected_delivery?: string
          received_date?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          supplier: string
          items?: any
          total_amount?: number
          status?: 'pending' | 'ordered' | 'received' | 'cancelled'
          ordered_by?: string
          ordered_date?: string
          expected_delivery?: string
          received_date?: string
          notes?: string
        }
        Update: Partial<{
          supplier: string
          items: any
          total_amount?: number
          status: 'pending' | 'ordered' | 'received' | 'cancelled'
          ordered_by?: string
          ordered_date?: string
          expected_delivery?: string
          received_date?: string
          notes?: string
        }>
      }
      missing_item_reports: {
        Row: {
          id: string
          item_name: string
          reported_by: string
          department: 'FOH' | 'BOH'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          description?: string
          photo_url?: string
          status: 'reported' | 'ordered' | 'resolved'
          created_at: string
          updated_at: string
        }
        Insert: {
          item_name: string
          reported_by: string
          department: 'FOH' | 'BOH'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          description?: string
          photo_url?: string
          status?: 'reported' | 'ordered' | 'resolved'
        }
        Update: Partial<{
          item_name: string
          reported_by: string
          department: 'FOH' | 'BOH'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          description?: string
          photo_url?: string
          status: 'reported' | 'ordered' | 'resolved'
        }>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Component Props Types
export interface MessageCardProps {
  message: Message
  user?: User
  isThreaded?: boolean
  showReactions?: boolean
  onReply?: (messageId: string) => void
  onReact?: (messageId: string, emoji: string) => void
}

export interface WorkflowCardProps {
  message: Message
  workflow?: Worksheet
  template?: WorkflowTemplate
  onUpdateWorkflow?: (workflowId: string, updates: Partial<Worksheet>) => void
  onCompleteItem?: (itemId: string) => void
}

export interface ChannelListProps {
  channels: Channel[]
  activeChannel?: string
  onChannelSelect: (channelId: string) => void
  onCreateChannel?: () => void
}

// API Response Types
export interface APIResponse<T> {
  data?: T
  error?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}
