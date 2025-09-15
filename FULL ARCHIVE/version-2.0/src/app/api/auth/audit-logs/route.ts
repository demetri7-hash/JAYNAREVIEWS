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
      .select('role')
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
      .from('audit_logs')
      .select(`
        *,
        employee:employees!employee_id(name)
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
      employee_name: log.employee?.name || 'Unknown',
      details: log.details,
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
