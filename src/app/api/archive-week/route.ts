import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    console.log('Starting weekly archive process...')
    
    // Get the previous Sunday (week ending date)
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const daysToSubtract = dayOfWeek === 0 ? 7 : dayOfWeek // If today is Sunday, get last Sunday
    const weekEnding = new Date(today)
    weekEnding.setDate(today.getDate() - daysToSubtract)
    weekEnding.setHours(23, 59, 59, 999) // End of Sunday
    
    const weekStart = new Date(weekEnding)
    weekStart.setDate(weekEnding.getDate() - 6)
    weekStart.setHours(0, 0, 0, 0) // Start of Monday
    
    console.log(`Archiving week: ${weekStart.toISOString()} to ${weekEnding.toISOString()}`)

    // Check if we already archived this week
    const { data: existingReport } = await supabase
      .from('weekly_reports')
      .select('id')
      .eq('week_ending', weekEnding.toISOString().split('T')[0])
      .single()
    
    if (existingReport) {
      return NextResponse.json({ 
        message: 'Week already archived',
        week_ending: weekEnding.toISOString().split('T')[0]
      })
    }

    // Get all completed assignments from the past week
    const { data: completedAssignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select(`
        id,
        task_id,
        assigned_to,
        assigned_by,
        due_date,
        status,
        created_at,
        completions (
          completed_by,
          notes,
          photo_url,
          completed_at
        )
      `)
      .eq('status', 'completed')
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnding.toISOString())

    if (assignmentsError) {
      throw assignmentsError
    }

    console.log(`Found ${completedAssignments?.length || 0} completed assignments to archive`)

    // Archive completed assignments
    const archivedData = []
    if (completedAssignments && completedAssignments.length > 0) {
      for (const assignment of completedAssignments) {
        const completion = assignment.completions[0] // Should only be one completion per assignment
        if (completion) {
          archivedData.push({
            original_assignment_id: assignment.id,
            task_id: assignment.task_id,
            assigned_to: assignment.assigned_to,
            assigned_by: assignment.assigned_by,
            due_date: assignment.due_date,
            status: assignment.status,
            created_at: assignment.created_at,
            completed_at: completion.completed_at,
            completed_by: completion.completed_by,
            notes: completion.notes,
            photo_url: completion.photo_url,
            week_ending: weekEnding.toISOString().split('T')[0]
          })
        }
      }

      // Insert into archived_assignments
      const { error: archiveError } = await supabase
        .from('archived_assignments')
        .insert(archivedData)

      if (archiveError) {
        throw archiveError
      }
    }

    // Generate user weekly stats
    const { data: allUsers } = await supabase
      .from('profiles')
      .select('id, name, email')

    const userStats = []
    if (allUsers) {
      for (const user of allUsers) {
        // Get assignments for this user this week
        const { data: userAssignments } = await supabase
          .from('assignments')
          .select('id, status, due_date, created_at')
          .eq('assigned_to', user.id)
          .gte('created_at', weekStart.toISOString())
          .lte('created_at', weekEnding.toISOString())

        // Get completions for this user this week
        const { data: userCompletions } = await supabase
          .from('completions')
          .select('completed_at, assignment_id')
          .eq('completed_by', user.id)
          .gte('completed_at', weekStart.toISOString())
          .lte('completed_at', weekEnding.toISOString())

        const tasksAssigned = userAssignments?.length || 0
        const tasksCompleted = userCompletions?.length || 0
        const completionRate = tasksAssigned > 0 ? (tasksCompleted / tasksAssigned) * 100 : 0

        // Count overdue tasks
        const overdueCount = userAssignments?.filter(a => 
          a.status === 'pending' && new Date(a.due_date) < weekEnding
        ).length || 0

        userStats.push({
          user_id: user.id,
          week_ending: weekEnding.toISOString().split('T')[0],
          tasks_assigned: tasksAssigned,
          tasks_completed: tasksCompleted,
          completion_rate: Number(completionRate.toFixed(2)),
          tasks_overdue: overdueCount
        })
      }

      // Insert user weekly stats
      if (userStats.length > 0) {
        const { error: statsError } = await supabase
          .from('user_weekly_stats')
          .insert(userStats)

        if (statsError) {
          console.error('Error inserting user stats:', statsError)
        }
      }
    }

    // Calculate overall week statistics
    const totalTasksAssigned = userStats.reduce((sum, stat) => sum + stat.tasks_assigned, 0)
    const totalTasksCompleted = userStats.reduce((sum, stat) => sum + stat.tasks_completed, 0)
    const overallCompletionRate = totalTasksAssigned > 0 ? (totalTasksCompleted / totalTasksAssigned) * 100 : 0
    
    // Find top performer
    const topPerformer = userStats.reduce((top, current) => {
      return current.tasks_completed > top.tasks_completed ? current : top
    }, userStats[0] || { user_id: null, tasks_completed: 0 })

    const { data: topPerformerProfile } = topPerformer.user_id ? await supabase
      .from('profiles')
      .select('id, name')
      .eq('id', topPerformer.user_id)
      .single() : { data: null }

    // Create weekly report
    const weeklyReport = {
      week_ending: weekEnding.toISOString().split('T')[0],
      total_tasks_completed: totalTasksCompleted,
      total_tasks_assigned: totalTasksAssigned,
      completion_rate: Number(overallCompletionRate.toFixed(2)),
      total_users_active: userStats.filter(stat => stat.tasks_assigned > 0).length,
      top_performer_id: topPerformer?.user_id || null,
      top_performer_completions: topPerformer?.tasks_completed || 0,
      report_data: {
        user_stats: userStats,
        week_summary: {
          week_start: weekStart.toISOString().split('T')[0],
          week_end: weekEnding.toISOString().split('T')[0],
          top_performer_name: topPerformerProfile?.name || 'N/A'
        }
      }
    }

    const { error: reportError } = await supabase
      .from('weekly_reports')
      .insert(weeklyReport)

    if (reportError) {
      throw reportError
    }

    // Optional: Delete old completed assignments to keep database clean
    // This moves them to archive and removes from main table
    if (completedAssignments && completedAssignments.length > 0) {
      const assignmentIds = completedAssignments.map(a => a.id)
      
      // Delete completions first (foreign key constraint)
      await supabase
        .from('completions')
        .delete()
        .in('assignment_id', assignmentIds)

      // Then delete assignments
      await supabase
        .from('assignments')
        .delete()
        .in('id', assignmentIds)
    }

    console.log('Archive process completed successfully')

    return NextResponse.json({
      success: true,
      message: 'Weekly archive completed',
      week_ending: weekEnding.toISOString().split('T')[0],
      tasks_archived: archivedData.length,
      total_completion_rate: overallCompletionRate,
      top_performer: topPerformerProfile?.name || 'N/A'
    })

  } catch (error) {
    console.error('Archive process error:', error)
    return NextResponse.json(
      { error: 'Failed to run archive process', details: error },
      { status: 500 }
    )
  }
}

// GET endpoint to check archive status or trigger manually (for testing)
export async function GET() {
  try {
    // Get the most recent report
    const { data: latestReport } = await supabase
      .from('weekly_reports')
      .select('*')
      .order('week_ending', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      latest_report: latestReport,
      archive_available: true
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check archive status' },
      { status: 500 }
    )
  }
}