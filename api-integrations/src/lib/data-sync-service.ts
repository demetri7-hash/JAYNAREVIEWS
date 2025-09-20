/**
 * Data Synchronization Service Layer
 * Handles syncing data between TOAST/Homebase APIs and THE PASS database
 */

// import { supabase } from './supabase' // TODO: Import actual Supabase client
import { toastAPI, safeToastCall } from './toast-api'
import { homebaseAPI, safeHomebaseCall } from './homebase-api'
import { integrationConfig } from './integration-config'
import type { 
  ToastSalesData, 
  ToastMenuItem, 
  ToastInventoryItem
} from './toast-api'
import type {
  HomebaseEmployee, 
  HomebaseScheduleEntry,
  HomebaseLaborCost 
} from './homebase-api'

// Temporary Supabase mock for development
interface SupabaseError {
  message: string
}

interface SupabaseResponse<T = unknown> {
  data?: T
  error: SupabaseError | null
}

interface UpsertOptions {
  onConflict?: string
}

interface OrderOptions {
  ascending?: boolean
}

type SupabaseCallback<T> = (result: SupabaseResponse<T>) => void

const supabase = {
  from: (table: string) => ({
    upsert: async (data: Record<string, unknown> | Record<string, unknown>[], options?: UpsertOptions): Promise<SupabaseResponse> => ({ error: null }),
    insert: async (data: Record<string, unknown> | Record<string, unknown>[]): Promise<SupabaseResponse> => ({ error: null }),
    select: (columns: string) => ({
      order: (column: string, options?: OrderOptions) => ({
        limit: (limit: number) => ({
          then: async <T>(callback: SupabaseCallback<T[]>) => callback({ data: [], error: null })
        })
      }),
      lt: (column: string, value: string) => ({
        then: async <T>(callback: SupabaseCallback<T[]>) => callback({ data: [], error: null })
      })
    }),
    delete: () => ({
      lt: (column: string, value: string) => ({
        then: async (callback: SupabaseCallback<null>) => callback({ error: null })
      })
    })
  })
}

export interface SyncResult {
  success: boolean
  recordsProcessed: number
  errors: string[]
  warnings: string[]
  duration: number
  timestamp: Date
}

export interface SyncLogEntry {
  id: string
  sync_type: string
  sync_timestamp: Date
  records_processed: number
  success: boolean
  error_message?: string
  duration_ms: number
}

export class DataSyncService {
  private static instance: DataSyncService

  public static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService()
    }
    return DataSyncService.instance
  }

  /**
   * Sync all data from both APIs
   */
  async syncAllData(): Promise<{
    toast: SyncResult | null
    homebase: SyncResult | null
    overall: { success: boolean; totalRecords: number; errors: string[] }
  }> {
    const results = {
      toast: null as SyncResult | null,
      homebase: null as SyncResult | null,
      overall: { success: false, totalRecords: 0, errors: [] as string[] }
    }

    const config = integrationConfig.getConfig()

    // Sync TOAST data
    if (config.toast.enabled && config.toast.configured) {
      try {
        results.toast = await this.syncToastData()
      } catch (error) {
        results.overall.errors.push(`TOAST sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Sync Homebase data
    if (config.homebase.enabled && config.homebase.configured) {
      try {
        results.homebase = await this.syncHomebaseData()
      } catch (error) {
        results.overall.errors.push(`Homebase sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Calculate overall results
    const toastRecords = results.toast?.recordsProcessed || 0
    const homebaseRecords = results.homebase?.recordsProcessed || 0
    results.overall.totalRecords = toastRecords + homebaseRecords
    results.overall.success = results.overall.errors.length === 0 && 
                             (results.toast?.success !== false) && 
                             (results.homebase?.success !== false)

    return results
  }

  /**
   * Sync data from TOAST API
   */
  async syncToastData(): Promise<SyncResult> {
    const startTime = Date.now()
    const result: SyncResult = {
      success: false,
      recordsProcessed: 0,
      errors: [],
      warnings: [],
      duration: 0,
      timestamp: new Date()
    }

    try {
      // Sync sales data
      const salesResult = await this.syncSalesData()
      result.recordsProcessed += salesResult.recordsProcessed
      result.errors.push(...salesResult.errors)
      result.warnings.push(...salesResult.warnings)

      // Sync menu items
      const menuResult = await this.syncMenuItems()
      result.recordsProcessed += menuResult.recordsProcessed
      result.errors.push(...menuResult.errors)
      result.warnings.push(...menuResult.warnings)

      // Sync inventory data
      const inventoryResult = await this.syncInventoryData()
      result.recordsProcessed += inventoryResult.recordsProcessed
      result.errors.push(...inventoryResult.errors)
      result.warnings.push(...inventoryResult.warnings)

      result.success = result.errors.length === 0
      result.duration = Date.now() - startTime

      // Log sync result
      await this.logSyncResult('toast_full_sync', result)

      return result
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown sync error')
      result.duration = Date.now() - startTime
      await this.logSyncResult('toast_full_sync', result)
      return result
    }
  }

  /**
   * Sync data from Homebase API
   */
  async syncHomebaseData(): Promise<SyncResult> {
    const startTime = Date.now()
    const result: SyncResult = {
      success: false,
      recordsProcessed: 0,
      errors: [],
      warnings: [],
      duration: 0,
      timestamp: new Date()
    }

    try {
      // Sync employee data
      const employeeResult = await this.syncEmployeeData()
      result.recordsProcessed += employeeResult.recordsProcessed
      result.errors.push(...employeeResult.errors)
      result.warnings.push(...employeeResult.warnings)

      // Sync schedule data
      const scheduleResult = await this.syncScheduleData()
      result.recordsProcessed += scheduleResult.recordsProcessed
      result.errors.push(...scheduleResult.errors)
      result.warnings.push(...scheduleResult.warnings)

      // Sync labor cost data
      const laborResult = await this.syncLaborCostData()
      result.recordsProcessed += laborResult.recordsProcessed
      result.errors.push(...laborResult.errors)
      result.warnings.push(...laborResult.warnings)

      result.success = result.errors.length === 0
      result.duration = Date.now() - startTime

      // Log sync result
      await this.logSyncResult('homebase_full_sync', result)

      return result
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown sync error')
      result.duration = Date.now() - startTime
      await this.logSyncResult('homebase_full_sync', result)
      return result
    }
  }

  /**
   * Sync sales data from TOAST
   */
  private async syncSalesData(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      recordsProcessed: 0,
      errors: [],
      warnings: [],
      duration: 0,
      timestamp: new Date()
    }

    try {
      const today = new Date()
      const salesData = await safeToastCall(
        () => toastAPI.getSalesData(today),
        null,
        'Failed to fetch sales data from TOAST'
      )

      if (!salesData) {
        result.warnings.push('No sales data available from TOAST')
        return result
      }

      // Upsert sales data
      const { error } = await supabase
        .from('toast_sales_data')
        .upsert({
          business_date: salesData.businessDate,
          gross_sales: salesData.grossSales,
          net_sales: salesData.netSales,
          tax_amount: salesData.taxAmount,
          discount_amount: salesData.discountAmount,
          order_count: salesData.orderCount,
          average_ticket: salesData.averageTicket,
          hourly_breakdown: salesData.hourlyBreakdown,
          synced_at: new Date().toISOString()
        }, {
          onConflict: 'business_date'
        })

      if (error) {
        result.errors.push(`Failed to save sales data: ${error.message}`)
      } else {
        result.recordsProcessed = 1
        result.success = true
      }

      return result
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown sales sync error')
      return result
    }
  }

  /**
   * Sync menu items from TOAST
   */
  private async syncMenuItems(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      recordsProcessed: 0,
      errors: [],
      warnings: [],
      duration: 0,
      timestamp: new Date()
    }

    try {
      const menuItems = await safeToastCall(
        () => toastAPI.getMenuItems(),
        [],
        'Failed to fetch menu items from TOAST'
      )

      if (menuItems.length === 0) {
        result.warnings.push('No menu items available from TOAST')
        return result
      }

      // Transform menu items for database
      const menuData = menuItems.map(item => ({
        toast_menu_item_id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        sold_today: item.soldToday,
        sold_yesterday: item.soldYesterday,
        inventory_level: item.inventoryLevel,
        low_stock_threshold: item.lowStockThreshold,
        modifiers: item.modifiers,
        synced_at: new Date().toISOString()
      }))

      // Upsert menu items
      const { error } = await supabase
        .from('toast_menu_items')
        .upsert(menuData, {
          onConflict: 'toast_menu_item_id'
        })

      if (error) {
        result.errors.push(`Failed to save menu items: ${error.message}`)
      } else {
        result.recordsProcessed = menuData.length
        result.success = true
      }

      return result
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown menu sync error')
      return result
    }
  }

  /**
   * Sync inventory data from TOAST
   */
  private async syncInventoryData(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      recordsProcessed: 0,
      errors: [],
      warnings: [],
      duration: 0,
      timestamp: new Date()
    }

    try {
      const inventoryItems = await safeToastCall(
        () => toastAPI.getInventoryLevels(),
        [],
        'Failed to fetch inventory data from TOAST'
      )

      if (inventoryItems.length === 0) {
        result.warnings.push('No inventory data available from TOAST')
        return result
      }

      // Transform inventory items for database
      const inventoryData = inventoryItems.map(item => ({
        toast_inventory_id: item.id,
        name: item.name,
        current_level: item.currentLevel,
        unit: item.unit,
        low_stock_threshold: item.lowStockThreshold,
        cost_per_unit: item.costPerUnit,
        last_updated: item.lastUpdated,
        synced_at: new Date().toISOString()
      }))

      // Upsert inventory items
      const { error } = await supabase
        .from('toast_inventory')
        .upsert(inventoryData, {
          onConflict: 'toast_inventory_id'
        })

      if (error) {
        result.errors.push(`Failed to save inventory data: ${error.message}`)
      } else {
        result.recordsProcessed = inventoryData.length
        result.success = true
      }

      return result
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown inventory sync error')
      return result
    }
  }

  /**
   * Sync employee data from Homebase
   */
  private async syncEmployeeData(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      recordsProcessed: 0,
      errors: [],
      warnings: [],
      duration: 0,
      timestamp: new Date()
    }

    try {
      const employees = await safeHomebaseCall(
        () => homebaseAPI.getEmployees(),
        [],
        'Failed to fetch employees from Homebase'
      )

      if (employees.length === 0) {
        result.warnings.push('No employees available from Homebase')
        return result
      }

      // Transform employees for database
      const employeeData = employees.map(emp => ({
        homebase_employee_id: emp.id,
        first_name: emp.firstName,
        last_name: emp.lastName,
        email: emp.email,
        phone: emp.phone,
        hourly_rate: emp.hourlyRate,
        position: emp.position,
        department: emp.department,
        skills: emp.skills,
        is_active: emp.isActive,
        hire_date: emp.hireDate,
        avatar: emp.avatar,
        synced_at: new Date().toISOString()
      }))

      // Upsert employees
      const { error } = await supabase
        .from('homebase_employees')
        .upsert(employeeData, {
          onConflict: 'homebase_employee_id'
        })

      if (error) {
        result.errors.push(`Failed to save employee data: ${error.message}`)
      } else {
        result.recordsProcessed = employeeData.length
        result.success = true
      }

      return result
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown employee sync error')
      return result
    }
  }

  /**
   * Sync schedule data from Homebase
   */
  private async syncScheduleData(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      recordsProcessed: 0,
      errors: [],
      warnings: [],
      duration: 0,
      timestamp: new Date()
    }

    try {
      const today = new Date()
      const oneWeekFromNow = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000))
      
      const scheduleEntries = await safeHomebaseCall(
        () => homebaseAPI.getSchedule(today, oneWeekFromNow),
        [],
        'Failed to fetch schedule from Homebase'
      )

      if (scheduleEntries.length === 0) {
        result.warnings.push('No schedule entries available from Homebase')
        return result
      }

      // Transform schedule entries for database
      const scheduleData = scheduleEntries.map(entry => ({
        homebase_schedule_id: entry.id,
        homebase_employee_id: entry.employeeId,
        employee_name: `${entry.employee.firstName} ${entry.employee.lastName}`,
        start_time: entry.startTime,
        end_time: entry.endTime,
        department: entry.department,
        position: entry.position,
        scheduled_hours: entry.scheduledHours,
        breaks: entry.breaks,
        is_published: entry.isPublished,
        notes: entry.notes,
        synced_at: new Date().toISOString()
      }))

      // Upsert schedule entries
      const { error } = await supabase
        .from('homebase_schedules')
        .upsert(scheduleData, {
          onConflict: 'homebase_schedule_id'
        })

      if (error) {
        result.errors.push(`Failed to save schedule data: ${error.message}`)
      } else {
        result.recordsProcessed = scheduleData.length
        result.success = true
      }

      return result
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown schedule sync error')
      return result
    }
  }

  /**
   * Sync labor cost data from Homebase
   */
  private async syncLaborCostData(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      recordsProcessed: 0,
      errors: [],
      warnings: [],
      duration: 0,
      timestamp: new Date()
    }

    try {
      const today = new Date()
      const yesterday = new Date(today.getTime() - (24 * 60 * 60 * 1000))
      
      const laborCosts = await safeHomebaseCall(
        () => homebaseAPI.getLaborCosts(yesterday, today),
        [],
        'Failed to fetch labor costs from Homebase'
      )

      if (laborCosts.length === 0) {
        result.warnings.push('No labor cost data available from Homebase')
        return result
      }

      // Transform labor costs for database
      const laborData = laborCosts.map(cost => ({
        date: cost.date,
        total_scheduled_hours: cost.totalScheduledHours,
        total_actual_hours: cost.totalActualHours,
        total_scheduled_cost: cost.totalScheduledCost,
        total_actual_cost: cost.totalActualCost,
        overtime_hours: cost.overtimeHours,
        overtime_cost: cost.overtimeCost,
        by_department: cost.byDepartment,
        by_employee: cost.byEmployee,
        synced_at: new Date().toISOString()
      }))

      // Upsert labor costs
      const { error } = await supabase
        .from('homebase_labor_costs')
        .upsert(laborData, {
          onConflict: 'date'
        })

      if (error) {
        result.errors.push(`Failed to save labor cost data: ${error.message}`)
      } else {
        result.recordsProcessed = laborData.length
        result.success = true
      }

      return result
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown labor cost sync error')
      return result
    }
  }

  /**
   * Log sync results to database
   */
  private async logSyncResult(syncType: string, result: SyncResult): Promise<void> {
    try {
      await supabase
        .from('integration_sync_log')
        .insert({
          sync_type: syncType,
          sync_timestamp: result.timestamp.toISOString(),
          records_processed: result.recordsProcessed,
          success: result.success,
          error_message: result.errors.length > 0 ? result.errors.join('; ') : null,
          duration_ms: result.duration
        })
    } catch (error) {
      console.error('Failed to log sync result:', error)
    }
  }

  /**
   * Get sync history
   */
  async getSyncHistory(limit: number = 50): Promise<SyncLogEntry[]> {
    const { data, error } = await supabase
      .from('integration_sync_log')
      .select('*')
      .order('sync_timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch sync history: ${error.message}`)
    }

    return (data as SyncLogEntry[]) || []
  }

  /**
   * Clean up old sync logs
   */
  async cleanupSyncLogs(): Promise<void> {
    const config = integrationConfig.getConfig()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - config.sync.logRetentionDays)

    await supabase
      .from('integration_sync_log')
      .delete()
      .lt('sync_timestamp', cutoffDate.toISOString())
  }

  /**
   * Get sync statistics
   */
  async getSyncStatistics(): Promise<{
    totalSyncs: number
    successfulSyncs: number
    failedSyncs: number
    successRate: number
    lastSyncTime?: Date
    averageRecordsPerSync: number
  }> {
    const { data, error } = await supabase
      .from('integration_sync_log')
      .select('*')
      .order('sync_timestamp', { ascending: false })
      .limit(100)

    if (error) {
      throw new Error(`Failed to fetch sync statistics: ${error.message}`)
    }

    if (!data || data.length === 0) {
      return {
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        successRate: 0,
        averageRecordsPerSync: 0
      }
    }

    const syncLogs = data as SyncLogEntry[]
    const totalSyncs = syncLogs.length
    const successfulSyncs = syncLogs.filter(log => log.success).length
    const failedSyncs = totalSyncs - successfulSyncs
    const successRate = (successfulSyncs / totalSyncs) * 100
    const lastSyncTime = new Date(syncLogs[0].sync_timestamp)
    const totalRecords = syncLogs.reduce((sum, log) => sum + log.records_processed, 0)
    const averageRecordsPerSync = Math.round(totalRecords / totalSyncs)

    return {
      totalSyncs,
      successfulSyncs,
      failedSyncs,
      successRate,
      lastSyncTime,
      averageRecordsPerSync
    }
  }
}

// Export singleton instance
export const dataSyncService = DataSyncService.getInstance()