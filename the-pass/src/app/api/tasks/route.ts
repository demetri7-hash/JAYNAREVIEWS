import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/tasks - List task instances
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.employee) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get('workflow_id')
    const assignedTo = searchParams.get('assigned_to')
    const status = searchParams.get('status')

    let query = supabase
      .from('task_instances')
      .select(`
        *,
        workflow:workflow_instances(name, due_date, status),
        assignee:employees!task_instances_assigned_to_fkey(name, email),
        comments:task_comments(
          id, comment, is_system_message, created_at,
          user:employees(name)
        )
      `)
      .order('sort_order', { ascending: true })

    // Filter based on user role
    const userRole = session.user.employee.role
    if (!['manager', 'admin'].includes(userRole)) {
      // Employees can only see their own tasks
      query = query.eq('assigned_to', session.user.employee.id)
    }

    if (workflowId) {
      query = query.eq('workflow_instance_id', workflowId)
    }
    if (assignedTo && ['manager', 'admin'].includes(userRole)) {
      query = query.eq('assigned_to', assignedTo)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data: tasks, error } = await query

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    return NextResponse.json({ success: true, tasks })
  } catch (error) {
    console.error('Tasks API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/tasks - Update task instance
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.employee) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      id, 
      status, 
      assigned_to, 
      completion_note, 
      photo_url, 
      actual_minutes,
      sort_order 
    } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Get current task
    const { data: currentTask, error: fetchError } = await supabase
      .from('task_instances')
      .select('*, workflow:workflow_instances(assigned_to)')
      .eq('id', id)
      .single()

    if (fetchError || !currentTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check permissions
    const userRole = session.user.employee.role
    const isManager = ['manager', 'admin'].includes(userRole)
    const isAssignee = currentTask.assigned_to === session.user.employee.id
    const isWorkflowAssignee = currentTask.workflow?.assigned_to === session.user.employee.id

    if (!isManager && !isAssignee && !isWorkflowAssignee) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = { updated_at: new Date().toISOString() }
    
    if (status !== undefined) {
      updateData.status = status
      if (status === 'in_progress' && !currentTask.started_at) {
        updateData.started_at = new Date().toISOString()
      }
      if (status === 'completed' && !currentTask.completed_at) {
        updateData.completed_at = new Date().toISOString()
      }
    }

    if (assigned_to !== undefined && isManager) {
      updateData.assigned_to = assigned_to
      updateData.reassigned_by = session.user.employee.id
    }

    if (completion_note !== undefined) {
      updateData.completion_note = completion_note
    }

    if (photo_url !== undefined) {
      updateData.photo_url = photo_url
    }

    if (actual_minutes !== undefined) {
      updateData.actual_minutes = actual_minutes
    }

    if (sort_order !== undefined && isManager) {
      updateData.sort_order = sort_order
    }

    const { data: task, error } = await supabase
      .from('task_instances')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating task:', error)
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }

    // Log the change
    const logEntries = []
    if (status !== undefined && status !== currentTask.status) {
      logEntries.push({
        task_instance_id: id,
        workflow_instance_id: currentTask.workflow_instance_id,
        action_type: 'status_changed',
        old_value: currentTask.status,
        new_value: status,
        performed_by: session.user.employee.id
      })
    }
    if (assigned_to !== undefined && assigned_to !== currentTask.assigned_to) {
      logEntries.push({
        task_instance_id: id,
        workflow_instance_id: currentTask.workflow_instance_id,
        action_type: 'reassigned',
        old_value: currentTask.assigned_to,
        new_value: assigned_to,
        performed_by: session.user.employee.id
      })

      // Add system message for reassignment
      await supabase
        .from('task_comments')
        .insert({
          task_instance_id: id,
          user_id: session.user.employee.id,
          comment: `Task reassigned from ${currentTask.assignee?.name} to new assignee`,
          is_system_message: true
        })
    }

    if (logEntries.length > 0) {
      await supabase.from('task_audit_log').insert(logEntries)
    }

    return NextResponse.json({ 
      success: true, 
      task,
      message: 'Task updated successfully'
    })
  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/tasks/reorder - Reorder tasks via drag and drop
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.employee) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.employee.role
    if (!['manager', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { workflow_id, task_orders } = await request.json()

    if (!workflow_id || !Array.isArray(task_orders)) {
      return NextResponse.json({ 
        error: 'Workflow ID and task orders array are required' 
      }, { status: 400 })
    }

    // Update sort orders for all tasks
    const updates = task_orders.map(({ task_id, sort_order }: any) => 
      supabase
        .from('task_instances')
        .update({ sort_order })
        .eq('id', task_id)
        .eq('workflow_instance_id', workflow_id)
    )

    const results = await Promise.all(updates)
    
    // Check for errors
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      console.error('Error reordering tasks:', errors)
      return NextResponse.json({ error: 'Failed to reorder some tasks' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Tasks reordered successfully'
    })
  } catch (error) {
    console.error('Reorder tasks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
