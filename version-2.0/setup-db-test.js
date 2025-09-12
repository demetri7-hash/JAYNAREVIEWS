#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Get env vars from .env.local (manual)
const fs = require('fs')
const path = require('path')

function loadEnv() {
  try {
    const envPath = path.join(__dirname, '.env.local')
    const envFile = fs.readFileSync(envPath, 'utf8')
    const lines = envFile.split('\n')
    const env = {}
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim()
      }
    })
    
    return env
  } catch (error) {
    console.error('❌ Could not load .env.local:', error.message)
    return {}
  }
}

const env = loadEnv()

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!env.SUPABASE_SERVICE_ROLE_KEY)
  process.exit(1)
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupDatabase() {
  console.log('🚀 Setting up database tables for The Pass...')
  
  try {
    // Test connection first
    console.log('1. Testing connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('employees')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message)
      return
    }
    console.log('✅ Connection successful')

    // Check if worksheets table exists and get its structure
    console.log('2. Checking worksheets table structure...')
    const { data: worksheetTest, error: worksheetError } = await supabase
      .from('worksheets')
      .select('*')
      .limit(1)
    
    if (worksheetError) {
      console.log('❌ Worksheets table error:', worksheetError.message)
    } else {
      console.log('✅ Worksheets table exists')
      if (worksheetTest && worksheetTest.length > 0) {
        console.log('📋 Sample row columns:', Object.keys(worksheetTest[0]))
      }
    }
    
    // Try to describe the table structure using rpc
    console.log('3. Getting table schema...')
    const { data: schema, error: schemaError } = await supabase
      .rpc('get_table_schema', { table_name: 'worksheets' })
    
    if (schemaError) {
      console.log('⚠️  Could not get schema via RPC:', schemaError.message)
    } else {
      console.log('📊 Table schema:', schema)
    }

    // Test creating a simple worksheet with basic columns
    console.log('4. Testing basic worksheet creation...')
    const simpleWorksheet = {
      employee_id: 'test-' + Date.now(),
      department: 'FOH',
      shift_type: 'Morning Test',
      checklist_data: {
        workflow_name: 'Test Workflow',
        tasks: [
          { id: 1, name: 'Test task', completed: false }
        ]
      },
      completion_percentage: 0,
      status: 'in_progress'
    }

    const { data: worksheet, error: createError } = await supabase
      .from('worksheets')
      .insert(simpleWorksheet)
      .select()
      .single()

    if (createError) {
      console.error('❌ Failed to create simple worksheet:', createError.message)
      console.log('🔍 Trying alternative column names...')
      
      // Try with different column structure
      const altWorksheet = {
        employee_id: 'test-alt-' + Date.now(),
        department: 'FOH', 
        shift_type: 'Test Alt'
      }
      
      const { data: altResult, error: altError } = await supabase
        .from('worksheets')
        .insert(altWorksheet)
        .select()
        .single()
        
      if (altError) {
        console.error('❌ Alternative failed too:', altError.message)
      } else {
        console.log('✅ Alternative structure worked:', Object.keys(altResult))
        // Clean up
        await supabase.from('worksheets').delete().eq('id', altResult.id)
      }
      
      return
    }

    console.log('✅ Successfully created worksheet:', worksheet.id)
    
    // Clean up test data
    await supabase
      .from('worksheets')
      .delete()
      .eq('id', worksheet.id)
    
    console.log('✅ Test cleanup completed')
    console.log('\n🎉 Database setup is working correctly!')
    console.log('💡 You can now use the workflow APIs')

  } catch (error) {
    console.error('🚨 Setup failed:', error.message)
  }
}

setupDatabase()
