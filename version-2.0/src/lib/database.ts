import { createClient } from '@supabase/supabase-js'

// Database configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create service client with admin privileges
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Create public client for client-side operations
export const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// =====================================
// TYPES AND INTERFACES
// =====================================

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: 'employee' | 'shift_lead' | 'manager' | 'admin'
  employee_id?: string
  hire_date?: string
  preferred_language: string
  avatar_url?: string
  is_active: boolean
  last_sign_in_at?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'task' | 'review' | 'shift' | 'system' | 'urgent'
  priority: 'low' | 'medium' | 'high' | 'critical'
  data: Record<string, any>
  created_by?: string
  created_at: string
  expires_at?: string
  is_system_wide: boolean
}

export interface UserNotification {
  id: string
  notification_id: string
  user_id: string
  is_read: boolean
  is_acknowledged: boolean
  read_at?: string
  acknowledged_at?: string
  created_at: string
  notification?: Notification
}

export interface WorkflowTemplate {
  id: string
  name: string
  category: 'boh_opening' | 'boh_closing' | 'foh_opening' | 'foh_closing' | 'daily_prep' | 'cleaning' | 'inventory'
  description?: string
  estimated_duration_minutes?: number
  required_role: 'employee' | 'shift_lead' | 'manager' | 'admin'
  is_active: boolean
  version: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface WorkflowInstance {
  id: string
  template_id: string
  assigned_to?: string
  started_by?: string
  shift_date: string
  shift_type: 'morning' | 'afternoon' | 'evening' | 'overnight'
  status: string
  started_at?: string
  completed_at?: string
  total_duration_minutes?: number
  notes?: string
  created_at: string
}

// =====================================
// DATABASE SERVICES
// =====================================

export const DatabaseService = {
  // User Management
  users: {
    async create(userData: Partial<User>) {
      try {
        const { data, error } = await supabaseAdmin
          .from('users')
          .insert([userData])
          .select()
          .single()
        
        return { data, error }
      } catch (error) {
        return { data: null, error }
      }
    },

    async getById(id: string) {
      try {
        const { data, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', id)
          .single()
        
        return { data, error }
      } catch (error) {
        return { data: null, error }
      }
    },

    async getByEmail(email: string) {
      try {
        const { data, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email)
          .single()
        
        return { data, error }
      } catch (error) {
        return { data: null, error }
      }
    },

    async update(id: string, updates: Partial<User>) {
      try {
        const { data, error } = await supabaseAdmin
          .from('users')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        
        return { data, error }
      } catch (error) {
        return { data: null, error }
      }
    },

    async getAll() {
      try {
        const { data, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
        
        return { data, error }
      } catch (error) {
        return { data: null, error }
      }
    },

    async getByRole(role: User['role']) {
      try {
        const { data, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('role', role)
          .eq('is_active', true)
          .order('first_name')
        
        return { data, error }
      } catch (error) {
        return { data: null, error }
      }
    }
  },

  // Notification Management
  notifications: {
    async create(notificationData: Partial<Notification>) {
      try {
        const { data, error } = await supabaseAdmin
          .from('notifications')
          .insert([notificationData])
          .select()
          .single()
        
        return { data, error }
      } catch (error) {
        return { data: null, error }
      }
    },

    async sendToUsers(notificationData: Partial<Notification>, userIds: string[]) {
      try {
        // Create the notification
        const { data: notification, error: notificationError } = await this.create(notificationData)
        
        if (notificationError || !notification) {
          return { success: false, error: notificationError }
        }

        // Create user notification records
        const userNotifications = userIds.map(userId => ({
          user_id: userId,
          notification_id: notification.id
        }))

        const { error: userNotificationError } = await supabaseAdmin
          .from('user_notifications')
          .insert(userNotifications)

        if (userNotificationError) {
          return { success: false, error: userNotificationError }
        }

        return { success: true, notification }
      } catch (error) {
        return { success: false, error }
      }
    },

    async getUserNotifications(userId: string, limit = 50) {
      try {
        const { data, error } = await supabaseAdmin
          .from('user_notifications')
          .select(`
            *,
            notification:notifications(*)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)
        
        return { data, error }
      } catch (error) {
        return { data: null, error }
      }
    },

    async markAsRead(userId: string, notificationId: string) {
      try {
        const { error } = await supabaseAdmin
          .from('user_notifications')
          .update({ 
            is_read: true, 
            read_at: new Date().toISOString() 
          })
          .eq('user_id', userId)
          .eq('notification_id', notificationId)

        return { success: !error, error }
      } catch (error) {
        return { success: false, error }
      }
    },

    async getUnreadCount(userId: string) {
      try {
        const { count, error } = await supabaseAdmin
          .from('user_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false)
        
        return { count: count || 0, error }
      } catch (error) {
        return { count: 0, error }
      }
    }
  },

  // Workflow Management
  workflows: {
    async getTemplates() {
      try {
        const { data, error } = await supabaseAdmin
          .from('workflow_templates')
          .select('*')
          .eq('is_active', true)
          .order('name')
        
        return { data, error }
      } catch (error) {
        return { data: null, error }
      }
    },

    async getTasks(templateId: string) {
      try {
        const { data, error } = await supabaseAdmin
          .from('workflow_tasks')
          .select('*')
          .eq('template_id', templateId)
          .order('order_index')
        
        return { data, error }
      } catch (error) {
        return { data: null, error }
      }
    },

    async createInstance(instanceData: Partial<WorkflowInstance>) {
      try {
        const { data, error } = await supabaseAdmin
          .from('workflow_instances')
          .insert([instanceData])
          .select()
          .single()
        
        return { data, error }
      } catch (error) {
        return { data: null, error }
      }
    },

    async getInstance(id: string) {
      try {
        const { data, error } = await supabaseAdmin
          .from('workflow_instances')
          .select('*')
          .eq('id', id)
          .single()
        
        return { data, error }
      } catch (error) {
        return { data: null, error }
      }
    },

    async updateInstance(id: string, updates: Partial<WorkflowInstance>) {
      try {
        const { data, error } = await supabaseAdmin
          .from('workflow_instances')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        
        return { data, error }
      } catch (error) {
        return { data: null, error }
      }
    }
  },

  // Analytics and Reporting
  analytics: {
    async recordShiftMetrics(metricsData: {
      shift_date: string
      shift_type: string
      total_employees: number
      workflows_completed: number
      workflows_on_time: number
      average_completion_time: number
      total_reviews: number
      average_rating: number
    }) {
      try {
        const { error } = await supabaseAdmin
          .from('shift_metrics')
          .insert([metricsData])

        return { success: !error, error }
      } catch (error) {
        return { success: false, error }
      }
    },

    async getShiftMetrics(startDate: string, endDate: string) {
      try {
        const { data, error } = await supabaseAdmin
          .from('shift_metrics')
          .select('*')
          .gte('shift_date', startDate)
          .lte('shift_date', endDate)
          .order('shift_date', { ascending: false })
        
        return { data, error }
      } catch (error) {
        return { data: null, error }
      }
    },

    async createEvents(events: any[]): Promise<{ success: boolean; error?: any }> {
      try {
        const { error } = await supabaseAdmin
          .from('analytics_events')
          .insert(events)

        return { success: !error, error }
      } catch (error) {
        return { success: false, error }
      }
    },

    async createPerformanceMetric(metric: any): Promise<{ success: boolean; error?: any }> {
      try {
        const { error } = await supabaseAdmin
          .from('performance_metrics')
          .insert([metric])

        return { success: !error, error }
      } catch (error) {
        return { success: false, error }
      }
    },

    async getEvents(userId?: string, startDate?: Date, endDate?: Date): Promise<{ data: any[] | null; error?: any }> {
      try {
        let query = supabaseAdmin
          .from('analytics_events')
          .select('*')
          .order('timestamp', { ascending: false })

        if (userId) {
          query = query.eq('user_id', userId)
        }

        if (startDate && endDate) {
          query = query
            .gte('timestamp', startDate.toISOString())
            .lte('timestamp', endDate.toISOString())
        }

        const { data, error } = await query
        return { data, error }
      } catch (error) {
        return { data: null, error }
      }
    },

    async getPerformanceMetrics(userId?: string, startDate?: Date, endDate?: Date): Promise<{ data: any[] | null; error?: any }> {
      try {
        let query = supabaseAdmin
          .from('performance_metrics')
          .select('*')
          .order('timestamp', { ascending: false })

        if (userId) {
          query = query.eq('user_id', userId)
        }

        if (startDate && endDate) {
          query = query
            .gte('timestamp', startDate.toISOString())
            .lte('timestamp', endDate.toISOString())
        }

        const { data, error } = await query
        return { data, error }
      } catch (error) {
        return { data: null, error }
      }
    }
  },

  // Audit Logging
  audit: {
    async log(actionData: {
      user_id?: string
      action: string
      table_name?: string
      record_id?: string
      old_values?: Record<string, any>
      new_values?: Record<string, any>
      ip_address?: string
      user_agent?: string
    }) {
      try {
        const { error } = await supabaseAdmin
          .from('audit_logs')
          .insert([actionData])

        return { success: !error, error }
      } catch (error) {
        return { success: false, error }
      }
    },

    async getLogs(filters: {
      user_id?: string
      action?: string
      table_name?: string
      start_date?: string
      end_date?: string
      limit?: number
    }) {
      try {
        let query = supabaseAdmin
          .from('audit_logs')
          .select('*')

        if (filters.user_id) query = query.eq('user_id', filters.user_id)
        if (filters.action) query = query.eq('action', filters.action)
        if (filters.table_name) query = query.eq('table_name', filters.table_name)
        if (filters.start_date) query = query.gte('created_at', filters.start_date)
        if (filters.end_date) query = query.lte('created_at', filters.end_date)

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(filters.limit || 100)
        
        return { data, error }
      } catch (error) {
        return { data: null, error }
      }
    }
  }
}