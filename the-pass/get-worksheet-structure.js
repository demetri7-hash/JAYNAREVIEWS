#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
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
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function getExactWorksheetStructure() {
  console.log('🔍 GETTING EXACT WORKSHEET TABLE STRUCTURE')
  console.log('==========================================')

  try {
    // Get a valid employee ID first
    const { data: employees } = await supabase
      .from('employees')
      .select('id, name')
      .limit(1)

    const employeeId = employees[0].id
    console.log(`✅ Found employee ID: ${employeeId} (${employees[0].name})`)

    // Now test worksheets table with proper employee_id
    console.log('\n🧪 TESTING WORKSHEET INSERTION WITH VALID EMPLOYEE_ID...')
    
    const testWorksheet = {
      employee_id: employeeId,
      department: 'FOH',
      shift_type: 'Morning Test'
    }

    const { data: result, error } = await supabase
      .from('worksheets')
      .insert(testWorksheet)
      .select('*')
      .single()

    if (error) {
      console.log('❌ Still failed with minimal data:', error.message)
      console.log('📋 Error details:', error)
    } else {
      console.log('✅ SUCCESS! Here are ALL the columns in worksheets table:')
      console.log('📊 Column names:', Object.keys(result))
      console.log('📝 Full structure:', result)
      
      // Clean up
      await supabase.from('worksheets').delete().eq('id', result.id)
      console.log('🧹 Test data cleaned up')
    }

  } catch (error) {
    console.error('🚨 Error:', error.message)
  }
}

getExactWorksheetStructure()
