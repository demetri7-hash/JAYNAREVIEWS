import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current user's profile
    const { data: currentUser, error: userError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', session.user.email)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only managers can access team activity
    if (currentUser.role !== 'manager') {
      return NextResponse.json({ error: 'Manager access required' }, { status: 403 })
    }

    // Get team stats
    const { data: totalTasksResult } = await supabase
      .from('assignments')
      .select('id', { count: 'exact' })

    const { data: completedTodayResult } = await supabase
      .from('completions')
      .select('id', { count: 'exact' })
      .gte('completed_at', new Date(new Date().toDateString()).toISOString())

    const { data: pendingTasksResult } = await supabase
      .from('assignments')
      .select('id', { count: 'exact' })
      .eq('status', 'pending')

    // Get overdue tasks
    const { data: overdueTasksResult } = await supabase
      .from('assignments')
      .select('id', { count: 'exact' })
      .eq('status', 'pending')
      .lt('due_date', new Date().toISOString())

    const { data: totalUsersResult } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })

    // Get recent completions with task and user details
    const { data: recentCompletions } = await supabase
      .from('completions')
      .select(`
        id,
        notes,
        photo_url,
        completed_at,
        assignment:assignment_id (
          task:task_id (
            title
          )
        ),
        completed_by:completed_by (
          name
        )
      `)
      .order('completed_at', { ascending: false })
      .limit(10)

    // Get user activity stats
    const { data: userProfiles } = await supabase
      .from('profiles')
      .select('id, name, email')

    const userActivity = []
    
    if (userProfiles) {
      for (const user of userProfiles) {
        // Get completed today count
        const { data: completedToday } = await supabase
          .from('completions')
          .select('id', { count: 'exact' })
          .eq('completed_by', user.id)
          .gte('completed_at', new Date(new Date().toDateString()).toISOString())

        // Get pending tasks count
        const { data: pendingTasks } = await supabase
          .from('assignments')
          .select('id', { count: 'exact' })
          .eq('assigned_to', user.id)
          .eq('status', 'pending')

        // Get overdue tasks count
        const { data: overdueTasks } = await supabase
          .from('assignments')
          .select('id', { count: 'exact' })
          .eq('assigned_to', user.id)
          .eq('status', 'pending')
          .lt('due_date', new Date().toISOString())

        // Get total assigned tasks for completion rate
        const { data: totalAssigned } = await supabase
          .from('assignments')
          .select('id', { count: 'exact' })
          .eq('assigned_to', user.id)

        const completedCount = completedToday?.length || 0
        const pendingCount = pendingTasks?.length || 0
        const overdueCount = overdueTasks?.length || 0
        const totalCount = totalAssigned?.length || 0
        
        // Calculate completion rate (completed / total assigned * 100)
        const completionRate = totalCount > 0 
          ? Math.round(((totalCount - pendingCount - overdueCount) / totalCount) * 100)
          : 0

        userActivity.push({
          user_id: user.id,
          user_name: user.name,
          user_email: user.email,
          completed_today: completedCount,
          pending_tasks: pendingCount,
          overdue_tasks: overdueCount,
          completion_rate: completionRate
        })
      }
    }

    // Format recent completions
    const formattedCompletions = recentCompletions?.map((completion) => ({
      id: completion.id,
      task_title: (completion.assignment as { task?: { title?: string } })?.task?.title || 'Unknown Task',
      completed_by_name: (completion.completed_by as { name?: string })?.name || 'Unknown User',
      completed_at: completion.completed_at,
      notes: completion.notes,
      has_photo: !!completion.photo_url
    })) || []

    const stats = {
      totalTasks: totalTasksResult?.length || 0,
      completedToday: completedTodayResult?.length || 0,
      pendingTasks: pendingTasksResult?.length || 0,
      overdueTasks: overdueTasksResult?.length || 0,
      totalUsers: totalUsersResult?.length || 0
    }

    return NextResponse.json({
      success: true,
      stats,
      recentCompletions: formattedCompletions,
      userActivity: userActivity.sort((a, b) => b.completion_rate - a.completion_rate)
    })

  } catch (error) {
    console.error('Team activity fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}