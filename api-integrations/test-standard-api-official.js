#!/usr/bin/env node

/**
 * TOAST Standard API Authentication - Exact Documentation Implementation
 * Following the official TOAST Standard API documentation exactly
 */

const fs = require('fs')
const path = require('path')

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

async function testStandardApiAuth() {
  console.log('🔐 TOAST Standard API Authentication - Official Documentation Method')
  console.log('===================================================================\n')
  
  const clientId = process.env.TOAST_API_KEY
  const clientSecret = process.env.TOAST_CLIENT_SECRET
  const restaurantId = process.env.TOAST_RESTAURANT_ID
  
  console.log(`Client ID: ${clientId}`)
  console.log(`Restaurant ID: ${restaurantId}`)
  console.log(`Secret: ${clientSecret ? `${clientSecret.substring(0, 8)}...` : 'Missing'}`)
  console.log(`API Hostname: https://ws-api.toasttab.com`)
  console.log(`User Access Type: TOAST_MACHINE_CLIENT\n`)
  
  // EXACT method from TOAST Standard API documentation
  const authUrl = 'https://ws-api.toasttab.com/authentication/v1/authentication/login'
  
  console.log('🚀 Testing Standard API Authentication (Documentation Method)')
  console.log(`POST ${authUrl}`)
  console.log('Headers:')
  console.log('  Content-Type: application/json')
  console.log(`  Toast-Restaurant-External-ID: ${restaurantId}`)
  
  const requestBody = {
    clientId: clientId,
    clientSecret: clientSecret,
    userAccessType: 'TOAST_MACHINE_CLIENT'
  }
  
  console.log('\nRequest Body:')
  console.log(JSON.stringify({
    clientId: clientId,
    clientSecret: `${clientSecret.substring(0, 8)}...`,
    userAccessType: 'TOAST_MACHINE_CLIENT'
  }, null, 2))
  
  try {
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Toast-Restaurant-External-ID': restaurantId
      },
      body: JSON.stringify(requestBody)
    })
    
    console.log(`\n📥 Response Status: ${response.status}`)
    console.log('Response Headers:')
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`)
    }
    
    const responseText = await response.text()
    console.log('\n📄 Response Body:')
    console.log(responseText)
    
    if (response.ok) {
      console.log('\n✅ AUTHENTICATION SUCCESSFUL!')
      
      try {
        const data = JSON.parse(responseText)
        
        if (data.token && data.token.accessToken) {
          console.log('\n🎉 ACCESS TOKEN RECEIVED!')
          console.log(`Token Type: ${data.token.tokenType}`)
          console.log(`Expires In: ${data.token.expiresIn} seconds`)
          console.log(`Access Token: ${data.token.accessToken.substring(0, 50)}...`)
          
          // Test API calls with the token
          await testAllApiEndpoints(data.token.accessToken, restaurantId)
          
          return {
            success: true,
            token: data.token,
            method: 'Standard API Documentation Method'
          }
        } else {
          console.log('❌ Token not found in response')
        }
        
      } catch (parseError) {
        console.log(`❌ Could not parse response as JSON: ${parseError.message}`)
      }
      
    } else {
      console.log('\n❌ AUTHENTICATION FAILED')
      
      try {
        const errorData = JSON.parse(responseText)
        console.log('\n🔍 Error Analysis:')
        console.log(`Status: ${errorData.status}`)
        console.log(`Code: ${errorData.code}`)
        console.log(`Message: ${errorData.message}`)
        console.log(`Request ID: ${errorData.requestId}`)
        
        if (errorData.error) {
          console.log(`Error Type: ${errorData.error}`)
        }
        if (errorData.error_description) {
          console.log(`Description: ${errorData.error_description}`)
        }
        
        // Provide specific guidance based on error code
        switch (errorData.code) {
          case 10010:
            console.log('\n💡 Error 10010 Troubleshooting:')
            console.log('• Verify credentials are activated in Toast Web')
            console.log('• Check restaurant has required subscription level')
            console.log('• Confirm location access in credential configuration')
            console.log('• Verify restaurant GUID matches credential settings')
            break
          case 10013:
            console.log('\n💡 Error 10013 Troubleshooting:')
            console.log('• Full authentication required')
            console.log('• May need different authentication flow')
            console.log('• Check if credentials are for different API type')
            break
          default:
            console.log(`\n💡 Error ${errorData.code} - Check TOAST documentation`)
        }
        
      } catch (parseError) {
        console.log('Could not parse error response as JSON')
      }
    }
    
  } catch (networkError) {
    console.log(`\n❌ Network Error: ${networkError.message}`)
  }
  
  return { success: false }
}

async function testAllApiEndpoints(accessToken, restaurantId) {
  console.log('\n🧪 Testing API Endpoints with Token')
  console.log('====================================')
  
  const apiTests = [
    {
      name: 'Restaurant Configuration',
      url: `https://ws-api.toasttab.com/config/v1/restaurants/${restaurantId}`,
      method: 'GET'
    },
    {
      name: 'Menu Information',
      url: `https://ws-api.toasttab.com/menus/v2/menus`,
      method: 'GET'
    },
    {
      name: 'Orders Data',
      url: `https://ws-api.toasttab.com/orders/v2/orders`,
      method: 'GET'
    },
    {
      name: 'Labor/Employees',
      url: `https://ws-api.toasttab.com/labor/v1/employees`,
      method: 'GET'
    },
    {
      name: 'Stock/Inventory',
      url: `https://ws-api.toasttab.com/stock/v1/items`,
      method: 'GET'
    }
  ]
  
  for (const test of apiTests) {
    console.log(`\n📡 Testing: ${test.name}`)
    console.log(`${test.method} ${test.url}`)
    
    try {
      const response = await fetch(test.url, {
        method: test.method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Toast-Restaurant-External-ID': restaurantId,
          'Content-Type': 'application/json'
        }
      })
      
      console.log(`Status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.text()
        console.log(`✅ Success! Data length: ${data.length} characters`)
        
        try {
          const jsonData = JSON.parse(data)
          if (Array.isArray(jsonData)) {
            console.log(`📊 Array with ${jsonData.length} items`)
          } else if (jsonData.restaurantName) {
            console.log(`🏪 Restaurant: ${jsonData.restaurantName}`)
          } else if (jsonData.name) {
            console.log(`📋 Name: ${jsonData.name}`)
          }
        } catch (e) {
          console.log('Response is not JSON format')
        }
        
      } else {
        const errorText = await response.text()
        console.log(`❌ Failed: ${errorText.substring(0, 100)}...`)
      }
      
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`)
    }
  }
}

// Main execution
console.log('Starting TOAST Standard API Authentication Test...\n')

testStandardApiAuth()
  .then(result => {
    if (result.success) {
      console.log('\n🎯 TOAST INTEGRATION SUCCESS!')
      console.log('==========================================')
      console.log(`✅ Authentication Method: ${result.method}`)
      console.log(`✅ Token Type: ${result.token.tokenType}`)
      console.log(`✅ Token Valid For: ${result.token.expiresIn} seconds`)
      console.log('\n🚀 Ready to implement full TOAST integration!')
    } else {
      console.log('\n🔧 Authentication still needs resolution')
      console.log('Next steps:')
      console.log('1. Verify credential activation in Toast Web')
      console.log('2. Check restaurant subscription level')
      console.log('3. Contact TOAST support if needed')
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected Error:', error.message)
  })