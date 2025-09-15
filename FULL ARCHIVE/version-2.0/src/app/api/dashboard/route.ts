import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.employee) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.employee.role
    const userId = session.user.employee.id
    const isManager = ['manager', 'admin'].includes(userRole)

    // Base queries
    let workflowQuery = supabase.from('workflow_instances').select('*')
    let taskQuery = supabase.from('task_instances').select('*')

    // Filter for employees vs managers
    if (!isManager) {
      workflowQuery = workflowQuery.eq('assigned_to', userId)
      taskQuery = taskQuery.eq('assigned_to', userId)
    }

    // Get workflow statistics
    const [
      { data: allWorkflows },
      { data: activeWorkflows },
      { data: completedWorkflows },
      { data: overdueWorkflows },
      { data: allTasks },
      { data: pendingTasks },
      { data: inProgressTasks },
      { data: completedTasks },
      { data: recentActivity }
    ] = await Promise.all([
      // Workflows
      workflowQuery,
      workflowQuery.in('status', ['assigned', 'in_progress']),
      workflowQuery.eq('status', 'completed'),
      workflowQuery.eq('status', 'overdue'),
      
      // Tasks
      taskQuery,
      taskQuery.eq('status', 'pending'),
      taskQuery.eq('status', 'in_progress'),
      taskQuery.eq('status', 'completed'),
      
      // Recent activity (last 7 days)
      supabase
        .from('task_audit_log')
        .select(`
          *,
          task:task_instances(title),
          workflow:workflow_instances(name),
          user:employees(name)
        `)
        .gte('performed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('performed_at', { ascending: false })
        .limit(20)
    ])

    // Calculate completion rates
    const totalWorkflows = allWorkflows?.length || 0
    const totalTasks = allTasks?.length || 0
    const workflowCompletionRate = totalWorkflows > 0 ? 
      Math.round(((completedWorkflows?.length || 0) / totalWorkflows) * 100) : 0
    const taskCompletionRate = totalTasks > 0 ? 
      Math.round(((completedTasks?.length || 0) / totalTasks) * 100) : 0

    // Calculate average completion time for completed workflows
    const avgCompletionTime = completedWorkflows && completedWorkflows.length > 0 ?
      completedWorkflows.reduce((acc, wf) => {
        if (wf.started_at && wf.completed_at) {
          const diff = new Date(wf.completed_at).getTime() - new Date(wf.started_at).getTime()
          return acc + (diff / (1000 * 60)) // minutes
        }
        return acc
      }, 0) / completedWorkflows.length : 0

    // Get team performance (managers only)
    let teamStats = null
    if (isManager) {
      const { data: teamMembers } = await supabase
        .from('employees')
        .select(`
          id, name, department,
          assigned_workflows:workflow_instances(id, status),
          assigned_tasks:task_instances(id, status)
        `)
        .eq('is_active', true)
        .neq('role', 'admin')

      teamStats = teamMembers?.map(member => ({
        id: member.id,
        name: member.name,
        department: member.department,
        activeWorkflows: member.assigned_workflows?.filter((w: any) => 
          ['assigned', 'in_progress'].includes(w.status)
        ).length || 0,
        completedWorkflows: member.assigned_workflows?.filter((w: any) => 
          w.status === 'completed'
        ).length || 0,
        pendingTasks: member.assigned_tasks?.filter((t: any) => 
          t.status === 'pending'
        ).length || 0,
        completedTasks: member.assigned_tasks?.filter((t: any) => 
          t.status === 'completed'
        ).length || 0
      }))
    }

    const stats = {
      workflows: {
        total: totalWorkflows,
        active: activeWorkflows?.length || 0,
        completed: completedWorkflows?.length || 0,
        overdue: overdueWorkflows?.length || 0,
        completionRate: workflowCompletionRate,
        avgCompletionTime: Math.round(avgCompletionTime)
      },
      tasks: {
        total: totalTasks,
        pending: pendingTasks?.length || 0,
        inProgress: inProgressTasks?.length || 0,
        completed: completedTasks?.length || 0,
        completionRate: taskCompletionRate
      },
      recentActivity: recentActivity || [],
      teamStats: teamStats
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/dashboard/upcoming - Get upcoming tasks and deadlines
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.employee) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.employee.role
    const userId = session.user.employee.id
    const isManager = ['manager', 'admin'].includes(userRole)

    // Get upcoming deadlines (next 24 hours)
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    
    let upcomingQuery = supabase
      .from('workflow_instances')
      .select(`
        *,
        checklist:checklists(name),
        assignee:employees!workflow_instances_assigned_to_fkey(name)
      `)
      .in('status', ['assigned', 'in_progress'])
      .lte('due_date', tomorrow)
      .order('due_date', { ascending: true })

    if (!isManager) {
      upcomingQuery = upcomingQuery.eq('assigned_to', userId)
    }

    const { data: upcomingWorkflows, error } = await upcomingQuery

    if (error) {
      console.error('Error fetching upcoming workflows:', error)
      return NextResponse.json({ error: 'Failed to fetch upcoming workflows' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      upcomingWorkflows: upcomingWorkflows || []
    })
  } catch (error) {
    console.error('Upcoming workflows error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
