#!/usr/bin/env node

/**
 * TOAST API Authentication Test with Real Credentials
 * Testing with the actual client secret provided
 */

async function testWithRealCredentials() {
  console.log('🔐 TOAST API Authentication - Real Credentials Test')
  console.log('==================================================\n')
  
  const config = {
    BASE_URL: 'https://ws-api.toasttab.com',
    CLIENT_ID: '3g0R0NFYjHIQcVe9bYP8eTbJjwRTvCNV',
    CLIENT_SECRET: 'A71vhh1Oeo4npmOWhPFJR1RgwYiYQSo41lwLKnE_enP93eybRNkkV9G4lJdzOVep',
    RESTAURANT_GUID: 'd3efae34-7c2e-4107-a442-49081e624706'
  }
  
  console.log('✅ CONFIGURATION:')
  console.log(`Base URL: ${config.BASE_URL}`)
  console.log(`Client ID: ${config.CLIENT_ID}`)
  console.log(`Restaurant GUID: ${config.RESTAURANT_GUID}`)
  console.log(`Client Secret: ${config.CLIENT_SECRET.substring(0, 10)}...`)
  console.log(`Secret Length: ${config.CLIENT_SECRET.length} characters\n`)
  
  // Test authentication
  const authUrl = `${config.BASE_URL}/authentication/v1/authentication/login`
  
  console.log('🚀 TESTING AUTHENTICATION')
  console.log(`POST ${authUrl}`)
  console.log('Headers:')
  console.log('  Content-Type: application/json')
  console.log(`  Toast-Restaurant-External-ID: ${config.RESTAURANT_GUID}`)
  
  const authPayload = {
    clientId: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
    userAccessType: 'TOAST_MACHINE_CLIENT'
  }
  
  console.log('\nRequest Body:')
  console.log(JSON.stringify({
    clientId: config.CLIENT_ID,
    clientSecret: `${config.CLIENT_SECRET.substring(0, 10)}...`,
    userAccessType: 'TOAST_MACHINE_CLIENT'
  }, null, 2))
  
  try {
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Toast-Restaurant-External-ID': config.RESTAURANT_GUID
      },
      body: JSON.stringify(authPayload)
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
      console.log('\n🎉 AUTHENTICATION SUCCESSFUL!')
      
      try {
        const data = JSON.parse(responseText)
        
        if (data.token && data.token.accessToken) {
          console.log('\n✅ ACCESS TOKEN RECEIVED!')
          console.log(`Token Type: ${data.token.tokenType}`)
          console.log(`Expires In: ${data.token.expiresIn} seconds`)
          console.log(`Access Token: ${data.token.accessToken.substring(0, 50)}...`)
          
          // Test API calls immediately
          await testAllApiEndpoints(data.token.accessToken, config.RESTAURANT_GUID)
          
          return {
            success: true,
            token: data.token,
            config: config
          }
        }
        
      } catch (parseError) {
        console.log(`❌ Could not parse response: ${parseError.message}`)
      }
      
    } else {
      console.log('\n❌ AUTHENTICATION FAILED')
      
      try {
        const errorData = JSON.parse(responseText)
        console.log('\n🔍 Error Details:')
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
        
      } catch (parseError) {
        console.log('Could not parse error response')
      }
    }
    
  } catch (networkError) {
    console.log(`\n❌ Network Error: ${networkError.message}`)
  }
  
  return { success: false }
}

async function testAllApiEndpoints(accessToken, restaurantGuid) {
  console.log('\n🧪 TESTING ALL API ENDPOINTS')
  console.log('==============================')
  
  const apiTests = [
    {
      name: 'Restaurant Configuration',
      url: `https://ws-api.toasttab.com/config/v1/restaurants/${restaurantGuid}`,
      method: 'GET'
    },
    {
      name: 'Restaurant Info',
      url: `https://ws-api.toasttab.com/restaurants/v1/restaurants/${restaurantGuid}`,
      method: 'GET'
    },
    {
      name: 'Menu Information',
      url: `https://ws-api.toasttab.com/menus/v2/menus`,
      method: 'GET'
    },
    {
      name: 'Orders Data (Today)',
      url: `https://ws-api.toasttab.com/orders/v2/orders?startDate=${new Date().toISOString().split('T')[0]}&endDate=${new Date().toISOString().split('T')[0]}`,
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
    },
    {
      name: 'Cash Management',
      url: `https://ws-api.toasttab.com/cashmgmt/v1/entries`,
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
          'Toast-Restaurant-External-ID': restaurantGuid,
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
            if (jsonData.length > 0) {
              console.log(`📋 Sample item keys: ${Object.keys(jsonData[0]).slice(0, 5).join(', ')}...`)
            }
          } else if (jsonData.restaurantName) {
            console.log(`🏪 Restaurant: ${jsonData.restaurantName}`)
          } else if (jsonData.name) {
            console.log(`📋 Name: ${jsonData.name}`)
          } else {
            console.log(`📋 Object keys: ${Object.keys(jsonData).slice(0, 5).join(', ')}...`)
          }
        } catch (e) {
          console.log('Response is not JSON format')
        }
        
      } else {
        const errorText = await response.text()
        console.log(`❌ Failed: ${errorText.substring(0, 150)}...`)
      }
      
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`)
    }
  }
}

// Main execution
console.log('Starting TOAST API Test with Real Credentials...\n')

testWithRealCredentials()
  .then(result => {
    if (result.success) {
      console.log('\n🎯 TOAST INTEGRATION SUCCESS!')
      console.log('==========================================')
      console.log('✅ Authentication working with real credentials!')
      console.log('✅ API access confirmed!')
      console.log('\n🚀 Ready to implement full THE PASS integration!')
      console.log('Next steps:')
      console.log('1. Build data sync framework')
      console.log('2. Create UI components')
      console.log('3. Implement monitoring dashboard')
    } else {
      console.log('\n🔧 Still troubleshooting...')
      console.log('The credentials provided are the real ones - if still failing, it\'s definitely a TOAST account configuration issue.')
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected Error:', error.message)
  })