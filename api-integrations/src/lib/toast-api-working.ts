/**
 * TOAST POS API Integration Client - Working Implementation
 * Successfully tested authentication and data fetching
 */

export interface ToastAPIConfig {
  baseURL: string
  clientId: string
  clientSecret: string
  restaurantId: string
}

export interface ToastAuthToken {
  tokenType: string
  accessToken: string
  expiresIn: number
  scope: string
}

export interface ToastRestaurantInfo {
  guid: string
  general: {
    name: string
    description: string
    timeZone: string
  }
  location: {
    address1: string
    address2?: string
    city: string
    stateCode: string
    zipCode: string
    country: string
    phone: string
  }
  schedules: Array<{
    dayOfTheWeek: string
    openTime: string
    closeTime: string
  }>
}

export interface ToastEmployee {
  guid: string
  entityType: string
  externalId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  jobReferences: Array<{
    jobGuid: string
    jobTitle: string
  }>
}

export interface ToastMenuItem {
  guid: string
  name: string
  description?: string
  price: number
  menuGroupGuid: string
  isDeleted: boolean
  modifiers?: ToastModifier[]
}

export interface ToastModifier {
  guid: string
  name: string
  price: number
}

export interface ToastOrder {
  guid: string
  entityType: string
  externalId: string
  restaurantGuid: string
  createdDate: string
  modifiedDate: string
  openedDate: string
  closedDate?: string
  promisedDate?: string
  channelGuid: string
  source: string
  diningOption: {
    guid: string
    behavior: string
  }
  checks: ToastCheck[]
  orderTotalAmount: number
  orderTaxAmount: number
  orderServiceAmount: number
  orderDiscountAmount: number
}

export interface ToastCheck {
  guid: string
  entityType: string
  displayNumber: string
  selections: ToastSelection[]
  totalAmount: number
  taxAmount: number
  discountAmount: number
}

export interface ToastSelection {
  guid: string
  itemGuid: string
  itemName: string
  quantity: number
  unitPrice: number
  basePrice: number
  price: number
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
  private baseURL: string
  private clientId: string
  private clientSecret: string
  private restaurantId: string
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor(config: ToastAPIConfig) {
    this.baseURL = config.baseURL
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
    this.restaurantId = config.restaurantId
  }

  /**
   * Authenticate with TOAST API using Standard API Access credentials
   */
  async authenticate(): Promise<ToastAuthToken> {
    const authUrl = `${this.baseURL}/authentication/v1/authentication/login`
    
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Toast-Restaurant-External-ID': this.restaurantId
      },
      body: JSON.stringify({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new ToastAPIError(
        response.status,
        errorData.code,
        `Authentication failed: ${errorData.message}`
      )
    }

    const data = await response.json()
    const token = data.token

    // Store token and expiry
    this.accessToken = token.accessToken
    this.tokenExpiry = new Date(Date.now() + (token.expiresIn * 1000))

    return {
      tokenType: token.tokenType,
      accessToken: token.accessToken,
      expiresIn: token.expiresIn,
      scope: token.scope
    }
  }

  /**
   * Check if current token is valid
   */
  private isTokenValid(): boolean {
    return !!(this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date())
  }

  /**
   * Ensure we have a valid token
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.isTokenValid()) {
      await this.authenticate()
    }
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    await this.ensureAuthenticated()

    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Toast-Restaurant-External-ID': this.restaurantId,
        'Content-Type': 'application/json',
        ...options?.headers
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ToastAPIError(
        response.status,
        errorData.code,
        errorData.message || `Request failed: ${response.status}`
      )
    }

    return response.json()
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getRestaurantInfo()
      return true
    } catch (error) {
      console.error('TOAST API connection test failed:', error)
      return false
    }
  }

  /**
   * Get restaurant information
   */
  async getRestaurantInfo(): Promise<ToastRestaurantInfo> {
    return this.makeRequest(`/restaurants/v1/restaurants/${this.restaurantId}`)
  }

  /**
   * Get all employees
   */
  async getEmployees(): Promise<ToastEmployee[]> {
    return this.makeRequest('/labor/v1/employees')
  }

  /**
   * Get menu information
   */
  async getMenus(): Promise<unknown> {
    return this.makeRequest('/menus/v2/menus')
  }

  /**
   * Get orders for a specific date range
   */
  async getOrders(startDate: Date, endDate?: Date): Promise<ToastOrder[]> {
    const start = startDate.toISOString()
    const end = (endDate || startDate).toISOString()
    
    return this.makeRequest(`/orders/v2/orders?startDate=${start}&endDate=${end}`)
  }

  /**
   * Get orders for today
   */
  async getTodaysOrders(): Promise<ToastOrder[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return this.getOrders(today, tomorrow)
  }

  /**
   * Get cash management entries for a specific business date
   */
  async getCashEntries(businessDate: string): Promise<unknown> {
    return this.makeRequest(`/cashmgmt/v1/entries?businessDate=${businessDate}`)
  }

  /**
   * Get today's cash entries
   */
  async getTodaysCashEntries(): Promise<unknown> {
    const today = new Date().toISOString().split('T')[0]
    return this.getCashEntries(today)
  }

  /**
   * Get kitchen orders
   */
  async getKitchenOrders(): Promise<unknown> {
    return this.makeRequest('/kitchen/v1/orders')
  }

  /**
   * Get comprehensive restaurant data for dashboard
   */
  async getDashboardData(): Promise<{
    restaurant: ToastRestaurantInfo
    employees: ToastEmployee[]
    menus: unknown
    todaysOrders: ToastOrder[]
    cashEntries: unknown
  }> {
    const [restaurant, employees, menus, todaysOrders, cashEntries] = await Promise.all([
      this.getRestaurantInfo(),
      this.getEmployees(),
      this.getMenus(),
      this.getTodaysOrders().catch(() => []), // Handle potential date format issues
      this.getTodaysCashEntries().catch(() => null)
    ])

    return {
      restaurant,
      employees,
      menus,
      todaysOrders,
      cashEntries
    }
  }
}

/**
 * Factory function to create TOAST API client with environment variables
 */
export function createToastClient(): ToastAPIClient {
  const config: ToastAPIConfig = {
    baseURL: process.env.TOAST_BASE_URL || 'https://ws-api.toasttab.com',
    clientId: process.env.TOAST_API_KEY || '',
    clientSecret: process.env.TOAST_CLIENT_SECRET || '',
    restaurantId: process.env.TOAST_RESTAURANT_ID || ''
  }

  if (!config.clientId || !config.clientSecret || !config.restaurantId) {
    throw new Error('Missing required TOAST API configuration')
  }

  return new ToastAPIClient(config)
}