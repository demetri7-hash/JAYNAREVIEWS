/**
 * Homebase Employee Scheduling API Integration Client
 * Handles authentication, data fetching, and error management for Homebase scheduling system
 * 
 * Required Environment Variables:
 * - HOMEBASE_API_KEY: Your Homebase API authentication token
 * - HOMEBASE_COMPANY_ID: Your company ID in Homebase
 * - HOMEBASE_BASE_URL: API base URL (defaults to production)
 */

// Raw API response interfaces
interface RawHomebaseEmployee {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  hourly_rate?: number
  position?: string
  department?: string
  skills?: string[]
  is_active?: boolean
  hire_date?: string
  avatar_url?: string
}

interface RawHomebaseEmployeeData {
  employees?: RawHomebaseEmployee[]
  employee?: RawHomebaseEmployee
}

interface RawHomebaseScheduleEntry {
  id: string
  employee_id: string
  employee?: {
    id: string
    first_name: string
    last_name: string
    position?: string
  }
  start_time: string
  end_time: string
  department?: string
  position?: string
  scheduled_hours?: number
  breaks?: HomebaseBreak[]
  is_published?: boolean
  notes?: string
}

interface RawHomebaseScheduleData {
  schedule_entries?: RawHomebaseScheduleEntry[]
  schedules?: RawHomebaseScheduleEntry[]
}

interface RawHomebaseTimeClockEntry {
  id: string
  employee_id: string
  clock_in_time: string
  clock_out_time?: string
  scheduled_start_time: string
  scheduled_end_time: string
  total_hours?: number
  regular_hours?: number
  overtime_hours?: number
  department?: string
  position?: string
  status?: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ON_BREAK'
}

interface RawHomebaseTimeClockData {
  time_clock_entries?: RawHomebaseTimeClockEntry[]
}

interface RawHomebaseLaborCost {
  date: string
  total_scheduled_hours?: number
  total_actual_hours?: number
  total_scheduled_cost?: number
  total_actual_cost?: number
  overtime_hours?: number
  overtime_cost?: number
  by_department?: {
    department: string
    scheduledHours: number
    actualHours: number
    scheduledCost: number
    actualCost: number
  }[]
  by_employee?: {
    employeeId: string
    name: string
    scheduledHours: number
    actualHours: number
    scheduledCost: number
    actualCost: number
  }[]
}

interface RawHomebaseLaborCostData {
  labor_costs?: RawHomebaseLaborCost[]
}

export interface HomebaseEmployee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  hourlyRate?: number
  position: string
  department: string
  skills: string[]
  isActive: boolean
  hireDate: string
  avatar?: string
}

export interface HomebaseScheduleEntry {
  id: string
  employeeId: string
  employee: {
    id: string
    firstName: string
    lastName: string
    position: string
  }
  startTime: string
  endTime: string
  department: string
  position: string
  scheduledHours: number
  breaks: HomebaseBreak[]
  isPublished: boolean
  notes?: string
}

export interface HomebaseBreak {
  id: string
  name: string
  startTime: string
  endTime: string
  duration: number // minutes
  isPaid: boolean
}

export interface HomebaseTimeClockEntry {
  id: string
  employeeId: string
  clockInTime: string
  clockOutTime?: string
  scheduledStartTime: string
  scheduledEndTime: string
  totalHours?: number
  regularHours?: number
  overtimeHours?: number
  department: string
  position: string
  status: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ON_BREAK'
}

export interface HomebaseLaborCost {
  date: string
  totalScheduledHours: number
  totalActualHours: number
  totalScheduledCost: number
  totalActualCost: number
  overtimeHours: number
  overtimeCost: number
  byDepartment: {
    department: string
    scheduledHours: number
    actualHours: number
    scheduledCost: number
    actualCost: number
  }[]
  byEmployee: {
    employeeId: string
    name: string
    scheduledHours: number
    actualHours: number
    scheduledCost: number
    actualCost: number
  }[]
}

export interface HomebaseShiftPattern {
  dayOfWeek: number // 0 = Sunday, 6 = Saturday
  startTime: string
  endTime: string
  position: string
  department: string
  isRecurring: boolean
}

export class HomebaseAPIError extends Error {
  constructor(
    public statusCode: number,
    public homebaseErrorCode?: string,
    message?: string
  ) {
    super(message || `Homebase API Error: ${statusCode}`)
    this.name = 'HomebaseAPIError'
  }
}

export class HomebaseAPIClient {
  private readonly baseURL: string
  private readonly apiKey: string
  private readonly companyId: string
  private readonly timeout: number = 30000 // 30 seconds

  constructor(options?: {
    apiKey?: string
    companyId?: string
    baseURL?: string
    timeout?: number
  }) {
    this.apiKey = options?.apiKey || process.env.HOMEBASE_API_KEY || ''
    this.companyId = options?.companyId || process.env.HOMEBASE_COMPANY_ID || ''
    this.baseURL = options?.baseURL || process.env.HOMEBASE_BASE_URL || 'https://api.joinhomebase.com'
    this.timeout = options?.timeout || 30000

    if (!this.apiKey || !this.companyId) {
      throw new Error('Homebase API key and company ID are required')
    }
  }

  /**
   * Test API connection and authentication
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/v1/companies/current')
      return true
    } catch (error) {
      console.error('Homebase API connection test failed:', error)
      return false
    }
  }

  /**
   * Get all employees
   */
  async getEmployees(): Promise<HomebaseEmployee[]> {
    const response = await this.makeRequest<RawHomebaseEmployeeData>('/v1/employees')
    return this.transformEmployeeData(response)
  }

  /**
   * Get active employees only
   */
  async getActiveEmployees(): Promise<HomebaseEmployee[]> {
    const employees = await this.getEmployees()
    return employees.filter(emp => emp.isActive)
  }

  /**
   * Get employee by ID
   */
  async getEmployee(employeeId: string): Promise<HomebaseEmployee> {
    const response = await this.makeRequest<RawHomebaseEmployeeData>(`/v1/employees/${employeeId}`)
    return this.transformSingleEmployeeData(response)
  }

  /**
   * Get schedule for a specific date or date range
   */
  async getSchedule(startDate: Date, endDate?: Date): Promise<HomebaseScheduleEntry[]> {
    const params: Record<string, string> = {
      start_date: this.formatDate(startDate)
    }
    
    if (endDate) {
      params.end_date = this.formatDate(endDate)
    } else {
      params.end_date = this.formatDate(startDate) // Same day if no end date
    }

    const response = await this.makeRequest<RawHomebaseScheduleData>('/v1/schedules', params)
    return this.transformScheduleData(response)
  }

  /**
   * Get today's schedule
   */
  async getTodaysSchedule(): Promise<HomebaseScheduleEntry[]> {
    return this.getSchedule(new Date())
  }

  /**
   * Get who's currently scheduled to work
   */
  async getCurrentStaff(): Promise<HomebaseScheduleEntry[]> {
    const now = new Date()
    const todaysSchedule = await this.getTodaysSchedule()
    
    return todaysSchedule.filter(entry => {
      const startTime = new Date(entry.startTime)
      const endTime = new Date(entry.endTime)
      return now >= startTime && now <= endTime
    })
  }

  /**
   * Get upcoming shifts (next 2 hours)
   */
  async getUpcomingShifts(): Promise<HomebaseScheduleEntry[]> {
    const now = new Date()
    const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000))
    const todaysSchedule = await this.getTodaysSchedule()
    
    return todaysSchedule.filter(entry => {
      const startTime = new Date(entry.startTime)
      return startTime > now && startTime <= twoHoursFromNow
    })
  }

  /**
   * Get time clock entries for a specific date
   */
  async getTimeClockEntries(date: Date): Promise<HomebaseTimeClockEntry[]> {
    const response = await this.makeRequest<RawHomebaseTimeClockData>('/v1/time_clock_entries', {
      date: this.formatDate(date)
    })
    return this.transformTimeClockData(response)
  }

  /**
   * Get who's currently clocked in
   */
  async getClockedInEmployees(): Promise<HomebaseTimeClockEntry[]> {
    const today = new Date()
    const entries = await this.getTimeClockEntries(today)
    
    return entries.filter(entry => entry.status === 'CLOCKED_IN')
  }

  /**
   * Get labor costs for a date range
   */
  async getLaborCosts(startDate: Date, endDate: Date): Promise<HomebaseLaborCost[]> {
    const response = await this.makeRequest<RawHomebaseLaborCostData>('/v1/labor_costs', {
      start_date: this.formatDate(startDate),
      end_date: this.formatDate(endDate)
    })
    return this.transformLaborCostData(response)
  }

  /**
   * Get employee skills and capabilities
   */
  async getEmployeeSkills(employeeId: string): Promise<string[]> {
    const employee = await this.getEmployee(employeeId)
    return employee.skills
  }

  /**
   * Find employees with specific skills
   */
  async getEmployeesWithSkills(requiredSkills: string[]): Promise<HomebaseEmployee[]> {
    const employees = await this.getActiveEmployees()
    
    return employees.filter(employee => 
      requiredSkills.some(skill => 
        employee.skills.some(empSkill => 
          empSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
    )
  }

  /**
   * Get optimal employee for a task based on schedule and skills
   */
  async findBestEmployeeForTask(
    requiredSkills: string[],
    department: string,
    timeSlot?: { start: Date; end: Date }
  ): Promise<HomebaseEmployee | null> {
    // Get employees with required skills
    const skilledEmployees = await this.getEmployeesWithSkills(requiredSkills)
    
    // Filter by department
    const departmentEmployees = skilledEmployees.filter(emp => 
      emp.department.toLowerCase() === department.toLowerCase()
    )

    if (timeSlot) {
      // Get schedule for the time slot
      const schedule = await this.getSchedule(timeSlot.start, timeSlot.end)
      const scheduledEmployeeIds = new Set(schedule.map(entry => entry.employeeId))
      
      // Filter to only employees who are scheduled
      const availableEmployees = departmentEmployees.filter(emp => 
        scheduledEmployeeIds.has(emp.id)
      )
      
      return availableEmployees[0] || null
    }

    return departmentEmployees[0] || null
  }

  /**
   * Get labor efficiency metrics
   */
  async getLaborEfficiency(date: Date): Promise<{
    scheduledHours: number
    actualHours: number
    efficiency: number // actual / scheduled
    overtimePercentage: number
    departmentBreakdown: Record<string, {
      scheduled: number
      actual: number
      efficiency: number
    }>
  }> {
    const endDate = new Date(date)
    endDate.setDate(endDate.getDate() + 1)
    
    const laborCosts = await this.getLaborCosts(date, endDate)
    
    if (laborCosts.length === 0) {
      return {
        scheduledHours: 0,
        actualHours: 0,
        efficiency: 0,
        overtimePercentage: 0,
        departmentBreakdown: {}
      }
    }

    const todayCosts = laborCosts[0]
    const efficiency = todayCosts.totalScheduledHours > 0 
      ? todayCosts.totalActualHours / todayCosts.totalScheduledHours 
      : 0

    const overtimePercentage = todayCosts.totalActualHours > 0
      ? (todayCosts.overtimeHours / todayCosts.totalActualHours) * 100
      : 0

    const departmentBreakdown: Record<string, {
      scheduled: number;
      actual: number;
      efficiency: number;
    }> = {}
    todayCosts.byDepartment.forEach(dept => {
      departmentBreakdown[dept.department] = {
        scheduled: dept.scheduledHours,
        actual: dept.actualHours,
        efficiency: dept.scheduledHours > 0 ? dept.actualHours / dept.scheduledHours : 0
      }
    })

    return {
      scheduledHours: todayCosts.totalScheduledHours,
      actualHours: todayCosts.totalActualHours,
      efficiency,
      overtimePercentage,
      departmentBreakdown
    }
  }

  /**
   * Make authenticated HTTP request to Homebase API
   */
  private async makeRequest<T = unknown>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(this.baseURL + endpoint)
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined) {
          url.searchParams.append(key, params[key])
        }
      })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Company-Id': this.companyId
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new HomebaseAPIError(
          response.status,
          errorData.error_code,
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof HomebaseAPIError) {
        throw error
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new HomebaseAPIError(408, 'TIMEOUT', 'Request timeout')
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown network error'
      throw new HomebaseAPIError(0, 'NETWORK_ERROR', errorMessage)
    }
  }

  /**
   * Format date for Homebase API (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  /**
   * Transform employee data from Homebase API
   */
  private transformEmployeeData(rawData: RawHomebaseEmployeeData): HomebaseEmployee[] {
    const employees = rawData.employees || []
    
    return employees.map((emp: RawHomebaseEmployee) => ({
      id: emp.id,
      firstName: emp.first_name,
      lastName: emp.last_name,
      email: emp.email,
      phone: emp.phone,
      hourlyRate: emp.hourly_rate,
      position: emp.position || 'Staff',
      department: emp.department || 'General',
      skills: emp.skills || [],
      isActive: emp.is_active !== false,
      hireDate: emp.hire_date || new Date().toISOString(),
      avatar: emp.avatar_url
    }))
  }

  /**
   * Transform single employee data
   */
  private transformSingleEmployeeData(rawData: RawHomebaseEmployeeData | RawHomebaseEmployee): HomebaseEmployee {
    const emp = 'employee' in rawData ? rawData.employee! : rawData as RawHomebaseEmployee
    
    return {
      id: emp.id,
      firstName: emp.first_name,
      lastName: emp.last_name,
      email: emp.email,
      phone: emp.phone,
      hourlyRate: emp.hourly_rate,
      position: emp.position || 'Staff',
      department: emp.department || 'General',
      skills: emp.skills || [],
      isActive: emp.is_active !== false,
      hireDate: emp.hire_date || new Date().toISOString(),
      avatar: emp.avatar_url
    }
  }

  /**
   * Transform schedule data
   */
  private transformScheduleData(rawData: RawHomebaseScheduleData): HomebaseScheduleEntry[] {
    const scheduleEntries = rawData.schedule_entries || rawData.schedules || []
    
    return scheduleEntries.map((entry: RawHomebaseScheduleEntry) => ({
      id: entry.id,
      employeeId: entry.employee_id,
      employee: {
        id: entry.employee?.id || entry.employee_id,
        firstName: entry.employee?.first_name || '',
        lastName: entry.employee?.last_name || '',
        position: entry.employee?.position || entry.position || ''
      },
      startTime: entry.start_time,
      endTime: entry.end_time,
      department: entry.department || 'General',
      position: entry.position || 'Staff',
      scheduledHours: entry.scheduled_hours || 0,
      breaks: entry.breaks || [],
      isPublished: entry.is_published !== false,
      notes: entry.notes
    }))
  }

  /**
   * Transform time clock data
   */
  private transformTimeClockData(rawData: RawHomebaseTimeClockData): HomebaseTimeClockEntry[] {
    const entries = rawData.time_clock_entries || []
    
    return entries.map((entry: RawHomebaseTimeClockEntry) => ({
      id: entry.id,
      employeeId: entry.employee_id,
      clockInTime: entry.clock_in_time,
      clockOutTime: entry.clock_out_time,
      scheduledStartTime: entry.scheduled_start_time,
      scheduledEndTime: entry.scheduled_end_time,
      totalHours: entry.total_hours,
      regularHours: entry.regular_hours,
      overtimeHours: entry.overtime_hours,
      department: entry.department || 'General',
      position: entry.position || 'Staff',
      status: entry.status || 'CLOCKED_OUT'
    }))
  }

  /**
   * Transform labor cost data
   */
  private transformLaborCostData(rawData: RawHomebaseLaborCostData): HomebaseLaborCost[] {
    const laborCosts = rawData.labor_costs || []
    
    return laborCosts.map((cost: RawHomebaseLaborCost) => ({
      date: cost.date,
      totalScheduledHours: cost.total_scheduled_hours || 0,
      totalActualHours: cost.total_actual_hours || 0,
      totalScheduledCost: cost.total_scheduled_cost || 0,
      totalActualCost: cost.total_actual_cost || 0,
      overtimeHours: cost.overtime_hours || 0,
      overtimeCost: cost.overtime_cost || 0,
      byDepartment: cost.by_department || [],
      byEmployee: cost.by_employee || []
    }))
  }
}

// Export singleton instance for easy use throughout the app
export const homebaseAPI = new HomebaseAPIClient()

// Utility function to check if Homebase integration is properly configured
export function isHomebaseConfigured(): boolean {
  return !!(process.env.HOMEBASE_API_KEY && process.env.HOMEBASE_COMPANY_ID)
}

// Utility function to safely call Homebase API with fallbacks
export async function safeHomebaseCall<T>(
  apiCall: () => Promise<T>,
  fallback: T,
  errorMessage: string = 'Homebase API call failed'
): Promise<T> {
  if (!isHomebaseConfigured()) {
    console.warn('Homebase API not configured, using fallback data')
    return fallback
  }

  try {
    return await apiCall()
  } catch (error) {
    console.error(errorMessage, error)
    return fallback
  }
}