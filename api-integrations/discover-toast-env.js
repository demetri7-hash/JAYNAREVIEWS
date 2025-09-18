#!/usr/bin/env node

/**
 * TOAST API Environment Discovery
 * Tests different authentication patterns and environments
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

async function discoverToastEnvironment() {
  console.log('🔍 TOAST API Environment Discovery')
  console.log('=====================================\n')
  
  const clientId = process.env.TOAST_API_KEY
  const clientSecret = process.env.TOAST_CLIENT_SECRET
  const restaurantId = process.env.TOAST_RESTAURANT_ID
  
  console.log(`Client ID: ${clientId}`)
  console.log(`Restaurant ID: ${restaurantId}`)
  console.log(`Secret: ${clientSecret ? `${clientSecret.substring(0, 8)}...` : 'Missing'}\n`)
  
  // Test different environment patterns
  const environments = [
    {
      name: 'Production API',
      hostname: 'https://ws-api.toasttab.com',
      authPath: '/authentication/v1/authentication/login'
    },
    {
      name: 'Standard API',
      hostname: 'https://api.toasttab.com',
      authPath: '/authentication/v1/authentication/login'
    },
    {
      name: 'Legacy API v1',
      hostname: 'https://ws-api.toasttab.com',
      authPath: '/usermgmt/v1/oauth/token'
    },
    {
      name: 'Legacy API v2',
      hostname: 'https://api.toasttab.com',
      authPath: '/usermgmt/v1/oauth/token'
    },
    {
      name: 'Sandbox/Dev Environment',
      hostname: 'https://sandbox-ws-api.toasttab.com',
      authPath: '/authentication/v1/authentication/login'
    }
  ]
  
  for (const env of environments) {
    console.log(`\n🧪 Testing: ${env.name}`)
    console.log(`Endpoint: ${env.hostname}${env.authPath}`)
    
    try {
      // Test with standard format
      let response = await fetch(`${env.hostname}${env.authPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientId,
          clientSecret: clientSecret,
          userAccessType: 'TOAST_MACHINE_CLIENT'
        })
      })
      
      console.log(`Status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ SUCCESS! Found working endpoint')
        console.log(`Token type: ${data.token?.tokenType}`)
        console.log(`Expires in: ${data.token?.expiresIn} seconds`)
        return { environment: env, token: data.token.accessToken }
      }
      
      // If 401, credentials might be wrong format
      if (response.status === 401) {
        console.log('❌ Unauthorized - checking credential format...')
        
        // Try OAuth2 client credentials format
        const oauthResponse = await fetch(`${env.hostname}${env.authPath}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
          },
          body: new URLSearchParams({
            'grant_type': 'client_credentials'
          })
        })
        
        console.log(`OAuth format status: ${oauthResponse.status}`)
        
        if (oauthResponse.ok) {
          const oauthData = await oauthResponse.json()
          console.log('✅ SUCCESS with OAuth2 format!')
          return { environment: env, token: oauthData.access_token }
        }
      }
      
      // Show error details for troubleshooting
      if (response.status >= 400) {
        const errorText = await response.text()
        console.log(`Error: ${errorText.substring(0, 150)}...`)
      }
      
    } catch (error) {
      console.log(`❌ Connection error: ${error.message}`)
    }
  }
  
  console.log('\n❌ No working TOAST environment found')
  return null
}

async function testCredentialFormats() {
  console.log('\n🔧 Testing Different Credential Formats')
  console.log('========================================')
  
  const clientId = process.env.TOAST_API_KEY
  const clientSecret = process.env.TOAST_CLIENT_SECRET
  
  console.log('\nCredential Analysis:')
  console.log(`Client ID length: ${clientId?.length}`)
  console.log(`Client Secret length: ${clientSecret?.length}`)
  console.log(`Client ID format: ${clientId?.match(/^[a-zA-Z0-9]+$/) ? 'Alphanumeric' : 'Mixed characters'}`)
  
  // Check if credentials look like they're for different auth types
  if (clientId?.length === 32 && clientSecret?.length > 60) {
    console.log('✅ Credentials look like TOAST Standard API format')
  } else if (clientId?.includes('-') && clientSecret?.length > 40) {
    console.log('⚠️  Credentials might be for Partner API or different format')
  } else {
    console.log('❓ Unusual credential format - might need different auth flow')
  }
}

async function suggestNextSteps() {
  console.log('\n💡 Troubleshooting Suggestions')
  console.log('==============================')
  
  console.log('\n1. Check TOAST Web Dashboard:')
  console.log('   • Log into Toast Web > Settings > Integrations')
  console.log('   • Verify API access is enabled')
  console.log('   • Check if credentials are for Sandbox vs Production')
  
  console.log('\n2. Verify Restaurant ID:')
  console.log('   • Should be a GUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')
  console.log('   • Found in Toast Web > Settings > Restaurant Info')
  
  console.log('\n3. Contact Toast Support:')
  console.log('   • Email: developers@toasttab.com') 
  console.log('   • Include: Client ID, Restaurant ID (no secret!)')
  console.log('   • Ask about: Standard API access setup')
  
  console.log('\n4. Alternative Approach:')
  console.log('   • Implement mock data mode for development')
  console.log('   • Build features with simulated data')
  console.log('   • Connect real API once authentication is resolved')
}

// Main execution
async function main() {
  const result = await discoverToastEnvironment()
  await testCredentialFormats()
  await suggestNextSteps()
  
  if (result) {
    console.log('\n🎉 Success! Working configuration found:')
    console.log(`Environment: ${result.environment.name}`)
    console.log(`Hostname: ${result.environment.hostname}`)
    console.log(`Auth Path: ${result.environment.authPath}`)
  } else {
    console.log('\n📋 Summary: Authentication not working with current setup')
    console.log('Recommend implementing mock data mode while resolving API access')
  }
}

main().catch(console.error)