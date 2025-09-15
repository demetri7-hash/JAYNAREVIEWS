#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
const fs = require('fs')
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
    return {}
  }
}

const env = loadEnv()
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function findWorksheetColumns() {
  console.log('🔍 DISCOVERING WORKSHEET TABLE COLUMNS')
  console.log('====================================')

  try {
    // Get employee ID
    const { data: employees } = await supabase.from('employees').select('id, name, department').limit(1)
    const employee = employees[0]
    console.log(`✅ Using employee: ${employee.name} (${employee.department})`)
    
    // Test different column combinations systematically
    const testCombinations = [
      // Test 1: employee_id + department
      {
        name: 'employee_id + department',
        data: {
          employee_id: employee.id,
          department: employee.department
        }
      },
      // Test 2: + shift_type
      {
        name: 'employee_id + department + shift_type',
        data: {
          employee_id: employee.id,
          department: employee.department,
          shift_type: 'Morning'
        }
      },
      // Test 3: + checklist_data
      {
        name: '+ checklist_data',
        data: {
          employee_id: employee.id,
          department: employee.department,
          shift_type: 'Morning',
          checklist_data: { test: true }
        }
      },
      // Test 4: + worksheet_data instead
      {
        name: '+ worksheet_data instead',
        data: {
          employee_id: employee.id,
          department: employee.department,
          shift_type: 'Morning',
          worksheet_data: { test: true }
        }
      }
    ]
    
    for (const test of testCombinations) {
      console.log(`\n🧪 Testing: ${test.name}`)
      
      const { data: result, error } = await supabase
        .from('worksheets')
        .insert(test.data)
        .select()
      
      if (error) {
        console.log(`   ❌ Failed: ${error.message}`)
        
        // Parse error for clues
        if (error.message.includes('null value in column')) {
          const match = error.message.match(/null value in column "([^"]+)"/)
          if (match) {
            console.log(`   📋 Missing required column: ${match[1]}`)
          }
        }
      } else {
        console.log(`   ✅ SUCCESS! Created worksheet with columns:`)
        console.log(`   📊 Result:`, Object.keys(result[0]))
        console.log(`   💾 Full data:`, result[0])
        
        // Clean up
        await supabase.from('worksheets').delete().eq('id', result[0].id)
        console.log(`   🧹 Cleaned up test data`)
        
        console.log('\n🎉 FOUND THE CORRECT STRUCTURE!')
        break
      }
    }
    
  } catch (error) {
    console.error('🚨 Discovery failed:', error.message)
  }
}

findWorksheetColumns()
