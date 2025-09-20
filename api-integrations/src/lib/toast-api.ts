/**
 * TOAST POS API Integration Client
 * Handles authentication, data fetching, and error management for TOAST POS system
 * 
 * Required Environment Variables:
 * - TOAST_API_KEY: Your TOAST API authentication token
 * - TOAST_RESTAURANT_ID: Your restaurant's external ID in TOAST
 * - TOAST_BASE_URL: API base URL (defaults to production)
 */

// Raw API response interfaces
interface RawToastSalesData {
  grossSales?: number
  netSales?: number
  taxAmount?: number
  discountAmount?: number
  orderCount?: number
  averageTicket?: number
  hourlyBreakdown?: {
    hour: number
    sales: number
    orders: number
  }[]
}

interface RawToastMenuItem {
  id: string
  name: string
  category?: string
  price?: number
  modifiers?: ToastModifier[]
  inventoryLevel?: number
  lowStockThreshold?: number
}

interface RawToastMenuData {
  menuItems?: RawToastMenuItem[]
}

interface RawToastSalesItem {
  menuItemId: string
  soldToday?: number
  soldYesterday?: number
}

interface RawToastSalesResponse {
  itemSales?: RawToastSalesItem[]
}

interface RawToastInventoryItem {
  id: string
  name: string
  currentLevel?: number
  unit?: string
  lowStockThreshold?: number
  lastUpdated?: string
  costPerUnit?: number
}

interface RawToastInventoryData {
  inventoryItems?: RawToastInventoryItem[]
}

interface RawToastOrder {
  id: string
  orderNumber: string
  createdDate: string
  closedDate?: string
  totalAmount?: number
  status?: 'OPEN' | 'CLOSED' | 'VOIDED'
  items?: ToastOrderItem[]
  customer?: {
    name: string
    phone?: string
    email?: string
  }
}

interface RawToastOrderData {
  orders?: RawToastOrder[]
}

export interface ToastSalesData {
  businessDate: string
  grossSales: number
  netSales: number
  taxAmount: number
  discountAmount: number
  orderCount: number
  averageTicket: number
  hourlyBreakdown: {
    hour: number
    sales: number
    orders: number
  }[]
}

export interface ToastMenuItem {
  id: string
  name: string
  category: string
  price: number
  modifiers?: ToastModifier[]
  soldToday: number
  soldYesterday: number
  inventoryLevel?: number
  lowStockThreshold?: number
}

export interface ToastModifier {
  id: string
  name: string
  price: number
  category: string
}

export interface ToastInventoryItem {
  id: string
  name: string
  currentLevel: number
  unit: string
  lowStockThreshold: number
  lastUpdated: string
  costPerUnit: number
}

export interface ToastOrder {
  id: string
  orderNumber: string
  createdDate: string
  closedDate?: string
  totalAmount: number
  status: 'OPEN' | 'CLOSED' | 'VOIDED'
  items: ToastOrderItem[]
  customer?: {
    name: string
    phone?: string
    email?: string
  }
}

export interface ToastOrderItem {
  menuItemId: string
  name: string
  quantity: number
  basePrice: number
  totalPrice: number
  modifiers: ToastModifier[]
}

export class ToastAPIError extends Error {
  constructor(
    public statusCode: number,
    public toastErrorCode?: string,
    message?: string
  ) {
    super(message || `TOAST API Error: ${statusCode}`)
    this.name = 'ToastAPIError'
  }
}

export class ToastAPIClient {
  private readonly baseURL: string
  private readonly apiKey: string
  private readonly restaurantId: string
  private readonly timeout: number = 30000 // 30 seconds

  constructor(options?: {
    apiKey?: string
    restaurantId?: string
    baseURL?: string
    timeout?: number
  }) {
    this.apiKey = options?.apiKey || process.env.TOAST_API_KEY || ''
    this.restaurantId = options?.restaurantId || process.env.TOAST_RESTAURANT_ID || ''
    this.baseURL = options?.baseURL || process.env.TOAST_BASE_URL || 'https://api.toasttab.com'
    this.timeout = options?.timeout || 30000

    if (!this.apiKey || !this.restaurantId) {
      throw new Error('TOAST API key and restaurant ID are required')
    }
  }

  /**
   * Test API connection and authentication
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/config/v1/restaurants')
      return true
    } catch (error) {
      console.error('TOAST API connection test failed:', error)
      return false
    }
  }

  /**
   * Get sales data for a specific date
   */
  async getSalesData(businessDate: Date): Promise<ToastSalesData> {
    const dateStr = businessDate.toISOString().split('T')[0]
    
    const response = await this.makeRequest<RawToastSalesData>('/reporting/v1/reports', {
      reportType: 'SALES_SUMMARY',
      businessDate: dateStr
    })

    return this.transformSalesData(response, dateStr)
  }

  /**
   * Get real-time sales data for today
   */
  async getTodaysSales(): Promise<ToastSalesData> {
    return this.getSalesData(new Date())
  }

  /**
   * Get hourly sales data for better rush period detection
   */
  async getHourlySales(businessDate: Date): Promise<ToastSalesData['hourlyBreakdown']> {
    const salesData = await this.getSalesData(businessDate)
    return salesData.hourlyBreakdown
  }

  /**
   * Get all menu items with sales performance
   */
  async getMenuItems(): Promise<ToastMenuItem[]> {
    const menuResponse = await this.makeRequest<RawToastMenuData>('/menus/v2/menus')
    const salesResponse = await this.makeRequest<RawToastSalesResponse>('/reporting/v1/reports', {
      reportType: 'MENU_SALES'
    })

    return this.transformMenuData(menuResponse, salesResponse)
  }

  /**
   * Get current inventory levels
   */
  async getInventoryLevels(): Promise<ToastInventoryItem[]> {
    const response = await this.makeRequest<RawToastInventoryData>('/stock/v1/inventory')
    return this.transformInventoryData(response)
  }

  /**
   * Get orders for a specific time period
   */
  async getOrders(startTime: Date, endTime: Date): Promise<ToastOrder[]> {
    const response = await this.makeRequest<RawToastOrderData>('/orders/v2/orders', {
      startDate: startTime.toISOString(),
      endDate: endTime.toISOString(),
      pageSize: 100
    })

    return this.transformOrderData(response)
  }

  /**
   * Get orders from the last hour (for rush detection)
   */
  async getOrdersLastHour(): Promise<ToastOrder[]> {
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - (60 * 60 * 1000)) // 1 hour ago
    
    return this.getOrders(startTime, endTime)
  }

  /**
   * Get sales projections based on historical data
   */
  async getSalesProjection(targetDate: Date): Promise<{
    projectedSales: number
    projectedOrders: number
    confidence: number
    basedOnDays: number
  }> {
    // Get historical data for the same day of week
    const dayOfWeek = targetDate.getDay()
    const historicalData: ToastSalesData[] = []
    
    // Get last 4 weeks of the same day
    for (let i = 1; i <= 4; i++) {
      const historicalDate = new Date(targetDate)
      historicalDate.setDate(historicalDate.getDate() - (7 * i))
      
      try {
        const data = await this.getSalesData(historicalDate)
        historicalData.push(data)
      } catch (error) {
        console.warn(`Could not fetch historical data for ${historicalDate.toDateString()}`)
      }
    }

    if (historicalData.length === 0) {
      throw new Error('No historical data available for projection')
    }

    const avgSales = historicalData.reduce((sum, data) => sum + data.netSales, 0) / historicalData.length
    const avgOrders = historicalData.reduce((sum, data) => sum + data.orderCount, 0) / historicalData.length
    
    return {
      projectedSales: Math.round(avgSales),
      projectedOrders: Math.round(avgOrders),
      confidence: Math.min(historicalData.length / 4, 1), // 100% confidence with 4 weeks of data
      basedOnDays: historicalData.length
    }
  }

  /**
   * Make authenticated HTTP request to TOAST API
   */
  private async makeRequest<T = unknown>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const url = new URL(this.baseURL + endpoint)
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined) {
          url.searchParams.append(key, params[key].toString())
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
          'Toast-Restaurant-External-ID': this.restaurantId,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ToastAPIError(
          response.status,
          errorData.errorCode,
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        )
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof ToastAPIError) {
        throw error
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ToastAPIError(408, 'TIMEOUT', 'Request timeout')
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown network error'
      throw new ToastAPIError(0, 'NETWORK_ERROR', errorMessage)
    }
  }

  /**
   * Transform raw TOAST sales data into our format
   */
  private transformSalesData(rawData: RawToastSalesData, businessDate: string): ToastSalesData {
    // This is a simplified transformation - actual TOAST API response structure may vary
    return {
      businessDate,
      grossSales: rawData.grossSales || 0,
      netSales: rawData.netSales || 0,
      taxAmount: rawData.taxAmount || 0,
      discountAmount: rawData.discountAmount || 0,
      orderCount: rawData.orderCount || 0,
      averageTicket: rawData.averageTicket || 0,
      hourlyBreakdown: rawData.hourlyBreakdown || []
    }
  }

  /**
   * Transform menu data with sales performance
   */
  private transformMenuData(menuData: RawToastMenuData, salesData: RawToastSalesResponse): ToastMenuItem[] {
    // Simplified transformation - combine menu items with sales performance
    const menuItems = menuData.menuItems || []
    const salesByItem = new Map<string, RawToastSalesItem>()
    
    if (salesData.itemSales) {
      salesData.itemSales.forEach((item: RawToastSalesItem) => {
        salesByItem.set(item.menuItemId, item)
      })
    }

    return menuItems.map((item: RawToastMenuItem) => {
      const sales = salesByItem.get(item.id) || { soldToday: 0, soldYesterday: 0 }
      return {
        id: item.id,
        name: item.name,
        category: item.category || 'Other',
        price: item.price || 0,
        modifiers: item.modifiers || [],
        soldToday: sales.soldToday || 0,
        soldYesterday: sales.soldYesterday || 0,
        inventoryLevel: item.inventoryLevel,
        lowStockThreshold: item.lowStockThreshold
      }
    })
  }

  /**
   * Transform inventory data
   */
  private transformInventoryData(rawData: RawToastInventoryData): ToastInventoryItem[] {
    const items = rawData.inventoryItems || []
    
    return items.map((item: RawToastInventoryItem) => ({
      id: item.id,
      name: item.name,
      currentLevel: item.currentLevel || 0,
      unit: item.unit || 'each',
      lowStockThreshold: item.lowStockThreshold || 0,
      lastUpdated: item.lastUpdated || new Date().toISOString(),
      costPerUnit: item.costPerUnit || 0
    }))
  }

  /**
   * Transform order data
   */
  private transformOrderData(rawData: RawToastOrderData): ToastOrder[] {
    const orders = rawData.orders || []
    
    return orders.map((order: RawToastOrder) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      createdDate: order.createdDate,
      closedDate: order.closedDate,
      totalAmount: order.totalAmount || 0,
      status: order.status || 'OPEN',
      items: order.items || [],
      customer: order.customer
    }))
  }
}

// Export singleton instance for easy use throughout the app
export const toastAPI = new ToastAPIClient()

// Utility function to check if TOAST integration is properly configured
export function isToastConfigured(): boolean {
  return !!(process.env.TOAST_API_KEY && process.env.TOAST_RESTAURANT_ID)
}

// Utility function to safely call TOAST API with fallbacks
export async function safeToastCall<T>(
  apiCall: () => Promise<T>,
  fallback: T,
  errorMessage: string = 'TOAST API call failed'
): Promise<T> {
  if (!isToastConfigured()) {
    console.warn('TOAST API not configured, using fallback data')
    return fallback
  }

  try {
    return await apiCall()
  } catch (error) {
    console.error(errorMessage, error)
    return fallback
  }
}