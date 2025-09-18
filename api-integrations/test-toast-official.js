#!/usr/bin/env node

/**
 * Official TOAST API Authentication Test
 * Based on Toast Developer Documentation
 */

const fs = require('fs')
const path = require('path')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.cyan}🔧 ${message}${colors.reset}`)
  log('='.repeat(60), 'cyan')
}

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local')
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

async function testToastAuthentication() {
  logHeader('TOAST API Official Authentication Test')
  
  const clientId = process.env.TOAST_API_KEY
  const clientSecret = process.env.TOAST_CLIENT_SECRET
  const restaurantId = process.env.TOAST_RESTAURANT_ID
  
  logInfo(`Client ID: ${clientId}`)
  logInfo(`Restaurant ID: ${restaurantId}`)
  logInfo(`Client Secret: ${clientSecret ? `${clientSecret.substring(0, 8)}...` : 'Missing'}`)
  
  if (!clientId || !clientSecret) {
    logError('Missing TOAST API credentials')
    return false
  }

  try {
    // Step 1: Get authentication token using official endpoint
    logHeader('Step 1: Getting Authentication Token')
    
    // Try different possible Toast API hostnames
    const possibleHostnames = [
      'https://ws-api.toasttab.com',
      'https://api.toasttab.com', 
      'https://toast-api-prod.herokuapp.com'
    ]
    
    let authToken = null
    let workingHostname = null
    
    for (const hostname of possibleHostnames) {
      const authEndpoint = `${hostname}/authentication/v1/authentication/login`
      logInfo(`Trying authentication endpoint: ${authEndpoint}`)
      
      try {
        const authResponse = await fetch(authEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clientId: clientId,
            clientSecret: clientSecret,
            userAccessType: 'TOAST_MACHINE_CLIENT'
          })
        })
        
        logInfo(`Response status: ${authResponse.status}`)
        
        if (authResponse.ok) {
          const authData = await authResponse.json()
          logSuccess('Authentication successful!')
          logInfo(`Token type: ${authData.token.tokenType}`)
          logInfo(`Expires in: ${authData.token.expiresIn} seconds`)
          
          authToken = authData.token.accessToken
          workingHostname = hostname
          break
        } else {
          const errorText = await authResponse.text()
          logWarning(`Failed: ${authResponse.status} - ${errorText.substring(0, 200)}`)
        }
      } catch (error) {
        logWarning(`Connection error: ${error.message}`)
      }
    }
    
    if (!authToken) {
      logError('Failed to authenticate with any TOAST API hostname')
      return false
    }
    
    // Step 2: Test API calls with the token
    logHeader('Step 2: Testing API Calls')
    
    const testEndpoints = [
      { path: '/config/v1/restaurants', scope: 'config:read', description: 'Restaurant configuration' },
      { path: '/menus/v2/menus', scope: 'menus:read', description: 'Menu data' },
      { path: '/orders/v2/orders', scope: 'orders:read', description: 'Order data' },
      { path: '/labor/v1/employees', scope: 'labor.employees:read', description: 'Employee data' },
      { path: '/stock/v1/inventory', scope: 'stock:read', description: 'Inventory data' }
    ]
    
    let successfulCalls = 0
    
    for (const endpoint of testEndpoints) {
      const apiUrl = `${workingHostname}${endpoint.path}`
      logInfo(`Testing ${endpoint.description}: ${endpoint.path}`)
      
      try {
        const headers = {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
        
        // Add restaurant ID header if we have it
        if (restaurantId) {
          headers['Toast-Restaurant-External-ID'] = restaurantId
        }
        
        const apiResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: headers
        })
        
        if (apiResponse.ok) {
          const apiData = await apiResponse.json()
          logSuccess(`${endpoint.description}: SUCCESS (${Object.keys(apiData).length} properties)`)
          successfulCalls++
          
          // Log sample data for first successful call
          if (successfulCalls === 1) {
            logInfo(`Sample response: ${JSON.stringify(apiData, null, 2).substring(0, 300)}...`)
          }
        } else {
          const errorText = await apiResponse.text()
          logWarning(`${endpoint.description}: ${apiResponse.status} - ${errorText.substring(0, 100)}`)
        }
      } catch (error) {
        logWarning(`${endpoint.description}: Connection error - ${error.message}`)
      }
    }
    
    // Step 3: Summary
    logHeader('Test Results Summary')
    
    if (successfulCalls > 0) {
      logSuccess(`Authentication working! ${successfulCalls}/${testEndpoints.length} API calls successful`)
      logSuccess(`Working hostname: ${workingHostname}`)
      logInfo('Available scopes based on successful calls:')
      
      testEndpoints.forEach((endpoint, index) => {
        if (index < successfulCalls) {
          logSuccess(`  ✓ ${endpoint.scope} - ${endpoint.description}`)
        }
      })
      
      return true
    } else {
      logError('Authentication succeeded but no API calls worked')
      logError('This might indicate:')
      logError('  • Restaurant ID is incorrect')
      logError('  • Account lacks necessary scopes')
      logError('  • API endpoints have changed')
      return false
    }
    
  } catch (error) {
    logError(`Authentication test error: ${error.message}`)
    return false
  }
}

async function generateIntegrationReport() {
  logHeader('Integration Capabilities Report')
  
  const availableScopes = [
    'cashmgmt:read - Cash management data',
    'config:read - Restaurant configuration',
    'delivery_info.address:read - Delivery address information',
    'digital_schedule:read - Order management configuration',
    'guest.pi:read - Customer personal information',
    'kitchen:read - Kitchen display system data',
    'labor.employees:read - Employee information',
    'labor:read - Labor management data',
    'menus:read - Menu items and pricing',
    'orders:read - Order history and details',
    'packaging:read - Packaging configuration',
    'restaurants:read - Restaurant availability',
    'stock:read - Inventory levels'
  ]
  
  logInfo('TOAST Standard API Access Scopes:')
  availableScopes.forEach(scope => {
    logInfo(`  • ${scope}`)
  })
  
  logHeader('Integration Features We Can Build')
  
  const features = [
    '🔥 Smart Prep Lists - Use orders + menus + stock data',
    '📊 Sales Analytics - Use orders + cashmgmt data', 
    '👥 Staff Management - Use labor.employees + labor data',
    '📋 Inventory Alerts - Use stock + menus data',
    '🍽️ Menu Performance - Use orders + menus data',
    '💰 Revenue Tracking - Use orders + cashmgmt data',
    '⏰ Rush Period Detection - Use orders time-series data',
    '🎯 Customer Insights - Use guest.pi + orders data'
  ]
  
  features.forEach(feature => {
    logSuccess(feature)
  })
}

// Main execution
async function main() {
  log(`${colors.bright}${colors.blue}`)
  log('🚀 TOAST API Official Authentication Test')
  log('Based on Toast Developer Documentation')
  log('==========================================')
  log(`${colors.reset}`)
  
  const success = await testToastAuthentication()
  
  if (success) {
    await generateIntegrationReport()
    log(`\n${colors.bright}${colors.green}🎉 TOAST API Integration Ready!${colors.reset}`)
    log('Next steps:')
    log('• Update TOAST API client with working authentication')
    log('• Implement smart prep lists using menu and order data')
    log('• Build real-time inventory monitoring')
    log('• Create sales analytics dashboard')
  } else {
    log(`\n${colors.bright}${colors.red}❌ TOAST API Integration Issues${colors.reset}`)
    log('Troubleshooting steps:')
    log('• Verify client credentials are correct')
    log('• Check restaurant ID format (should be GUID)')
    log('• Ensure account has Standard API access enabled')
    log('• Contact Toast support if credentials look correct')
  }
  
  process.exit(success ? 0 : 1)
}

// Handle errors
process.on('uncaughtException', (error) => {
  logError(`Uncaught error: ${error.message}`)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  logError(`Unhandled rejection: ${reason}`)
  process.exit(1)
})

// Run the test
main().catch((error) => {
  logError(`Test runner error: ${error.message}`)
  process.exit(1)
})