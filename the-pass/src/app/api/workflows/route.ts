import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/workflows - List workflow instances
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.employee) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assigned_to')
    const department = searchParams.get('department')

    let query = supabase
      .from('workflow_instances')
      .select(`
        *,
        checklist:checklists(name, category),
        assignee:employees!workflow_instances_assigned_to_fkey(name, email),
        assigner:employees!workflow_instances_assigned_by_fkey(name),
        tasks:task_instances(
          id, title, status, assigned_to, is_critical,
          assignee:employees!task_instances_assigned_to_fkey(name)
        )
      `)
      .order('created_at', { ascending: false })

    // Filter based on user role
    const userRole = session.user.employee.role
    if (!['manager', 'admin'].includes(userRole)) {
      // Employees can only see their own workflows
      query = query.eq('assigned_to', session.user.employee.id)
    }

    if (status) {
      query = query.eq('status', status)
    }
    if (assignedTo && ['manager', 'admin'].includes(userRole)) {
      query = query.eq('assigned_to', assignedTo)
    }
    if (department) {
      query = query.eq('department', department)
    }

    const { data: workflows, error } = await query

    if (error) {
      console.error('Error fetching workflows:', error)
      return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 })
    }

    return NextResponse.json({ success: true, workflows })
  } catch (error) {
    console.error('Workflows API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/workflows - Create new workflow instance
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

    const { checklist_id, assigned_to, name, due_date, department } = await request.json()

    if (!checklist_id || !assigned_to) {
      return NextResponse.json({ 
        error: 'Checklist ID and assigned user are required' 
      }, { status: 400 })
    }

    // Get checklist and its tasks
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .select(`
        *,
        tasks:checklist_tasks(*)
      `)
      .eq('id', checklist_id)
      .single()

    if (checklistError || !checklist) {
      return NextResponse.json({ error: 'Checklist not found' }, { status: 404 })
    }

    // Create workflow instance
    const workflowName = name || `${checklist.name} - ${new Date().toLocaleDateString()}`
    
    const { data: workflow, error: workflowError } = await supabase
      .from('workflow_instances')
      .insert({
        checklist_id,
        name: workflowName,
        assigned_to,
        assigned_by: session.user.employee.id,
        department: department || checklist.department,
        due_date: due_date ? new Date(due_date).toISOString() : null,
        total_tasks: checklist.tasks.length
      })
      .select()
      .single()

    if (workflowError) {
      console.error('Error creating workflow:', workflowError)
      return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 })
    }

    // Create task instances
    if (checklist.tasks && checklist.tasks.length > 0) {
      const taskInserts = checklist.tasks.map((task: any) => ({
        workflow_instance_id: workflow.id,
        checklist_task_id: task.id,
        title: task.title,
        description: task.description,
        assigned_to,
        sort_order: task.sort_order,
        estimated_minutes: task.estimated_minutes,
        is_critical: task.is_critical
      }))

      const { error: tasksError } = await supabase
        .from('task_instances')
        .insert(taskInserts)

      if (tasksError) {
        console.error('Error creating task instances:', tasksError)
        return NextResponse.json({ error: 'Failed to create task instances' }, { status: 500 })
      }
    }

    // Log the assignment
    await supabase
      .from('task_audit_log')
      .insert({
        workflow_instance_id: workflow.id,
        action_type: 'assigned',
        new_value: assigned_to,
        performed_by: session.user.employee.id,
        notes: `Workflow "${workflowName}" assigned`
      })

    return NextResponse.json({ 
      success: true, 
      workflow,
      message: 'Workflow assigned successfully'
    })
  } catch (error) {
    console.error('Create workflow error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/workflows - Update workflow instance
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.employee) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, status, assigned_to, due_date } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 })
    }

    // Get current workflow
    const { data: currentWorkflow, error: fetchError } = await supabase
      .from('workflow_instances')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !currentWorkflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Check permissions
    const userRole = session.user.employee.role
    const isManager = ['manager', 'admin'].includes(userRole)
    const isAssignee = currentWorkflow.assigned_to === session.user.employee.id

    if (!isManager && !isAssignee) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = { updated_at: new Date().toISOString() }
    
    if (status !== undefined) {
      updateData.status = status
      if (status === 'in_progress' && !currentWorkflow.started_at) {
        updateData.started_at = new Date().toISOString()
      }
      if (status === 'completed' && !currentWorkflow.completed_at) {
        updateData.completed_at = new Date().toISOString()
      }
    }

    if (assigned_to !== undefined && isManager) {
      updateData.assigned_to = assigned_to
    }

    if (due_date !== undefined && isManager) {
      updateData.due_date = due_date ? new Date(due_date).toISOString() : null
    }

    const { data: workflow, error } = await supabase
      .from('workflow_instances')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating workflow:', error)
      return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 })
    }

    // Log the change
    const logEntries = []
    if (status !== undefined && status !== currentWorkflow.status) {
      logEntries.push({
        workflow_instance_id: id,
        action_type: 'status_changed',
        old_value: currentWorkflow.status,
        new_value: status,
        performed_by: session.user.employee.id
      })
    }
    if (assigned_to !== undefined && assigned_to !== currentWorkflow.assigned_to) {
      logEntries.push({
        workflow_instance_id: id,
        action_type: 'reassigned',
        old_value: currentWorkflow.assigned_to,
        new_value: assigned_to,
        performed_by: session.user.employee.id
      })
    }

    if (logEntries.length > 0) {
      await supabase.from('task_audit_log').insert(logEntries)
    }

    return NextResponse.json({ 
      success: true, 
      workflow,
      message: 'Workflow updated successfully'
    })
  } catch (error) {
    console.error('Update workflow error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
