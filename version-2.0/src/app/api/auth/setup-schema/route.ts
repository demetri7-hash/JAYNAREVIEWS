import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const setupSteps = []

    // Step 1: Check if employees table exists and what columns it has
    const { data: columns, error: columnError } = await supabase
      .from('employees')
      .select('*')
      .limit(1)

    if (columnError) {
      // Table might not exist, let's try to create it
      setupSteps.push('⚠️ Employees table needs to be created or updated')
      return NextResponse.json({
        success: false,
        error: 'Employees table not accessible',
        details: columnError.message,
        instructions: 'Please create the employees table in Supabase with columns: id, name, email, role, department, is_active, permissions, created_at, updated_at'
      }, { status: 500 })
    }

    setupSteps.push('✅ Employees table exists and is accessible')

    // Step 2: Check if we can query the table structure
    const { data: sampleEmployee } = await supabase
      .from('employees')
      .select('*')
      .limit(1)
      .single()

    if (sampleEmployee) {
      setupSteps.push('✅ Sample data query successful')
      setupSteps.push(`📊 Available columns: ${Object.keys(sampleEmployee).join(', ')}`)
    } else {
      setupSteps.push('ℹ️ No existing employee data found (this is normal for first setup)')
    }

    // Step 3: Test if we can insert/update records
    try {
      const testEmail = 'test-schema-setup@example.com'
      
      // Try to insert a test record
      const { error: insertError } = await supabase
        .from('employees')
        .upsert({
          name: 'Schema Test User',
          email: testEmail,
          role: 'employee',
          department: 'test',
          is_active: false,
          permissions: ['view_workflows'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        throw insertError
      }

      // Clean up test record
      await supabase
        .from('employees')
        .delete()
        .eq('email', testEmail)

      setupSteps.push('✅ Database write operations working correctly')

    } catch (error: any) {
      setupSteps.push('⚠️ Database write test failed: ' + error.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Database schema validation completed',
      steps: setupSteps,
      note: 'Your database appears to be ready for authentication. You can now try creating user accounts.'
    })

  } catch (error: any) {
    console.error('Schema setup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to validate database schema',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
