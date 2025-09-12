import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    console.log('🔧 Attempting to fix database schema...')
    
    // Method 1: Try to add the missing department column
    const { data: beforeSchema, error: beforeError } = await supabase
      .from('checklists')
      .select('id, name')
      .limit(1)

    console.log('Before schema fix - can access checklists:', !beforeError)
    
    // Create a test checklist to see current structure
    const testChecklist = {
      name: 'Test Schema Checklist',
      description: 'Testing current schema',
      category: 'test'
    }

    // Try to insert without department column first
    const { data: insertTest1, error: insertError1 } = await supabase
      .from('checklists')
      .insert(testChecklist)
      .select()

    console.log('Insert without department:', insertError1?.message || 'SUCCESS')

    // Now try with department column
    const testChecklistWithDept = {
      ...testChecklist,
      name: 'Test Schema Checklist with Dept',
      department: 'BOTH'
    }

    const { data: insertTest2, error: insertError2 } = await supabase
      .from('checklists')
      .insert(testChecklistWithDept)
      .select()

    console.log('Insert with department:', insertError2?.message || 'SUCCESS')

    // Clean up test records
    if (insertTest1?.[0]?.id) {
      await supabase.from('checklists').delete().eq('id', insertTest1[0].id)
    }
    if (insertTest2?.[0]?.id) {
      await supabase.from('checklists').delete().eq('id', insertTest2[0].id)
    }

    const results = {
      supabase_connection: !beforeError,
      insert_without_department: !insertError1,
      insert_with_department: !insertError2,
      department_column_exists: !insertError2,
      schema_needs_update: !!insertError2 && insertError2.message.includes('department'),
      recommendations: [] as string[]
    }

    if (insertError2) {
      results.recommendations.push('Need to add department column to checklists table')
      results.recommendations.push('Run: ALTER TABLE checklists ADD COLUMN department VARCHAR(100) DEFAULT \'BOTH\';')
    }

    if (insertError1) {
      results.recommendations.push('Basic checklist insertion failed - check table exists')
    }

    return NextResponse.json({
      success: true,
      message: 'Schema analysis complete',
      results,
      next_step: results.department_column_exists ? 'Test workflow creation' : 'Add department column'
    })

  } catch (error: any) {
    console.error('Schema analysis error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Schema analysis failed'
    }, { status: 500 })
  }
}