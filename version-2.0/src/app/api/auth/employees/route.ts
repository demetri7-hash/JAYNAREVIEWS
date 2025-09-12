import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Get all employees (Manager/Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // Check if user has permission to manage employees
    const { data: currentUser } = await supabase
      .from('employees')
      .select('role, permissions')
      .eq('email', session.user.email)
      .single()

    if (!currentUser || !['manager', 'admin'].includes(currentUser.role)) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions'
      }, { status: 403 })
    }

    // Fetch all employees
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      employees
    })

  } catch (error: any) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

// Update employee (Manager/Admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const { employee_id, updates } = await request.json()

    // Check if user has permission to manage employees
    const { data: currentUser } = await supabase
      .from('employees')
      .select('id, role, permissions')
      .eq('email', session.user.email)
      .single()

    if (!currentUser || !['manager', 'admin'].includes(currentUser.role)) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions'
      }, { status: 403 })
    }

    // Get current employee data for audit log
    const { data: targetEmployee } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employee_id)
      .single()

    if (!targetEmployee) {
      return NextResponse.json({
        success: false,
        error: 'Employee not found'
      }, { status: 404 })
    }

    // Update employee
    const { data: updatedEmployee, error: updateError } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', employee_id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Create audit log entry
    const auditActions = []
    if (updates.role && updates.role !== targetEmployee.role) {
      auditActions.push('role_change')
    }
    if (updates.is_active !== undefined && updates.is_active !== targetEmployee.is_active) {
      auditActions.push(updates.is_active ? 'activate' : 'deactivate')
    }
    if (updates.permissions && JSON.stringify(updates.permissions) !== JSON.stringify(targetEmployee.permissions)) {
      auditActions.push('permission_change')
    }

    for (const action of auditActions) {
      await supabase
        .from('user_audit_log')
        .insert({
          action,
          target_employee_id: employee_id,
          performed_by: currentUser.id,
          old_values: {
            role: targetEmployee.role,
            is_active: targetEmployee.is_active,
            permissions: targetEmployee.permissions
          },
          new_values: updates
        })
    }

    return NextResponse.json({
      success: true,
      employee: updatedEmployee
    })

  } catch (error: any) {
    console.error('Error updating employee:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
