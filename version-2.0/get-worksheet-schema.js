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

async function getWorksheetSchema() {
  console.log('🔍 GETTING EXACT WORKSHEET TABLE STRUCTURE')
  console.log('=========================================')

  try {
    // Method 1: Try to describe the table using SQL
    const { data: schema, error: schemaError } = await supabase
      .rpc('exec', {
        sql: `
          SELECT 
            column_name, 
            data_type, 
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = 'worksheets' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      })

    if (schemaError) {
      console.log('❌ Could not get schema via RPC')
      
      // Method 2: Try inserting with minimal data to see what's required
      console.log('🧪 TESTING MINIMAL WORKSHEET INSERT...')
      
      // First, get a real employee ID
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id, name')
        .limit(1)
      
      if (empError || !employees || employees.length === 0) {
        console.log('❌ No employees found')
        return
      }
      
      const employeeId = employees[0].id
      const employeeName = employees[0].name
      console.log(`✅ Using employee: ${employeeName} (${employeeId})`)
      
      // Try the absolute minimal insert
      console.log('📝 Testing minimal worksheet insert...')
      const { data: worksheet, error: insertError } = await supabase
        .from('worksheets')
        .insert({
          employee_id: employeeId
        })
        .select()
      
      if (insertError) {
        console.log('❌ Minimal insert failed:', insertError.message)
        console.log('🔍 This tells us what columns are required!')
        
        // Parse the error message to understand requirements
        if (insertError.message.includes('null value')) {
          console.log('📋 Some columns are NOT NULL and need values')
        }
        if (insertError.message.includes('violates')) {
          console.log('🔗 Foreign key or constraint issues')
        }
        
      } else {
        console.log('✅ Minimal insert worked! Columns:', Object.keys(worksheet[0]))
        console.log('📊 Full structure:', worksheet[0])
        
        // Clean up
        await supabase
          .from('worksheets')
          .delete()
          .eq('id', worksheet[0].id)
        console.log('🧹 Test data cleaned up')
      }
      
    } else {
      console.log('✅ Got schema from information_schema:')
      schema.forEach(col => {
        console.log(`  📋 ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'} ${col.column_default ? `default: ${col.column_default}` : ''}`)
      })
    }
    
  } catch (error) {
    console.error('🚨 Schema inspection failed:', error.message)
  }
}

getWorksheetSchema()
