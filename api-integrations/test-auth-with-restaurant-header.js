#!/usr/bin/env node

/**
 * TOAST API Authentication with Restaurant GUID Header
 * Testing authentication with Toast-Restaurant-External-ID header
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

async function testAuthWithRestaurantHeader() {
  console.log('🔐 TOAST API Authentication with Restaurant GUID Header')
  console.log('======================================================\n')
  
  const clientId = process.env.TOAST_API_KEY
  const clientSecret = process.env.TOAST_CLIENT_SECRET
  const restaurantId = process.env.TOAST_RESTAURANT_ID
  
  console.log(`Client ID: ${clientId}`)
  console.log(`Restaurant ID: ${restaurantId}`)
  console.log(`Secret: ${clientSecret ? `${clientSecret.substring(0, 8)}...` : 'Missing'}\n`)
  
  const authTests = [
    {
      name: 'Standard JSON with Restaurant Header',
      headers: {
        'Content-Type': 'application/json',
        'Toast-Restaurant-External-ID': restaurantId
      },
      body: JSON.stringify({
        clientId: clientId,
        clientSecret: clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT'
      })
    },
    {
      name: 'Standard JSON with Restaurant Header + Accept',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Toast-Restaurant-External-ID': restaurantId
      },
      body: JSON.stringify({
        clientId: clientId,
        clientSecret: clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT'
      })
    },
    {
      name: 'With Restaurant Header + User Agent',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Toast-Restaurant-External-ID': restaurantId,
        'User-Agent': 'EODWEBAPP/1.0'
      },
      body: JSON.stringify({
        clientId: clientId,
        clientSecret: clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT'
      })
    },
    {
      name: 'Restaurant Header with restaurantGuid in body',
      headers: {
        'Content-Type': 'application/json',
        'Toast-Restaurant-External-ID': restaurantId
      },
      body: JSON.stringify({
        clientId: clientId,
        clientSecret: clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT',
        restaurantGuid: restaurantId
      })
    },
    {
      name: 'Restaurant Header with restaurantExternalId in body',
      headers: {
        'Content-Type': 'application/json',
        'Toast-Restaurant-External-ID': restaurantId
      },
      body: JSON.stringify({
        clientId: clientId,
        clientSecret: clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT',
        restaurantExternalId: restaurantId
      })
    },
    {
      name: 'Alternative Restaurant Header Names',
      headers: {
        'Content-Type': 'application/json',
        'Toast-Restaurant-External-ID': restaurantId,
        'Restaurant-External-ID': restaurantId,
        'X-Restaurant-ID': restaurantId
      },
      body: JSON.stringify({
        clientId: clientId,
        clientSecret: clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT'
      })
    }
  ]
  
  for (const test of authTests) {
    console.log(`\n🧪 Testing: ${test.name}`)
    console.log('─'.repeat(60))
    console.log('Headers:', JSON.stringify(test.headers, null, 2))
    
    try {
      const response = await fetch('https://ws-api.toasttab.com/authentication/v1/authentication/login', {
        method: 'POST',
        headers: test.headers,
        body: test.body
      })
      
      console.log(`Status: ${response.status}`)
      console.log('Response Headers:')
      for (const [key, value] of response.headers.entries()) {
        console.log(`  ${key}: ${value}`)
      }
      
      const responseText = await response.text()
      console.log('\nResponse Body:')
      console.log(responseText.substring(0, 300))
      
      if (response.ok) {
        console.log('\n✅ SUCCESS! Authentication worked!')
        
        try {
          const data = JSON.parse(responseText)
          if (data.token && data.token.accessToken) {
            console.log('\n🎉 GOT ACCESS TOKEN!')
            console.log(`Token Type: ${data.token.tokenType}`)
            console.log(`Expires In: ${data.token.expiresIn} seconds`)
            console.log(`Access Token: ${data.token.accessToken.substring(0, 50)}...`)
            
            // Test API call immediately
            await testApiCall(data.token.accessToken, restaurantId)
            return { success: true, token: data.token, method: test.name }
          }
        } catch (e) {
          console.log('Could not parse response as JSON')
        }
        
      } else {
        console.log('❌ Failed')
        
        // Look for specific error codes
        try {
          const errorData = JSON.parse(responseText)
          if (errorData.code === 10010) {
            console.log('→ Error 10010: Access denied - still credential issue')
          } else if (errorData.code === 10013) {
            console.log('→ Error 10013: Full authentication required')
          } else {
            console.log(`→ Error ${errorData.code}: ${errorData.message}`)
          }
        } catch (e) {
          console.log('→ Could not parse error response')
        }
      }
      
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`)
    }
  }
  
  // Try legacy endpoint with restaurant header
  console.log('\n🧪 Testing Legacy Endpoint with Restaurant Header')
  console.log('─'.repeat(60))
  
  try {
    const response = await fetch('https://ws-api.toasttab.com/usermgmt/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Toast-Restaurant-External-ID': restaurantId
      },
      body: JSON.stringify({
        clientId: clientId,
        clientSecret: clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT'
      })
    })
    
    console.log(`Legacy Status: ${response.status}`)
    const legacyText = await response.text()
    console.log('Legacy Response:', legacyText.substring(0, 200))
    
    if (response.ok) {
      console.log('✅ Legacy endpoint worked!')
    }
    
  } catch (error) {
    console.log(`❌ Legacy Error: ${error.message}`)
  }
}

async function testApiCall(accessToken, restaurantId) {
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
    
    console.log(`API Call Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API Call Successful!')
      console.log(`Restaurant: ${data.restaurantName || 'Unknown'}`)
      console.log(`Location: ${data.locationName || 'Unknown'}`)
      console.log('🎉 COMPLETE TOAST INTEGRATION SUCCESS!')
    } else {
      const errorText = await response.text()
      console.log('❌ API Call Failed')
      console.log(`Error: ${errorText.substring(0, 200)}`)
    }
    
  } catch (error) {
    console.log(`❌ API Call Error: ${error.message}`)
  }
}

// Main execution
testAuthWithRestaurantHeader()
  .then(result => {
    if (result && result.success) {
      console.log('\n🎯 AUTHENTICATION SOLUTION FOUND!')
      console.log(`Working method: ${result.method}`)
      console.log('Ready to implement full TOAST integration!')
    } else {
      console.log('\n🤔 Still troubleshooting authentication...')
    }
  })
  .catch(console.error)