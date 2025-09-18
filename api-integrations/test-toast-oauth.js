#!/usr/bin/env node

/**
 * Simple TOAST OAuth Test
 * Tests the actual TOAST authentication flow
 */

const fs = require('fs')
const path = require('path')

// Load environment variables
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
}

async function testToastOAuth() {
  console.log('🔧 Testing TOAST Official Authentication Flow')
  console.log('===============================================')
  
  const clientId = process.env.TOAST_API_KEY
  const clientSecret = process.env.TOAST_CLIENT_SECRET
  const restaurantId = process.env.TOAST_RESTAURANT_ID
  
  console.log(`Client ID: ${clientId}`)
  console.log(`Restaurant ID: ${restaurantId}`)
  console.log(`Secret: ${clientSecret ? `${clientSecret.substring(0, 8)}...` : 'Missing'}`)
  
  if (!clientId || !clientSecret || !restaurantId) {
    console.log('❌ Missing required credentials')
    return false
  }
  
  try {
    // Step 1: Get authentication token using official TOAST method
    console.log('\n📝 Step 1: Getting authentication token from TOAST...')
    
    // Try different hostnames - TOAST uses different endpoints
    const hostnames = [
      'api.toasttab.com',           // Standard production
      'ws-api.toasttab.com',        // WebSocket API (your base URL)
      'partners-api.toasttab.com'   // Partners API
    ]
    
    let authToken = null
    let workingHostname = null
    
    for (const hostname of hostnames) {
      const authUrl = `https://${hostname}/authentication/v1/authentication/login`
      console.log(`\nTrying: ${authUrl}`)
      
      const authPayload = {
        "clientId": clientId,
        "clientSecret": clientSecret,
        "userAccessType": "TOAST_MACHINE_CLIENT"
      }
      
      const authResponse = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(authPayload)
      })
      
      console.log(`Response status: ${authResponse.status}`)
      
      if (authResponse.ok) {
        const authData = await authResponse.json()
        
        if (authData.status === 'SUCCESS' && authData.token) {
          authToken = authData.token.accessToken
          workingHostname = hostname
          
          console.log('✅ Authentication successful!')
          console.log(`Token type: ${authData.token.tokenType}`)
          console.log(`Expires in: ${authData.token.expiresIn} seconds`)
          console.log(`Token preview: ${authToken.substring(0, 50)}...`)
          break
        } else {
          console.log(`❌ Unexpected response format: ${JSON.stringify(authData).substring(0, 200)}...`)
        }
      } else {
        const errorText = await authResponse.text()
        console.log(`❌ Failed: ${errorText.substring(0, 200)}...`)
      }
    }
    
    if (!authToken) {
      console.log('\n❌ All authentication endpoints failed')
      return false
    }
    
    // Step 2: Test API call with the authentication token
    console.log('\n📡 Step 2: Testing API call with authentication token...')
    
    // Try to get restaurant configuration or employees
    const testEndpoints = [
      `/config/v1/restaurants`,
      `/labor/v1/employees`,
      `/menus/v2/menus`
    ]
    
    let apiSuccess = false
    
    for (const endpoint of testEndpoints) {
      const apiUrl = `https://${workingHostname}${endpoint}`
      console.log(`\nTesting: ${apiUrl}`)
      
      const apiResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Toast-Restaurant-External-ID': restaurantId,
          'Content-Type': 'application/json'
        }
      })
      
      console.log(`API response status: ${apiResponse.status}`)
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        console.log(`✅ API call successful!`)
        console.log(`Endpoint: ${endpoint}`)
        console.log(`Data preview: ${JSON.stringify(apiData).substring(0, 300)}...`)
        apiSuccess = true
        break
      } else {
        const errorText = await apiResponse.text()
        console.log(`❌ API call failed: ${errorText.substring(0, 200)}...`)
      }
    }
    
    if (apiSuccess) {
      console.log('\n🎉 TOAST API integration fully working!')
      console.log(`Working hostname: ${workingHostname}`)
      console.log(`Authentication: ✅`)
      console.log(`API Access: ✅`)
      return true
    } else {
      console.log('\n⚠️  Authentication works but API calls are failing')
      console.log('This might be due to API scopes or restaurant access permissions')
      return false
    }
    
  } catch (error) {
    console.log(`❌ Test error: ${error.message}`)
    return false
  }
}
    
    // Step 2: Test API call with token
    console.log('\n📡 Step 2: Testing API call with access token...')
    
    const restaurantId = process.env.TOAST_RESTAURANT_ID
    console.log(`Restaurant ID: ${restaurantId}`)
    
    if (!restaurantId) {
      console.log('❌ Missing restaurant ID')
      return false
    }
    
    // Try to get restaurant configuration
    const apiResponse = await fetch(`${baseUrl}/config/v1/restaurants`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Toast-Restaurant-External-ID': restaurantId,
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`API response status: ${apiResponse.status}`)
    
    if (apiResponse.ok) {
      const apiData = await apiResponse.json()
      console.log('✅ TOAST API connection successful!')
      console.log(`Restaurant data: ${JSON.stringify(apiData, null, 2)}`)
      return true
    } else {
      const errorText = await apiResponse.text()
      console.log(`❌ API call failed: ${errorText}`)
      return false
    }
    
  } catch (error) {
    console.log(`❌ OAuth test error: ${error.message}`)
    return false
  }
}

// Run the test
testToastOAuth().then(success => {
  console.log('\n' + '='.repeat(60))
  if (success) {
    console.log('🎉 TOAST OAuth integration working!')
    console.log('Ready to implement full TOAST API integration.')
  } else {
    console.log('❌ TOAST OAuth test failed.')
    console.log('Check your credentials or contact TOAST support.')
  }
  process.exit(success ? 0 : 1)
})