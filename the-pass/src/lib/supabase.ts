import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Channel, Message, Worksheet, Employee, CloseReview, User, RealtimeEvent } from '@/types'

// Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Create clients with explicit typing
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Enhanced Database Service Class
export class DatabaseService {
  private client: SupabaseClient
  
  constructor(client: SupabaseClient) {
    this.client = client
  }

  // Test database connection
  async testConnection(): Promise<any> {
    try {
      // Simple test to check if we can connect
      const { data, error } = await this.client.auth.getSession()
      
      return {
        status: 'connected',
        timestamp: new Date().toISOString(),
        auth_working: !error,
        client_initialized: !!this.client
      }
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Channel Management
  async getChannels(): Promise<Channel[]> {
    const { data, error } = await this.client
      .from('channels')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  async createChannel(channelData: Partial<Channel>): Promise<Channel> {
    const { data, error } = await this.client
      .from('channels')
      .insert(channelData as any)
      .select()
      .single()
    
    if (error) throw error
    return data as Channel
  }

  async getOrCreateWorkflowChannel(department: 'FOH' | 'BOH', shiftType: string): Promise<Channel> {
    const today = new Date().toISOString().split('T')[0]
    const channelName = `${department.toLowerCase()}-${shiftType.toLowerCase()}-${today}`
    
    // Try to find existing channel
    const { data: existing } = await this.client
      .from('channels')
      .select('*')
      .eq('name', channelName)
      .eq('is_active', true)
      .single()
    
    if (existing) return existing
    
    // Create new channel
    return this.createChannel({
      name: channelName,
      display_name: `${department} ${shiftType} - ${today}`,
      description: `Daily ${department} ${shiftType} workflow`,
      type: 'workflow',
      department: department,
      is_active: true,
      created_by: 'system'
    })
  }

  // Message Management
  async getMessages(channelId: string, limit = 50): Promise<Message[]> {
    const { data, error } = await this.client
      .from('messages')
      .select(`
        *,
        employee:user_id!inner(name, avatar_url)
      `)
      .eq('channel_id', channelId)
      .is('thread_id', null) // Only get root messages, not replies
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error loading messages:', error)
      return []
    }
    return (data || []).reverse() // Reverse to show oldest first
  }

  async getMessageThread(threadId: string): Promise<Message[]> {
    const { data, error } = await this.client
      .from('messages')
      .select(`
        *,
        user:user_id(name, avatar_url)
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  async createMessage(messageData: Omit<Message, 'id' | 'created_at' | 'updated_at'>): Promise<Message | null> {
    try {
      // First, ensure the user exists in the database
      if (messageData.user_id) {
        const { data: existingUser } = await this.client
          .from('employees')
          .select('id')
          .eq('id', messageData.user_id)
          .single()
        
        // If user doesn't exist, we can't create the message with that user_id
        if (!existingUser) {
          console.error('User not found in employees table:', messageData.user_id)
          return null
        }
      }

      // Create the message
      const { data, error } = await this.client
        .from('messages')
        .insert({
          channel_id: messageData.channel_id,
          user_id: messageData.user_id || null,
          content: messageData.content || '',
          message_type: messageData.message_type,
          metadata: messageData.metadata || null,
          thread_id: messageData.thread_id || null,
          worksheet_id: messageData.worksheet_id || null,
          review_id: messageData.review_id || null
        })
        .select(`
          *,
          employee:user_id(name, avatar_url)
        `)
        .single()

      if (error) {
        console.error('Error creating message:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Exception creating message:', error)
      return null
    }
  }
  
  // Workflow Integration
  async createWorkflowMessage(worksheet: Worksheet): Promise<Message | null> {
    if (!worksheet.channel_id) return null;
    
    const message = await this.createMessage({
      channel_id: worksheet.channel_id,
      user_id: worksheet.employee_id,
      content: `Started ${worksheet.shift_type} checklist`,
      message_type: 'workflow',
      metadata: {
        worksheet_id: worksheet.id,
        workflow_status: 'started',
        department: worksheet.department
      }
    });
    
    return message;
  }

  async createChecklistItemMessage(
    channelId: string,
    userId: string,
    threadId: string,
    item: any,
    completed: boolean
  ): Promise<Message | null> {
    const content = completed 
      ? `✅ Completed: ${item.description}`
      : `📋 ${item.description}`
    
    return this.createMessage({
      channel_id: channelId,
      user_id: userId,
      thread_id: threadId,
      content,
      message_type: 'workflow',
      metadata: {
        checklist_item_id: item.id,
        workflow_status: completed ? 'completed' : 'in_progress'
      }
    })
  }

  async createPhotoMessage(
    channelId: string,
    userId: string,
    threadId: string,
    photoUrl: string,
    caption?: string
  ): Promise<Message | null> {
    return this.createMessage({
      channel_id: channelId,
      user_id: userId,
      thread_id: threadId,
      content: caption || '📸 Photo uploaded',
      message_type: 'photo',
      metadata: {
        photo_url: photoUrl,
        photo_caption: caption
      }
    })
  }

  async createReviewMessage(
    channelId: string,
    userId: string,
    threadId: string,
    review: any
  ): Promise<Message | null> {
    const stars = '⭐'.repeat(review.overall_rating)
    const content = `${stars} Review submitted (${review.overall_rating}/5)`
    
    return this.createMessage({
      channel_id: channelId,
      user_id: userId,
      thread_id: threadId,
      content,
      message_type: 'review',
      metadata: {
        review_id: review.id,
        rating: review.overall_rating
      }
    })
  }

  // Real-time Subscriptions
  subscribeToChannel(channelId: string, callback: (message: Message) => void) {
    return this.client
      .channel(`messages-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          callback(payload.new as Message)
        }
      )
      .subscribe()
  }

  subscribeToWorkflows(callback: (worksheet: Worksheet) => void) {
    return this.client
      .channel('worksheet-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'worksheets'
        },
        (payload) => {
          callback(payload.new as Worksheet)
        }
      )
      .subscribe()
  }

  // Migration Helpers
  async migrateWorksheetToMessages(worksheet: Worksheet): Promise<void> {
    // Get or create channel for this workflow
    const channel = await this.getOrCreateWorkflowChannel(worksheet.department, worksheet.shift_type)
    
    // Create main workflow thread
    const threadMessage = await this.createWorkflowMessage(worksheet)
    
        
    // Create messages for each checklist item
    if (threadMessage) {
      for (const item of worksheet.checklist_items || []) {
        await this.createChecklistItemMessage(
          channel.id,
          worksheet.employee_id,
          threadMessage.id,
          item,
          item.completed
        )
        
        // Add photo message if exists
        if (item.photo_url) {
          await this.createPhotoMessage(
            channel.id,
            worksheet.employee_id,
            threadMessage.id,
            item.photo_url,
            item.description
          )
        }
      }
    }
  }

  // Helper Methods
  private generateWorkflowContent(worksheet: Worksheet, status: string): string {
    const employee = worksheet.employee_id // You'd need to fetch employee name
    const time = new Date().toLocaleTimeString()
    
    switch (status) {
      case 'started':
        return `🚀 Started ${worksheet.department} ${worksheet.shift_type} checklist - ${time}`
      case 'completed':
        return `✅ Completed ${worksheet.department} ${worksheet.shift_type} checklist - ${time}`
      case 'paused':
        return `⏸️ Paused ${worksheet.department} ${worksheet.shift_type} checklist - ${time}`
      default:
        return `📋 ${worksheet.department} ${worksheet.shift_type} checklist update - ${time}`
    }
  }

  private calculateCompletionPercentage(worksheet: Worksheet): number {
    if (!worksheet.checklist_items || worksheet.checklist_items.length === 0) return 0
    
    const completed = worksheet.checklist_items.filter(item => item.completed).length
    return Math.round((completed / worksheet.checklist_items.length) * 100)
  }

  // Analytics and Stats
  async getDailyStats(): Promise<any> {
    const today = new Date().toISOString().split('T')[0]
    
    const [worksheets, employees, reviews] = await Promise.all([
      this.client
        .from('worksheets')
        .select('*')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`),
      this.client
        .from('employees')
        .select('*')
        .eq('status', 'ACTIVE'),
      this.client
        .from('close_reviews')
        .select('*')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
    ])
    
    const completedWorksheets = (worksheets.data as Worksheet[])?.filter((w: Worksheet) => w.status === 'completed') || []
    const avgRating = (reviews.data as any[])?.reduce((acc: number, r: any) => acc + r.overall_rating, 0) / ((reviews.data as any[])?.length || 1)
    
    return {
      completed_workflows: completedWorksheets.length,
      total_workflows: worksheets.data?.length || 0,
      active_employees: employees.data?.length || 0,
      avg_rating: Math.round(avgRating * 10) / 10,
      completion_rate: worksheets.data?.length 
        ? Math.round((completedWorksheets.length / worksheets.data.length) * 100)
        : 0
    }
  }
}

// Export service instance
export const db = new DatabaseService(supabase)

// Note: Legacy compatibility would need to be implemented separately
// when migrating existing data from the archive-webapp
