import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get all employees to help debug
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch employees', 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      employees,
      message: `Found ${employees?.length || 0} employees` 
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, action } = body

    if (!email || !action) {
      return NextResponse.json({ 
        error: 'Missing email or action' 
      }, { status: 400 })
    }

    if (action === 'activate_manager') {
      // Activate user and make them a manager
      const { data, error } = await supabase
        .from('employees')
        .update({
          role: 'manager',
          is_active: true,
          permissions: [
            'view_all_worksheets',
            'manage_employees',
            'view_audit_logs',
            'create_workflows',
            'manage_roles'
          ],
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select()

      if (error) {
        return NextResponse.json({ 
          error: 'Failed to activate manager', 
          details: error.message 
        }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: `Successfully activated ${email} as manager`,
        user: data?.[0]
      })
    }

    return NextResponse.json({ 
      error: 'Invalid action' 
    }, { status: 400 })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
