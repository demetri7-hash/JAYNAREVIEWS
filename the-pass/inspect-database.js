#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
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
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

async function inspectDatabase() {
  console.log('🔍 COMPREHENSIVE DATABASE INSPECTION')
  console.log('====================================')
  console.log(`🌐 Supabase URL: ${env.NEXT_PUBLIC_SUPABASE_URL}`)
  console.log(`🔑 Service Key: ${env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`)
  console.log('')

  try {
    // 1. Test basic connection
    console.log('1️⃣ TESTING CONNECTION...')
    const { data: healthCheck, error: healthError } = await supabase
      .from('employees')
      .select('count')
      .limit(1)
    
    if (healthError) {
      console.error('❌ Connection failed:', healthError.message)
      return
    }
    console.log('✅ Connection successful!')
    console.log('')

    // 2. List all tables using information_schema
    console.log('2️⃣ DISCOVERING ALL TABLES...')
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec', {
        sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `
      })

    if (tablesError) {
      console.log('⚠️ Could not get tables via RPC, trying manual approach...')
      
      // Try to access known tables manually
      const knownTables = ['employees', 'worksheets', 'close_reviews', 'channels', 'messages']
      const existingTables = []
      
      for (const table of knownTables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(0) // Just check if table exists
        
        if (!error) {
          existingTables.push(table)
        }
      }
      
      console.log('📋 Found these tables:', existingTables)
      
      // 3. Inspect each existing table
      for (const table of existingTables) {
        console.log(`\n3️⃣ INSPECTING TABLE: ${table}`)
        console.log('-'.repeat(40))
        
        // Get sample data to see structure
        const { data: sampleData, error: sampleError } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (sampleError) {
          console.log(`❌ Error accessing ${table}:`, sampleError.message)
        } else {
          if (sampleData && sampleData.length > 0) {
            console.log(`📊 Columns in ${table}:`, Object.keys(sampleData[0]))
            console.log(`📝 Sample data:`, sampleData[0])
          } else {
            // Table exists but empty - try inserting a test record
            console.log(`📋 Table ${table} exists but is empty`)
            
            if (table === 'worksheets') {
              console.log('🧪 Testing worksheet insertion...')
              
              // Try different column combinations
              const testCombinations = [
                // Combination 1: Based on our API
                {
                  employee_name: 'Test User',
                  department: 'FOH',
                  shift_type: 'Test',
                  worksheet_data: { test: true },
                  completion_percentage: 0
                },
                // Combination 2: Minimal required
                {
                  employee_id: crypto.randomUUID(),
                  department: 'FOH',
                  shift_type: 'Test'
                },
                // Combination 3: Basic structure
                {
                  department: 'FOH',
                  shift_type: 'Test',
                  checklist_data: { test: true }
                }
              ]
              
              for (let i = 0; i < testCombinations.length; i++) {
                console.log(`   Testing combination ${i + 1}...`)
                const { data: testResult, error: testError } = await supabase
                  .from('worksheets')
                  .insert(testCombinations[i])
                  .select()
                
                if (testError) {
                  console.log(`   ❌ Combination ${i + 1} failed:`, testError.message)
                } else {
                  console.log(`   ✅ Combination ${i + 1} worked!`)
                  console.log(`   📊 Result columns:`, Object.keys(testResult[0]))
                  
                  // Clean up test data
                  await supabase
                    .from('worksheets')
                    .delete()
                    .eq('id', testResult[0].id)
                  
                  console.log('   🧹 Test data cleaned up')
                  break
                }
              }
            }
          }
        }
      }
      
    } else {
      console.log('📋 Tables from information_schema:', tables)
    }

    console.log('\n✅ DATABASE INSPECTION COMPLETE!')
    console.log('Now I know exactly what structure to use in the APIs')

  } catch (error) {
    console.error('🚨 Inspection failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

inspectDatabase()
