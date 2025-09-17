#!/usr/bin/env node

/**
 * API Integration Connection Test Utility
 * Tests TOAST and Homebase API connections and validates configuration
 */

// Add TypeScript support for Node.js
require('ts-node/register')

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

async function testEnvironmentConfiguration() {
  logHeader('Testing Environment Configuration')

  const requiredVars = [
    'TOAST_API_KEY',
    'TOAST_RESTAURANT_ID',
    'HOMEBASE_API_KEY',
    'HOMEBASE_COMPANY_ID'
  ]

  const optionalVars = [
    'TOAST_BASE_URL',
    'HOMEBASE_BASE_URL',
    'ENABLE_TOAST_INTEGRATION',
    'ENABLE_HOMEBASE_INTEGRATION'
  ]

  let allConfigured = true

  // Check required variables
  logInfo('Checking required environment variables...')
  for (const varName of requiredVars) {
    const value = process.env[varName]
    if (value) {
      logSuccess(`${varName}: Configured (${value.length} characters)`)
    } else {
      logError(`${varName}: Missing or empty`)
      allConfigured = false
    }
  }

  // Check optional variables
  logInfo('\nChecking optional environment variables...')
  for (const varName of optionalVars) {
    const value = process.env[varName]
    if (value) {
      logSuccess(`${varName}: ${value}`)
    } else {
      logWarning(`${varName}: Using default value`)
    }
  }

  return allConfigured
}

async function testToastConnection() {
  logHeader('Testing TOAST API Connection')

  if (!process.env.TOAST_API_KEY || !process.env.TOAST_RESTAURANT_ID) {
    logError('TOAST API credentials not configured')
    return false
  }

  try {
    logInfo('Attempting to connect to TOAST API...')
    
    // Simple fetch test to TOAST API
    const response = await fetch('https://api.toasttab.com/config/v1/restaurants', {
      headers: {
        'Authorization': `Bearer ${process.env.TOAST_API_KEY}`,
        'Toast-Restaurant-External-ID': process.env.TOAST_RESTAURANT_ID,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      logSuccess('TOAST API connection successful')
      logInfo(`Response status: ${response.status}`)
      return true
    } else {
      logError(`TOAST API connection failed: ${response.status} ${response.statusText}`)
      
      if (response.status === 401) {
        logError('Authentication failed - check your API key')
      } else if (response.status === 404) {
        logError('Restaurant not found - check your restaurant ID')
      }
      
      return false
    }
  } catch (error) {
    logError(`TOAST API connection error: ${error.message}`)
    return false
  }
}

async function testHomebaseConnection() {
  logHeader('Testing Homebase API Connection')

  if (!process.env.HOMEBASE_API_KEY || !process.env.HOMEBASE_COMPANY_ID) {
    logError('Homebase API credentials not configured')
    return false
  }

  try {
    logInfo('Attempting to connect to Homebase API...')
    
    // Simple fetch test to Homebase API
    const response = await fetch('https://api.joinhomebase.com/v1/companies/current', {
      headers: {
        'Authorization': `Bearer ${process.env.HOMEBASE_API_KEY}`,
        'X-Company-Id': process.env.HOMEBASE_COMPANY_ID,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      logSuccess('Homebase API connection successful')
      logInfo(`Response status: ${response.status}`)
      return true
    } else {
      logError(`Homebase API connection failed: ${response.status} ${response.statusText}`)
      
      if (response.status === 401) {
        logError('Authentication failed - check your API key')
      } else if (response.status === 404) {
        logError('Company not found - check your company ID')
      }
      
      return false
    }
  } catch (error) {
    logError(`Homebase API connection error: ${error.message}`)
    return false
  }
}

async function testSampleDataRetrieval() {
  logHeader('Testing Sample Data Retrieval')

  let testsSuccessful = 0
  let totalTests = 0

  // Test TOAST data retrieval
  if (process.env.TOAST_API_KEY && process.env.TOAST_RESTAURANT_ID) {
    totalTests += 2

    // Test sales data
    try {
      logInfo('Testing TOAST sales data retrieval...')
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`https://api.toasttab.com/reporting/v1/reports?reportType=SALES_SUMMARY&businessDate=${today}`, {
        headers: {
          'Authorization': `Bearer ${process.env.TOAST_API_KEY}`,
          'Toast-Restaurant-External-ID': process.env.TOAST_RESTAURANT_ID
        }
      })

      if (response.ok) {
        const data = await response.json()
        logSuccess(`TOAST sales data retrieved (${JSON.stringify(data).length} bytes)`)
        testsSuccessful++
      } else {
        logWarning(`TOAST sales data: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      logWarning(`TOAST sales data error: ${error.message}`)
    }

    // Test menu data
    try {
      logInfo('Testing TOAST menu data retrieval...')
      const response = await fetch('https://api.toasttab.com/menus/v2/menus', {
        headers: {
          'Authorization': `Bearer ${process.env.TOAST_API_KEY}`,
          'Toast-Restaurant-External-ID': process.env.TOAST_RESTAURANT_ID
        }
      })

      if (response.ok) {
        const data = await response.json()
        logSuccess(`TOAST menu data retrieved (${JSON.stringify(data).length} bytes)`)
        testsSuccessful++
      } else {
        logWarning(`TOAST menu data: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      logWarning(`TOAST menu data error: ${error.message}`)
    }
  }

  // Test Homebase data retrieval
  if (process.env.HOMEBASE_API_KEY && process.env.HOMEBASE_COMPANY_ID) {
    totalTests += 2

    // Test employee data
    try {
      logInfo('Testing Homebase employee data retrieval...')
      const response = await fetch('https://api.joinhomebase.com/v1/employees', {
        headers: {
          'Authorization': `Bearer ${process.env.HOMEBASE_API_KEY}`,
          'X-Company-Id': process.env.HOMEBASE_COMPANY_ID
        }
      })

      if (response.ok) {
        const data = await response.json()
        logSuccess(`Homebase employee data retrieved (${JSON.stringify(data).length} bytes)`)
        testsSuccessful++
      } else {
        logWarning(`Homebase employee data: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      logWarning(`Homebase employee data error: ${error.message}`)
    }

    // Test schedule data
    try {
      logInfo('Testing Homebase schedule data retrieval...')
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`https://api.joinhomebase.com/v1/schedules?start_date=${today}&end_date=${today}`, {
        headers: {
          'Authorization': `Bearer ${process.env.HOMEBASE_API_KEY}`,
          'X-Company-Id': process.env.HOMEBASE_COMPANY_ID
        }
      })

      if (response.ok) {
        const data = await response.json()
        logSuccess(`Homebase schedule data retrieved (${JSON.stringify(data).length} bytes)`)
        testsSuccessful++
      } else {
        logWarning(`Homebase schedule data: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      logWarning(`Homebase schedule data error: ${error.message}`)
    }
  }

  logInfo(`Data retrieval tests: ${testsSuccessful}/${totalTests} successful`)
  return testsSuccessful === totalTests
}

async function generateConfigurationReport() {
  logHeader('Configuration Report')

  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    configuration: {
      toast: {
        enabled: process.env.ENABLE_TOAST_INTEGRATION !== 'false',
        apiKeyConfigured: !!process.env.TOAST_API_KEY,
        restaurantIdConfigured: !!process.env.TOAST_RESTAURANT_ID,
        baseUrl: process.env.TOAST_BASE_URL || 'https://api.toasttab.com'
      },
      homebase: {
        enabled: process.env.ENABLE_HOMEBASE_INTEGRATION !== 'false',
        apiKeyConfigured: !!process.env.HOMEBASE_API_KEY,
        companyIdConfigured: !!process.env.HOMEBASE_COMPANY_ID,
        baseUrl: process.env.HOMEBASE_BASE_URL || 'https://api.joinhomebase.com'
      },
      features: {
        smartPrepLists: process.env.ENABLE_SMART_PREP_LISTS !== 'false',
        intelligentTaskAssignment: process.env.ENABLE_INTELLIGENT_TASK_ASSIGNMENT !== 'false',
        rushPeriodDetection: process.env.ENABLE_RUSH_PERIOD_DETECTION !== 'false',
        automatedWorkflows: process.env.ENABLE_AUTOMATED_WORKFLOWS !== 'false'
      }
    }
  }

  const reportPath = path.join(process.cwd(), 'integration-test-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  logSuccess(`Configuration report generated: ${reportPath}`)
  return report
}

async function main() {
  log(`${colors.bright}${colors.blue}`)
  log('🚀 THE PASS API Integration Connection Test')
  log('==========================================')
  log(`${colors.reset}`)

  // Load environment variables from .env.local if it exists
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8')
    const envVars = envFile.split('\n').filter(line => line.includes('='))
    
    for (const line of envVars) {
      const [key, ...valueParts] = line.split('=')
      const value = valueParts.join('=').trim()
      if (key && value && !process.env[key]) {
        process.env[key] = value
      }
    }
    logInfo(`Loaded environment variables from ${envPath}`)
  } else {
    logWarning(`No .env.local file found at ${envPath}`)
  }

  let allTestsPassed = true

  // Run tests
  const configOk = await testEnvironmentConfiguration()
  allTestsPassed = allTestsPassed && configOk

  const toastOk = await testToastConnection()
  allTestsPassed = allTestsPassed && toastOk

  const homebaseOk = await testHomebaseConnection()
  allTestsPassed = allTestsPassed && homebaseOk

  const dataOk = await testSampleDataRetrieval()
  allTestsPassed = allTestsPassed && dataOk

  // Generate report
  await generateConfigurationReport()

  // Final summary
  logHeader('Test Summary')
  
  if (allTestsPassed) {
    logSuccess('All tests passed! ✨')
    logSuccess('THE PASS API integrations are ready to use!')
  } else {
    logError('Some tests failed. Please check the errors above.')
    logInfo('See API_CONFIGURATION.md for setup instructions.')
  }

  log(`\n${colors.bright}Next Steps:${colors.reset}`)
  if (allTestsPassed) {
    log('• Start THE PASS application')
    log('• Check the integration status in the manager dashboard')
    log('• Test smart prep lists and intelligent task assignment')
  } else {
    log('• Review the API_CONFIGURATION.md file')
    log('• Set up missing environment variables in .env.local')
    log('• Contact API providers for credential issues')
    log('• Re-run this test: npm run test:integrations')
  }

  process.exit(allTestsPassed ? 0 : 1)
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logError(`Uncaught error: ${error.message}`)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  logError(`Unhandled rejection: ${reason}`)
  process.exit(1)
})

// Run the main function
main().catch((error) => {
  logError(`Test runner error: ${error.message}`)
  process.exit(1)
})