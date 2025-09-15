import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser/public operations
export const supabase = createClient(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Admin client for server operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database types
export interface Profile {
  id: string
  email: string
  name: string
  role: 'manager' | 'employee'
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string
  requires_photo: boolean
  requires_notes: boolean
  created_by: string
  created_at: string
}

export interface Assignment {
  id: string
  task_id: string
  assigned_to: string
  assigned_by: string
  due_date: string
  recurrence: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  status: 'pending' | 'completed' | 'transferred'
  created_at: string
}

export interface Completion {
  id: string
  assignment_id: string
  completed_by: string
  notes?: string
  photo_url?: string
  completed_at: string
}