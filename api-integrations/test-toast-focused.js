#!/usr/bin/env node

/**
 * TOAST API Authentication Test - Focused approach
 * Testing exact authentication flow with confirmed details
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

async function testToastAuthentication() {
  console.log('🔐 TOAST API Authentication Test')
  console.log('================================\n')
  
  const clientId = process.env.TOAST_API_KEY
  const clientSecret = process.env.TOAST_CLIENT_SECRET
  const restaurantId = process.env.TOAST_RESTAURANT_ID
  
  console.log('Credentials:')
  console.log(`✓ API Hostname: https://ws-api.toasttab.com`)
  console.log(`✓ User Access Type: TOAST_MACHINE_CLIENT`)
  console.log(`✓ Client ID: ${clientId}`)
  console.log(`✓ Restaurant ID: ${restaurantId}`)
  console.log(`✓ Credential Name: EODWEBAPP`)
  console.log(`✓ API Scopes: 13 scopes configured\n`)
  
  const authUrl = 'https://ws-api.toasttab.com/authentication/v1/authentication/login'
  
  console.log('🚀 Testing Authentication...')
  console.log(`POST ${authUrl}`)
  
  const authPayload = {
    clientId: clientId,
    clientSecret: clientSecret,
    userAccessType: 'TOAST_MACHINE_CLIENT'
  }
  
  console.log('Request payload:')
  console.log(JSON.stringify({
    clientId: clientId,
    clientSecret: clientSecret ? `${clientSecret.substring(0, 8)}...` : 'Missing',
    userAccessType: 'TOAST_MACHINE_CLIENT'
  }, null, 2))
  
  try {
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(authPayload)
    })
    
    console.log(`\nResponse Status: ${response.status}`)
    console.log('Response Headers:')
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`)
    }
    
    const responseText = await response.text()
    console.log('\nResponse Body:')
    console.log(responseText)
    
    if (response.ok) {
      console.log('\n✅ Authentication Successful!')
      const data = JSON.parse(responseText)
      if (data.token) {
        console.log(`Access Token: ${data.token.accessToken.substring(0, 20)}...`)
        console.log(`Token Type: ${data.token.tokenType}`)
        console.log(`Expires In: ${data.token.expiresIn} seconds`)
        
        // Test a simple API call with the token
        await testApiCall(data.token.accessToken, restaurantId)
      }
    } else {
      console.log('\n❌ Authentication Failed')
      
      // Parse error details if possible
      try {
        const errorData = JSON.parse(responseText)
        console.log('\nError Details:')
        console.log(`Code: ${errorData.code}`)
        console.log(`Message: ${errorData.message}`)
        console.log(`Status: ${errorData.status}`)
        
        if (errorData.error_description) {
          console.log(`Description: ${errorData.error_description}`)
        }
      } catch (e) {
        console.log('Could not parse error response as JSON')
      }
      
      // Provide specific troubleshooting
      if (response.status === 401) {
        console.log('\n🔍 401 Unauthorized Troubleshooting:')
        console.log('1. Verify credentials are activated in TOAST Web Dashboard')
        console.log('2. Check that API access is enabled for your restaurant')
        console.log('3. Ensure you\'re using Production credentials (not Sandbox)')
        console.log('4. Confirm the Client Secret hasn\'t been regenerated')
        console.log('5. Contact TOAST support to verify account status')
      }
    }
    
  } catch (error) {
    console.log(`\n❌ Request Failed: ${error.message}`)
  }
}

async function testApiCall(accessToken, restaurantId) {
  console.log('\n🧪 Testing API Call with Token...')
  
  // Test the simplest API call - get restaurant info
  const apiUrl = `https://ws-api.toasttab.com/config/v1/restaurants/${restaurantId}`
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Toast-Restaurant-External-ID': restaurantId
      }
    })
    
    console.log(`API Call Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API Call Successful!')
      console.log(`Restaurant Name: ${data.restaurantName || 'Unknown'}`)
      console.log(`Location Name: ${data.locationName || 'Unknown'}`)
    } else {
      const errorText = await response.text()
      console.log('❌ API Call Failed')
      console.log(`Error: ${errorText.substring(0, 200)}...`)
    }
    
  } catch (error) {
    console.log(`❌ API Call Error: ${error.message}`)
  }
}

// Main execution
testToastAuthentication().catch(console.error)