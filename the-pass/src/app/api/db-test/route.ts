import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Testing database connection and tables...')
    
    // Test 1: Basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('employees')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError.message,
        step: 'connection'
      })
    }

    // Test 2: Check if worksheets table exists
    const { data: worksheetTest, error: worksheetError } = await supabase
      .from('worksheets')
      .select('*')
      .limit(1)
    
    let worksheetTableExists = !worksheetError
    
    // Test 3: Check if close_reviews table exists  
    const { data: reviewsTest, error: reviewsError } = await supabase
      .from('close_reviews')
      .select('*')
      .limit(1)
      
    let reviewsTableExists = !reviewsError

    // Test 4: Try to create a simple worksheet if table exists
    let worksheetCreateTest = null
    if (worksheetTableExists) {
      const { data: createTest, error: createError } = await supabase
        .from('worksheets')
        .insert({
          employee_id: 'test-' + Date.now(),
          department: 'FOH',
          shift_type: 'Test',
          checklist_data: { test: true },
          status: 'in_progress',
          completion_percentage: 0
        })
        .select()
        .single()
        
      worksheetCreateTest = {
        success: !createError,
        error: createError?.message,
        data: createTest
      }
    }

    return NextResponse.json({
      success: true,
      tests: {
        connection: { success: !connectionError, error: connectionError?.message },
        worksheets_table: { 
          exists: worksheetTableExists, 
          error: worksheetError?.message,
          create_test: worksheetCreateTest
        },
        reviews_table: { exists: reviewsTableExists, error: reviewsError?.message }
      },
      message: 'Database diagnostics complete'
    })

  } catch (error: any) {
    console.error('🚨 API Error:', error)
    return NextResponse.json({
      success: false,
      error: 'API error',
      details: error.message
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📝 Creating table:', body.table)
    
    if (body.table === 'worksheets') {
      // Try to create worksheets table
      const { error } = await supabase.rpc('create_worksheets_table_if_not_exists')
      
      if (error) {
        console.error('❌ Table creation failed:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to create table',
          details: error.message
        })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Worksheets table created successfully'
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Unknown table requested'
    })
    
  } catch (error: any) {
    console.error('🚨 Table creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Table creation failed',
      details: error.message
    })
  }
}
