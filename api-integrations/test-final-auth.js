#!/usr/bin/env node

/**
 * TOAST Standard API Access - Final Authentication Test
 * Testing with confirmed credentials and API hostname
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

async function finalAuthTest() {
  console.log('🔐 TOAST Standard API Access - Final Authentication Test')
  console.log('======================================================\n')
  
  const clientId = process.env.TOAST_API_KEY
  const clientSecret = process.env.TOAST_CLIENT_SECRET
  const restaurantId = process.env.TOAST_RESTAURANT_ID
  
  console.log('✅ CONFIRMED DETAILS:')
  console.log(`API Hostname: https://ws-api.toasttab.com`)
  console.log(`User Access Type: TOAST_MACHINE_CLIENT`)
  console.log(`Client ID: ${clientId}`)
  console.log(`Restaurant: Jayna Gyro - Sacramento`)
  console.log(`Restaurant ID: ${restaurantId}`)
  console.log(`Access Type: Standard API Access (13 scopes)`)
  console.log(`Credential Created: 8/17/2025, 1:36 AM`)
  console.log(`Days Since Creation: ${Math.floor((Date.now() - new Date('2025-08-17T01:36:00Z').getTime()) / (1000 * 60 * 60 * 24))} days\n`)
  
  // Test 1: Standard API with minimal headers
  console.log('🧪 Test 1: Standard API - Minimal Headers')
  console.log('─'.repeat(50))
  
  try {
    const response1 = await fetch('https://ws-api.toasttab.com/authentication/v1/authentication/login', {
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
    
    await logResponse('Test 1', response1)
    
  } catch (error) {
    console.log(`❌ Test 1 Error: ${error.message}`)
  }
  
  // Test 2: With additional standard headers
  console.log('\n🧪 Test 2: With Standard Headers')
  console.log('─'.repeat(50))
  
  try {
    const response2 = await fetch('https://ws-api.toasttab.com/authentication/v1/authentication/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Toast-Restaurant-External-ID': restaurantId,
        'User-Agent': 'EODWEBAPP/1.0 (Standard API Access)'
      },
      body: JSON.stringify({
        clientId: clientId,
        clientSecret: clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT'
      })
    })
    
    await logResponse('Test 2', response2)
    
  } catch (error) {
    console.log(`❌ Test 2 Error: ${error.message}`)
  }
  
  // Test 3: Try without restaurant header (maybe not needed for auth)
  console.log('\n🧪 Test 3: Without Restaurant Header')
  console.log('─'.repeat(50))
  
  try {
    const response3 = await fetch('https://ws-api.toasttab.com/authentication/v1/authentication/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        clientId: clientId,
        clientSecret: clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT'
      })
    })
    
    await logResponse('Test 3', response3)
    
  } catch (error) {
    console.log(`❌ Test 3 Error: ${error.message}`)
  }
  
  // Test 4: Try with restaurant ID in body
  console.log('\n🧪 Test 4: Restaurant ID in Body')
  console.log('─'.repeat(50))
  
  try {
    const response4 = await fetch('https://ws-api.toasttab.com/authentication/v1/authentication/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        clientId: clientId,
        clientSecret: clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT',
        restaurantId: restaurantId,
        restaurantGuid: restaurantId
      })
    })
    
    await logResponse('Test 4', response4)
    
  } catch (error) {
    console.log(`❌ Test 4 Error: ${error.message}`)
  }
  
  // Test 5: Check if we can hit the API directly (bypass auth for test)
  console.log('\n🧪 Test 5: Direct API Test (No Auth)')
  console.log('─'.repeat(50))
  
  try {
    const response5 = await fetch(`https://ws-api.toasttab.com/config/v1/restaurants/${restaurantId}`, {
      method: 'GET',
      headers: {
        'Toast-Restaurant-External-ID': restaurantId,
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`Direct API Status: ${response5.status}`)
    if (response5.status === 401) {
      console.log('✅ API responds correctly - authentication is required')
    } else {
      console.log(`❓ Unexpected status: ${response5.status}`)
    }
    
  } catch (error) {
    console.log(`❌ Direct API Error: ${error.message}`)
  }
  
  // Final analysis
  console.log('\n📊 Analysis Summary')
  console.log('─'.repeat(50))
  console.log('• Credentials created: August 17, 2025 (1+ month ago)')
  console.log('• API hostname confirmed: https://ws-api.toasttab.com')
  console.log('• Restaurant: Jayna Gyro - Sacramento (1 location)')
  console.log('• Access type: Standard API (13 scopes)')
  console.log('• Error pattern: Consistent 401/10010 across all methods')
  
  console.log('\n💡 Next Steps:')
  console.log('1. Check Toast Web dashboard credential status')
  console.log('2. Verify restaurant subscription level')
  console.log('3. Contact TOAST support if credentials show as active')
  console.log('4. Consider regenerating credentials if needed')
}

async function logResponse(testName, response) {
  console.log(`${testName} Status: ${response.status}`)
  
  if (response.ok) {
    console.log('✅ SUCCESS!')
    const text = await response.text()
    console.log('Response:', text.substring(0, 200))
    
    try {
      const data = JSON.parse(text)
      if (data.token) {
        console.log('🎉 GOT TOKEN!')
        console.log(`Token: ${data.token.accessToken?.substring(0, 30)}...`)
        return true
      }
    } catch (e) {
      console.log('Response not JSON token')
    }
  } else {
    const errorText = await response.text()
    console.log(`❌ Failed: ${errorText.substring(0, 150)}...`)
    
    try {
      const errorData = JSON.parse(errorText)
      if (errorData.code === 10010) {
        console.log('→ Error 10010: Credential access issue')
      }
    } catch (e) {
      console.log('→ Could not parse error')
    }
  }
  
  return false
}

// Execute test
finalAuthTest().catch(console.error)