#!/usr/bin/env node

/**
 * TOAST API - Advanced Authentication Pattern Testing
 * Testing edge cases and alternative patterns that might work
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

async function testAdvancedAuthPatterns() {
  console.log('🔐 TOAST API - Advanced Authentication Pattern Testing')
  console.log('=====================================================\n')
  
  const clientId = process.env.TOAST_API_KEY
  const clientSecret = process.env.TOAST_CLIENT_SECRET
  const restaurantId = process.env.TOAST_RESTAURANT_ID
  
  console.log(`Client ID: ${clientId}`)
  console.log(`Restaurant ID: ${restaurantId}`)
  console.log(`Credential Name: EODWEBAPP\n`)
  
  const advancedTests = [
    {
      name: 'Production API with Specific Restaurant Context',
      url: `https://ws-api.toasttab.com/authentication/v1/authentication/login/${restaurantId}`,
      headers: {
        'Content-Type': 'application/json',
        'Toast-Restaurant-External-ID': restaurantId
      },
      body: {
        clientId: clientId,
        clientSecret: clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT'
      }
    },
    {
      name: 'Restaurant-Specific Authentication Endpoint',
      url: `https://ws-api.toasttab.com/authentication/v1/authentication/${restaurantId}/login`,
      headers: {
        'Content-Type': 'application/json',
        'Toast-Restaurant-External-ID': restaurantId
      },
      body: {
        clientId: clientId,
        clientSecret: clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT'
      }
    },
    {
      name: 'Client-Specific Authentication URL',
      url: `https://ws-api.toasttab.com/authentication/v1/client/${clientId}/login`,
      headers: {
        'Content-Type': 'application/json',
        'Toast-Restaurant-External-ID': restaurantId
      },
      body: {
        clientSecret: clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT',
        restaurantGuid: restaurantId
      }
    },
    {
      name: 'Standard API with Management Group Context',
      url: 'https://ws-api.toasttab.com/authentication/v1/authentication/login',
      headers: {
        'Content-Type': 'application/json',
        'Toast-Restaurant-External-ID': restaurantId,
        'Toast-Client-Name': 'EODWEBAPP'
      },
      body: {
        clientId: clientId,
        clientSecret: clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT',
        clientName: 'EODWEBAPP'
      }
    },
    {
      name: 'Legacy Endpoint with Restaurant Header',
      url: 'https://ws-api.toasttab.com/usermgmt/v1/oauth/authenticate',
      headers: {
        'Content-Type': 'application/json',
        'Toast-Restaurant-External-ID': restaurantId
      },
      body: {
        clientId: clientId,
        clientSecret: clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT'
      }
    },
    {
      name: 'Direct OAuth Token Request',
      url: 'https://ws-api.toasttab.com/oauth/token',
      headers: {
        'Content-Type': 'application/json',
        'Toast-Restaurant-External-ID': restaurantId
      },
      body: {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'orders:read menus:read config:read'
      }
    },
    {
      name: 'Machine Client Specific Endpoint',
      url: 'https://ws-api.toasttab.com/authentication/v1/machine/login',
      headers: {
        'Content-Type': 'application/json',
        'Toast-Restaurant-External-ID': restaurantId
      },
      body: {
        clientId: clientId,
        clientSecret: clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT'
      }
    },
    {
      name: 'Standard API with Scope Declaration',
      url: 'https://ws-api.toasttab.com/authentication/v1/authentication/login',
      headers: {
        'Content-Type': 'application/json',
        'Toast-Restaurant-External-ID': restaurantId
      },
      body: {
        clientId: clientId,
        clientSecret: clientSecret,
        userAccessType: 'TOAST_MACHINE_CLIENT',
        scope: 'cashmgmt:read config:read delivery_info.address:read digital_schedule:read guest.pi:read kitchen:read labor.employees:read labor:read menus:read orders:read packaging:read restaurants:read stock:read'
      }
    }
  ]
  
  for (const test of advancedTests) {
    console.log(`\n🧪 Testing: ${test.name}`)
    console.log('─'.repeat(60))
    console.log(`URL: ${test.url}`)
    console.log(`Headers: ${JSON.stringify(test.headers)}`)
    
    try {
      const response = await fetch(test.url, {
        method: 'POST',
        headers: test.headers,
        body: JSON.stringify(test.body)
      })
      
      console.log(`Status: ${response.status}`)
      
      if (response.ok) {
        console.log('✅ SUCCESS! Found working authentication method!')
        const responseText = await response.text()
        console.log('Response:', responseText.substring(0, 200))
        
        try {
          const data = JSON.parse(responseText)
          if (data.token) {
            console.log('\n🎉 ACCESS TOKEN RECEIVED!')
            console.log(`Token: ${data.token.accessToken?.substring(0, 30)}...`)
            return { success: true, method: test.name, data }
          }
        } catch (e) {
          console.log('Response not JSON token format')
        }
        
      } else {
        const errorText = await response.text()
        console.log(`❌ Failed: ${response.status}`)
        
        // Look for different error patterns
        if (errorText.includes('10010')) {
          console.log('→ Still getting credential access issue')
        } else if (errorText.includes('404')) {
          console.log('→ Endpoint not found')
        } else if (errorText.includes('400')) {
          console.log('→ Bad request format')
        } else {
          console.log(`→ New error pattern: ${errorText.substring(0, 100)}`)
        }
      }
      
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`)
    }
  }
  
  // Try production vs sandbox hostname variation
  console.log('\n🌐 Testing Alternative Hostnames')
  console.log('─'.repeat(40))
  
  const hostnames = [
    'https://api.toasttab.com',
    'https://sandbox-api.toasttab.com',
    'https://prod-api.toasttab.com',
    'https://toast-api.toasttab.com'
  ]
  
  for (const hostname of hostnames) {
    console.log(`\n🔗 Testing: ${hostname}`)
    
    try {
      const response = await fetch(`${hostname}/authentication/v1/authentication/login`, {
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
      
      console.log(`Status: ${response.status}`)
      
      if (response.ok) {
        console.log('✅ Found working hostname!')
        const data = await response.text()
        console.log('Response:', data.substring(0, 150))
      } else if (response.status !== 404) {
        console.log('→ Hostname exists but authentication still failing')
      }
      
    } catch (error) {
      console.log(`→ ${error.message}`)
    }
  }
  
  return { success: false }
}

// Main execution
testAdvancedAuthPatterns()
  .then(result => {
    if (result.success) {
      console.log('\n🎯 FOUND WORKING AUTHENTICATION!')
      console.log(`Method: ${result.method}`)
    } else {
      console.log('\n🤔 Advanced patterns also unsuccessful')
      console.log('This confirms it\'s likely a credential activation issue')
    }
  })
  .catch(console.error)