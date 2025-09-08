import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a service role client for database operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Create a client for browser operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Employee {
  id: string
  name: string
  department: 'FOH' | 'BOH'
  languages_spoken: string[]
  roles: string[]
  shifts: string[]
  active: boolean
  created_at: string
}

export interface Worksheet {
  id: string
  employee_id: string
  employee_name: string
  shift_type: string
  department: 'FOH' | 'BOH'
  language_used: 'en' | 'es' | 'tr'
  worksheet_data: any
  photos: string[]
  completion_percentage: number
  time_started: string
  time_completed?: string
  issues_flagged: string[]
  submitted_at?: string
  created_at: string
}

export interface InventoryItem {
  id: string
  name: string
  name_es?: string
  name_tr?: string
  category: string
  unit: string
  par_level: number
  current_stock: number
  supplier?: string
  cost?: number
  recipe_usage: string[]
  created_at: string
  updated_at: string
}

export interface Recipe {
  id: string
  name: string
  name_es?: string
  name_tr?: string
  ingredients: any[]
  instructions: string[]
  instructions_es?: string[]
  instructions_tr?: string[]
  batch_size?: string
  prep_time?: number
  category: string
  created_at: string
}

export interface Order {
  id: string
  items: any[]
  requested_by: string
  requested_by_name: string
  approved_by?: string
  approved_by_name?: string
  status: 'Pending' | 'Approved' | 'Ordered' | 'Delivered'
  delivery_date?: string
  notes?: string
  total_cost?: number
  created_at: string
  updated_at: string
}

export interface MissingItemReport {
  id: string
  item_name: string
  quantity_needed?: string
  reason?: string
  urgency: 'Low' | 'Medium' | 'High'
  reported_by: string
  reported_by_name: string
  reported_to: string
  status: 'Open' | 'In Progress' | 'Fixed'
  created_at: string
  resolved_at?: string
}

export interface CloseReview {
  id: string
  department: 'FOH' | 'BOH'
  shift_type: string
  review_date: string
  reviewer_id: string
  reviewer_name: string
  close_quality_rating: number // 1-5 scale
  issues_found: string[]
  photos: string[]
  needs_followup: boolean
  followup_notes?: string
  inventory_counts?: any // JSON object with counts
  storage_condition_rating?: number // 1-5 scale for BOH prep review
  equipment_status?: any // JSON object with equipment states
  created_at: string
  reviewed_at?: string
}

// Database service functions
export const db = {
  // Employees
  async getEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('active', true)
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async getEmployeesByDepartment(department: 'FOH' | 'BOH'): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('department', department)
      .eq('active', true)
      .order('name')
    
    if (error) throw error
    return data || []
  },

  // Worksheets
  async createWorksheet(worksheet: Partial<Worksheet>): Promise<Worksheet> {
    const { data, error } = await supabase
      .from('worksheets')
      .insert(worksheet)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getWorksheets(limit = 50): Promise<Worksheet[]> {
    const { data, error } = await supabase
      .from('worksheets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  async updateWorksheet(id: string, updates: Partial<Worksheet>): Promise<Worksheet> {
    const { data, error } = await supabase
      .from('worksheets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Inventory
  async getInventoryItems(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async getLowStockItems(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('current_stock')
    
    if (error) throw error
    return data?.filter(item => item.current_stock < item.par_level) || []
  },

  async updateInventoryStock(id: string, newStock: number): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({ 
        current_stock: newStock, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Orders
  async createOrder(order: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Missing Items Reports
  async createMissingItemReport(report: Partial<MissingItemReport>): Promise<MissingItemReport> {
    const { data, error } = await supabase
      .from('missing_items_reports')
      .insert(report)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getMissingItemReports(): Promise<MissingItemReport[]> {
    const { data, error } = await supabase
      .from('missing_items_reports')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async updateMissingItemStatus(id: string, status: MissingItemReport['status']): Promise<MissingItemReport> {
    const updates: any = { status }
    if (status === 'Fixed') {
      updates.resolved_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('missing_items_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Recipes
  async getRecipes(): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  // Close Reviews
  async createCloseReview(review: Partial<CloseReview>): Promise<CloseReview> {
    const { data, error } = await supabase
      .from('close_reviews')
      .insert(review)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getCloseReviews(department?: 'FOH' | 'BOH', limit = 20): Promise<CloseReview[]> {
    let query = supabase
      .from('close_reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (department) {
      query = query.eq('department', department)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getLatestCloseReview(department: 'FOH' | 'BOH', shift_type: string): Promise<CloseReview | null> {
    const { data, error } = await supabase
      .from('close_reviews')
      .select('*')
      .eq('department', department)
      .eq('shift_type', shift_type)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  },

  async updateCloseReview(id: string, updates: Partial<CloseReview>): Promise<CloseReview> {
    const { data, error } = await supabase
      .from('close_reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
