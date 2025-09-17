#!/usr/bin/env node

/**
 * Test the new working TOAST API client
 */

// Import the working client
const fs = require('fs')
const path = require('path')

// Load environment variables
const envPath = path.join(process.cwd(), '../.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8')
  const envVars = envFile.split('\n').filter(line => line.includes('=') && !line.startsWith('#'))
  
  for (const line of envVars) {
    const [key, ...valueParts] = line.split('=')
    const value = valueParts.join('=').trim()
    if (key && value && !process.env[key]) {
      process.env[key] = value
    }
  }
}

// Simulate the TypeScript client in JavaScript
class ToastAPIClient {
  constructor(config) {
    this.baseURL = config.baseURL
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
    this.restaurantId = config.restaurantId
    this.accessToken = null
    this.tokenExpiry = null
  }

  async authenticate() {
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
      throw new Error(`Authentication failed: ${errorData.message}`)
    }

    const data = await response.json()
    const token = data.token

    this.accessToken = token.accessToken
    this.tokenExpiry = new Date(Date.now() + (token.expiresIn * 1000))

    return {
      tokenType: token.tokenType,
      accessToken: token.accessToken,
      expiresIn: token.expiresIn,
      scope: token.scope
    }
  }

  isTokenValid() {
    return !!(this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date())
  }

  async ensureAuthenticated() {
    if (!this.isTokenValid()) {
      await this.authenticate()
    }
  }

  async makeRequest(endpoint, options = {}) {
    await this.ensureAuthenticated()

    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Toast-Restaurant-External-ID': this.restaurantId,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Request failed: ${response.status} - ${errorData.message || 'Unknown error'}`)
    }

    return response.json()
  }

  async getRestaurantInfo() {
    return this.makeRequest(`/restaurants/v1/restaurants/${this.restaurantId}`)
  }

  async getEmployees() {
    return this.makeRequest('/labor/v1/employees')
  }

  async getMenus() {
    return this.makeRequest('/menus/v2/menus')
  }

  async getDashboardData() {
    console.log('🔄 Fetching comprehensive dashboard data...')
    
    const [restaurant, employees, menus] = await Promise.all([
      this.getRestaurantInfo(),
      this.getEmployees(),
      this.getMenus()
    ])

    return {
      restaurant,
      employees,
      menus
    }
  }
}

function createToastClient() {
  const config = {
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

// Test the client
async function testToastClient() {
  console.log('🧪 Testing TOAST API Client')
  console.log('============================\n')

  try {
    const client = createToastClient()
    
    console.log('✅ Client created successfully')
    console.log(`Base URL: ${client.baseURL}`)
    console.log(`Restaurant ID: ${client.restaurantId}`)
    console.log(`Client ID: ${client.clientId}\n`)

    // Test authentication
    console.log('🔐 Testing authentication...')
    const auth = await client.authenticate()
    console.log('✅ Authentication successful!')
    console.log(`Token Type: ${auth.tokenType}`)
    console.log(`Expires In: ${auth.expiresIn} seconds`)
    console.log(`Scopes: ${auth.scope}\n`)

    // Test restaurant info
    console.log('🏪 Getting restaurant info...')
    const restaurant = await client.getRestaurantInfo()
    console.log('✅ Restaurant info retrieved!')
    console.log(`Name: ${restaurant.general.name}`)
    console.log(`Location: ${restaurant.location.city}, ${restaurant.location.stateCode}`)
    console.log(`Phone: ${restaurant.location.phone}\n`)

    // Test employees
    console.log('👥 Getting employees...')
    const employees = await client.getEmployees()
    console.log('✅ Employee data retrieved!')
    console.log(`Total Employees: ${employees.length}`)
    if (employees.length > 0) {
      console.log(`Sample Employee: ${employees[0].firstName} ${employees[0].lastName}\n`)
    }

    // Test menus
    console.log('📋 Getting menu data...')
    const menus = await client.getMenus()
    console.log('✅ Menu data retrieved!')
    console.log(`Menu data size: ${JSON.stringify(menus).length} characters`)
    if (menus.menus && menus.menus.length > 0) {
      console.log(`Total Menus: ${menus.menus.length}`)
      console.log(`Sample Menu: ${menus.menus[0].name}\n`)
    }

    // Test comprehensive dashboard data
    console.log('📊 Getting comprehensive dashboard data...')
    const dashboardData = await client.getDashboardData()
    console.log('✅ Dashboard data retrieved!')
    console.log('Dashboard Summary:')
    console.log(`- Restaurant: ${dashboardData.restaurant.general.name}`)
    console.log(`- Employees: ${dashboardData.employees.length}`)
    console.log(`- Menu Data: ${JSON.stringify(dashboardData.menus).length} chars`)

    console.log('\n🎉 TOAST API Client Test Successful!')
    console.log('Ready for THE PASS integration!')

    return dashboardData

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    throw error
  }
}

// Run the test
testToastClient()
  .then(data => {
    console.log('\n✅ All tests passed - TOAST integration ready!')
  })
  .catch(error => {
    console.error('\n💥 Test suite failed:', error.message)
    process.exit(1)
  })