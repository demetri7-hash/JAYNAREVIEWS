import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 COMPREHENSIVE DATABASE INSPECTION')
    
    const results: any = {
      connection_test: null,
      tables_found: [],
      table_structures: {},
      sample_data: {},
      errors: []
    }

    // Test 1: Basic connection
    console.log('1. Testing basic connection...')
    try {
      const { data: connTest, error: connError } = await supabase
        .from('employees')
        .select('count')
        .limit(1)
      
      results.connection_test = {
        success: !connError,
        error: connError?.message
      }
    } catch (e: any) {
      results.connection_test = {
        success: false,
        error: e.message
      }
    }

    // Test 2: Check common tables
    const tablesToCheck = ['employees', 'worksheets', 'close_reviews', 'channels', 'messages', 'inventory_items', 'recipes', 'orders']
    
    console.log('2. Checking table existence...')
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (!error) {
          results.tables_found.push(table)
          
          // Get sample data structure
          if (data && data.length > 0) {
            results.sample_data[table] = {
              columns: Object.keys(data[0]),
              sample_row: data[0],
              row_count: 1
            }
          } else {
            // Table exists but is empty, try to get column info by attempting insert with empty object
            const { error: insertError } = await supabase
              .from(table)
              .insert({})
              .select()
            
            if (insertError) {
              // Parse error message to get required columns
              results.table_structures[table] = {
                error_info: insertError.message,
                hint: insertError.hint,
                details: insertError.details
              }
            }
          }
        } else {
          results.errors.push({
            table,
            error: error.message,
            code: error.code
          })
        }
      } catch (e: any) {
        results.errors.push({
          table,
          error: e.message,
          type: 'exception'
        })
      }
    }

    // Test 3: Try to understand worksheets table specifically
    console.log('3. Deep dive into worksheets table...')
    try {
      // Try different column combinations to understand structure
      const testCombinations = [
        { employee_id: 'test' },
        { employee_name: 'test' },
        { employee_id: 'test', department: 'FOH' },
        { employee_id: 'test', department: 'FOH', shift_type: 'Morning' },
        { employee_id: 'test', department: 'FOH', shift_type: 'Morning', checklist_data: {} },
        { employee_id: 'test', department: 'FOH', shift_type: 'Morning', checklist_data: [] }
      ]

      results.table_structures.worksheets_tests = []

      for (let i = 0; i < testCombinations.length; i++) {
        const testData = testCombinations[i]
        const { error } = await supabase
          .from('worksheets')
          .insert(testData)
          .select()

        results.table_structures.worksheets_tests.push({
          test_data: testData,
          error: error?.message,
          success: !error
        })

        if (!error) break // Stop on first success
      }
    } catch (e: any) {
      results.table_structures.worksheets_error = e.message
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      database_inspection: results
    }, { status: 200 })

  } catch (error: any) {
    console.error('🚨 Database inspection failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Database inspection failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
