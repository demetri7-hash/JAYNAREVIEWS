#!/usr/bin/env node

/**
 * TOAST API Authentication - All Known Methods Test
 * Testing every possible authentication pattern for TOAST API
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

async function testAllAuthMethods() {
  console.log('🔐 TOAST API - ALL AUTHENTICATION METHODS TEST')
  console.log('==============================================\n')
  
  const clientId = process.env.TOAST_API_KEY
  const clientSecret = process.env.TOAST_CLIENT_SECRET
  const restaurantId = process.env.TOAST_RESTAURANT_ID
  
  console.log(`Client ID: ${clientId}`)
  console.log(`Restaurant ID: ${restaurantId}`)
  console.log(`Secret: ${clientSecret ? `${clientSecret.substring(0, 8)}...` : 'Missing'}\n`)
  
  const authMethods = [
    {
      name: 'Method 1: Standard JSON (Current)',
      test: async () => {
        const response = await fetch('https://ws-api.toasttab.com/authentication/v1/authentication/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: clientId,
            clientSecret: clientSecret,
            userAccessType: 'TOAST_MACHINE_CLIENT'
          })
        })
        return { response, method: 'JSON POST' }
      }
    },
    {
      name: 'Method 2: OAuth2 Client Credentials Grant',
      test: async () => {
        const response = await fetch('https://ws-api.toasttab.com/authentication/v1/authentication/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
          },
          body: new URLSearchParams({
            'grant_type': 'client_credentials',
            'scope': 'orders:read menus:read config:read'
          })
        })
        return { response, method: 'OAuth2 Basic Auth' }
      }
    },
    {
      name: 'Method 3: Form-Encoded Credentials',
      test: async () => {
        const response = await fetch('https://ws-api.toasttab.com/authentication/v1/authentication/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            'clientId': clientId,
            'clientSecret': clientSecret,
            'userAccessType': 'TOAST_MACHINE_CLIENT'
          })
        })
        return { response, method: 'Form-Encoded' }
      }
    },
    {
      name: 'Method 4: Legacy OAuth Token Endpoint',
      test: async () => {
        const response = await fetch('https://ws-api.toasttab.com/usermgmt/v1/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: clientId,
            clientSecret: clientSecret,
            userAccessType: 'TOAST_MACHINE_CLIENT'
          })
        })
        return { response, method: 'Legacy OAuth JSON' }
      }
    },
    {
      name: 'Method 5: Legacy OAuth with Form Data',
      test: async () => {
        const response = await fetch('https://ws-api.toasttab.com/usermgmt/v1/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            'grant_type': 'client_credentials',
            'client_id': clientId,
            'client_secret': clientSecret
          })
        })
        return { response, method: 'Legacy OAuth Form' }
      }
    },
    {
      name: 'Method 6: Partner API Authentication',
      test: async () => {
        const response = await fetch('https://ws-api.toasttab.com/authentication/v1/authentication/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: clientId,
            clientSecret: clientSecret,
            userAccessType: 'TOAST_MACHINE_CLIENT',
            restaurantExternalId: restaurantId
          })
        })
        return { response, method: 'Partner API with Restaurant ID' }
      }
    },
    {
      name: 'Method 7: Custom Headers Approach',
      test: async () => {
        const response = await fetch('https://ws-api.toasttab.com/authentication/v1/authentication/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Toast-Restaurant-External-ID': restaurantId,
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
          },
          body: JSON.stringify({
            userAccessType: 'TOAST_MACHINE_CLIENT'
          })
        })
        return { response, method: 'Custom Headers' }
      }
    },
    {
      name: 'Method 8: Standard API Access Format',
      test: async () => {
        const response = await fetch('https://ws-api.toasttab.com/authentication/v1/authentication/login', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'EODWEBAPP/1.0'
          },
          body: JSON.stringify({
            clientId: clientId,
            clientSecret: clientSecret,
            userAccessType: 'TOAST_MACHINE_CLIENT',
            grantType: 'client_credentials'
          })
        })
        return { response, method: 'Standard API with Grant Type' }
      }
    },
    {
      name: 'Method 9: Alternative Endpoint Path',
      test: async () => {
        const response = await fetch('https://ws-api.toasttab.com/authentication/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: clientId,
            clientSecret: clientSecret,
            userAccessType: 'TOAST_MACHINE_CLIENT'
          })
        })
        return { response, method: 'Alternative Path' }
      }
    },
    {
      name: 'Method 10: Direct API Access Test',
      test: async () => {
        // Try direct API call with credentials in headers
        const response = await fetch(`https://ws-api.toasttab.com/config/v1/restaurants/${restaurantId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            'Toast-Restaurant-External-ID': restaurantId,
            'Content-Type': 'application/json'
          }
        })
        return { response, method: 'Direct API with Basic Auth' }
      }
    }
  ]
  
  for (const authMethod of authMethods) {
    console.log(`\n🧪 ${authMethod.name}`)
    console.log('─'.repeat(50))
    
    try {
      const { response, method } = await authMethod.test()
      
      console.log(`Status: ${response.status}`)
      console.log(`Method: ${method}`)
      
      if (response.ok) {
        console.log('✅ SUCCESS! Authentication worked!')
        const data = await response.text()
        console.log('Response preview:', data.substring(0, 200))
        
        // If we got a token, test an API call
        try {
          const jsonData = JSON.parse(data)
          if (jsonData.token && jsonData.token.accessToken) {
            console.log('\n🎉 FOUND WORKING METHOD!')
            console.log(`Token Type: ${jsonData.token.tokenType}`)
            console.log(`Expires In: ${jsonData.token.expiresIn} seconds`)
            
            // Test API call with this token
            await testApiCallWithToken(jsonData.token.accessToken, restaurantId, method)
            return { success: true, method: authMethod.name, token: jsonData.token }
          }
        } catch (e) {
          console.log('Response is not JSON token format, but request succeeded')
        }
        
      } else {
        const errorText = await response.text()
        console.log('❌ Failed')
        console.log(`Error: ${errorText.substring(0, 150)}...`)
        
        // Check for specific error patterns
        if (response.status === 401) {
          console.log('→ 401: Unauthorized - credentials or method issue')
        } else if (response.status === 400) {
          console.log('→ 400: Bad Request - wrong format or missing data')
        } else if (response.status === 404) {
          console.log('→ 404: Not Found - wrong endpoint')
        } else if (response.status === 415) {
          console.log('→ 415: Unsupported Media Type - wrong Content-Type')
        }
      }
      
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`)
    }
  }
  
  console.log('\n❌ No working authentication method found yet')
  return { success: false }
}

async function testApiCallWithToken(accessToken, restaurantId, authMethod) {
  console.log('\n🔍 Testing API Call with Token...')
  
  try {
    const response = await fetch(`https://ws-api.toasttab.com/config/v1/restaurants/${restaurantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Toast-Restaurant-External-ID': restaurantId,
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`API Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API Call Successful!')
      console.log(`Restaurant: ${data.restaurantName || 'Unknown'}`)
      console.log(`Location: ${data.locationName || 'Unknown'}`)
      console.log(`\n🎉 COMPLETE SUCCESS with ${authMethod}!`)
    } else {
      const errorText = await response.text()
      console.log('❌ API Call Failed')
      console.log(`Error: ${errorText.substring(0, 100)}...`)
    }
    
  } catch (error) {
    console.log(`❌ API Call Error: ${error.message}`)
  }
}

// Main execution
testAllAuthMethods()
  .then(result => {
    if (result.success) {
      console.log('\n🎯 SOLUTION FOUND!')
      console.log(`Working method: ${result.method}`)
    } else {
      console.log('\n🤔 Need to try additional approaches...')
      console.log('Consider checking:')
      console.log('1. Different API hostnames')
      console.log('2. API version endpoints')
      console.log('3. Custom authentication headers')
      console.log('4. Restaurant-specific endpoints')
    }
  })
  .catch(console.error)