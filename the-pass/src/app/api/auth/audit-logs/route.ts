import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // Check if user has permission to view audit logs
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

    // Fetch audit logs with employee names
    const { data: logs, error } = await supabase
      .from('user_audit_log')
      .select(`
        *,
        target_employee:employees!target_employee_id(name),
        performed_by_employee:employees!performed_by(name)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      throw error
    }

    // Format the response
    const formattedLogs = logs.map(log => ({
      id: log.id,
      action: log.action,
      target_employee_name: log.target_employee?.name || 'Unknown',
      performed_by_name: log.performed_by_employee?.name || 'Unknown',
      old_values: log.old_values,
      new_values: log.new_values,
      created_at: log.created_at
    }))

    return NextResponse.json({
      success: true,
      logs: formattedLogs
    })

  } catch (error: any) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
