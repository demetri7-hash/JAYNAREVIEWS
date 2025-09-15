import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.employee) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has manager permissions
    const isManager = ['manager', 'admin'].includes(session.user.employee.role)
    if (!isManager) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d'
    
    // Calculate date range
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 }
    const days = daysMap[timeframe as keyof typeof daysMap] || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get total workflows in timeframe
    const { data: workflows, error: workflowsError } = await supabase
      .from('workflows')
      .select(`
        id,
        name,
        status,
        created_at,
        completed_at,
        due_date,
        assigned_to,
        employees!workflows_assigned_to_fkey(name)
      `)
      .gte('created_at', startDate.toISOString())

    if (workflowsError) {
      console.error('Error fetching workflows:', workflowsError)
      return NextResponse.json(
        { error: 'Failed to fetch workflows' },
        { status: 500 }
      )
    }

    // Calculate stats
    const totalWorkflows = workflows?.length || 0
    const completedWorkflows = workflows?.filter(w => w.status === 'completed').length || 0
    const overdueWorkflows = workflows?.filter(w => {
      if (!w.due_date || w.status === 'completed') return false
      return new Date(w.due_date) < new Date()
    }).length || 0

    // Calculate average completion time
    const completedWithTime = workflows?.filter(w => w.status === 'completed' && w.completed_at && w.created_at) || []
    const avgCompletionTime = completedWithTime.length > 0 
      ? completedWithTime.reduce((acc, w) => {
          const created = new Date(w.created_at)
          const completed = new Date(w.completed_at!)
          const minutes = Math.floor((completed.getTime() - created.getTime()) / (1000 * 60))
          return acc + minutes
        }, 0) / completedWithTime.length
      : 0

    // Get employee stats
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, name')
      .eq('is_active', true)

    if (employeesError) {
      console.error('Error fetching employees:', employeesError)
      return NextResponse.json(
        { error: 'Failed to fetch employees' },
        { status: 500 }
      )
    }

    const employeeStats = await Promise.all(
      (employees || []).map(async (employee) => {
        const employeeWorkflows = workflows?.filter(w => w.assigned_to === employee.id) || []
        const employeeCompleted = employeeWorkflows.filter(w => w.status === 'completed')
        
        const employeeCompletedWithTime = employeeCompleted.filter(w => w.completed_at && w.created_at)
        const employeeAvgTime = employeeCompletedWithTime.length > 0
          ? employeeCompletedWithTime.reduce((acc, w) => {
              const created = new Date(w.created_at)
              const completed = new Date(w.completed_at!)
              const minutes = Math.floor((completed.getTime() - created.getTime()) / (1000 * 60))
              return acc + minutes
            }, 0) / employeeCompletedWithTime.length
          : 0

        return {
          id: employee.id,
          name: employee.name,
          assignedWorkflows: employeeWorkflows.length,
          completedWorkflows: employeeCompleted.length,
          avgCompletionTime: Math.round(employeeAvgTime),
          completionRate: employeeWorkflows.length > 0 ? employeeCompleted.length / employeeWorkflows.length : 0
        }
      })
    )

    // Get recent activity from audit logs
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .select(`
        id,
        action,
        details,
        created_at,
        employee_id
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    // Get employee names for audit logs
    const auditLogsWithEmployees = await Promise.all(
      (auditLogs || []).map(async (log) => {
        const { data: employee } = await supabase
          .from('employees')
          .select('name')
          .eq('id', log.employee_id)
          .single()
        
        return {
          id: log.id,
          type: log.action,
          description: getActivityDescription(log.action, log.details),
          timestamp: log.created_at,
          employee_name: employee?.name || 'Unknown'
        }
      })
    )

    // Generate completion trends (daily data for chart)
    const completionTrends = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayAssigned = workflows?.filter(w => 
        new Date(w.created_at).toISOString().split('T')[0] === dateStr
      ).length || 0
      
      const dayCompleted = workflows?.filter(w => 
        w.completed_at && new Date(w.completed_at).toISOString().split('T')[0] === dateStr
      ).length || 0

      completionTrends.push({
        date: dateStr,
        assigned: dayAssigned,
        completed: dayCompleted
      })
    }

    return NextResponse.json({
      totalWorkflows,
      completedWorkflows,
      overdueWorkflows,
      avgCompletionTime: Math.round(avgCompletionTime),
      employeeStats: employeeStats.sort((a, b) => b.completionRate - a.completionRate),
      recentActivity: auditLogsWithEmployees,
      completionTrends
    })

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getActivityDescription(action: string, details: any): string {
  switch (action) {
    case 'workflow_assigned':
      return `Workflow "${details?.workflow_name || 'Unknown'}" assigned`
    case 'workflow_completed':
      return `Workflow "${details?.workflow_name || 'Unknown'}" completed`
    case 'task_completed':
      return `Task "${details?.task_title || 'Unknown'}" completed`
    case 'checklist_created':
      return `Checklist "${details?.checklist_name || 'Unknown'}" created`
    case 'checklist_updated':
      return `Checklist "${details?.checklist_name || 'Unknown'}" updated`
    default:
      return `${action.replace('_', ' ')} action performed`
  }
}
