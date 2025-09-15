import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    const results: any = {}

    // 1. Add missing department column to checklists table
    console.log('Adding department column to checklists table...')
    const { error: alterError } = await supabase.rpc('execute_sql', {
      query: `
        ALTER TABLE checklists 
        ADD COLUMN IF NOT EXISTS department VARCHAR(100);
        
        ALTER TABLE checklists 
        ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 30;
        
        UPDATE checklists 
        SET department = 'BOTH' 
        WHERE department IS NULL;
      `
    })

    if (alterError) {
      // Try direct SQL execution instead
      try {
        await supabase.from('checklists').select('department').limit(1)
      } catch (err) {
        // Column doesn't exist, we need to add it manually
        results.schema_fix = 'Manual column addition needed'
      }
    } else {
      results.schema_fix = 'Successfully added department column'
    }

    // 2. Create test manager user
    const managerData = {
      name: 'Test Manager',
      email: 'manager@jaynagryo.test',
      department: 'FOH',
      role: 'manager',
      is_active: true
    }

    const { data: manager, error: managerError } = await supabase
      .from('employees')
      .upsert(managerData, { onConflict: 'email' })
      .select()
      .single()

    if (managerError) {
      results.manager_creation = { success: false, error: managerError.message }
    } else {
      results.manager_creation = { success: true, user: manager }
    }

    // 3. Create test employee user
    const employeeData = {
      name: 'Test Employee',
      email: 'employee@jaynagryo.test',
      department: 'BOH',
      role: 'employee',
      is_active: true
    }

    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .upsert(employeeData, { onConflict: 'email' })
      .select()
      .single()

    if (employeeError) {
      results.employee_creation = { success: false, error: employeeError.message }
    } else {
      results.employee_creation = { success: true, user: employee }
    }

    // 4. Verify schema is now complete
    const { data: checklistTest } = await supabase
      .from('checklists')
      .select('id, name, department')
      .limit(1)

    results.schema_verified = checklistTest !== null

    return NextResponse.json({
      success: true,
      message: 'Database setup and test users created',
      results,
      test_credentials: {
        manager: { email: 'manager@jaynagryo.test', role: 'manager' },
        employee: { email: 'employee@jaynagryo.test', role: 'employee' }
      },
      live_deployment_url: 'https://jaynareviews-b1q1-git-main-demetri-gregorakis-projects.vercel.app',
      next_steps: [
        'Test workflow creation with manager account',
        'Test workflow assignment and completion with employee account',
        'Verify all features work on live deployment'
      ]
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}