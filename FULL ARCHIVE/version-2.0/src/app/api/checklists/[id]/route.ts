import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.employee) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get checklist with tasks
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .select('*')
      .eq('id', params.id)
      .single()

    if (checklistError || !checklist) {
      return NextResponse.json(
        { error: 'Checklist not found' },
        { status: 404 }
      )
    }

    // Get tasks for this checklist
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('checklist_id', params.id)
      .order('order_index')

    if (tasksError) {
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      checklist: {
        ...checklist,
        tasks: tasks || []
      }
    })

  } catch (error) {
    console.error('Error fetching checklist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
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

    const { name, description, category, tasks } = await request.json()

    // Update checklist
    const { error: checklistError } = await supabase
      .from('checklists')
      .update({
        name,
        description,
        category,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (checklistError) {
      return NextResponse.json(
        { error: 'Failed to update checklist' },
        { status: 500 }
      )
    }

    // Delete existing tasks
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('checklist_id', params.id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to update tasks' },
        { status: 500 }
      )
    }

    // Insert updated tasks
    if (tasks && tasks.length > 0) {
      const tasksToInsert = tasks.map((task: any, index: number) => ({
        checklist_id: params.id,
        title: task.title,
        description: task.description,
        order_index: index,
        estimated_minutes: task.estimated_minutes,
        allow_notes: task.allow_notes
      }))

      const { error: insertError } = await supabase
        .from('tasks')
        .insert(tasksToInsert)

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to insert updated tasks' },
          { status: 500 }
        )
      }
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        employee_id: session.user.employee.id,
        action: 'checklist_updated',
        details: {
          checklist_id: params.id,
          checklist_name: name,
          task_count: tasks?.length || 0
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Checklist updated successfully'
    })

  } catch (error) {
    console.error('Error updating checklist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
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

    // Get checklist name for logging
    const { data: checklist } = await supabase
      .from('checklists')
      .select('name')
      .eq('id', params.id)
      .single()

    // Delete checklist (tasks will be deleted via CASCADE)
    const { error } = await supabase
      .from('checklists')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete checklist' },
        { status: 500 }
      )
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        employee_id: session.user.employee.id,
        action: 'checklist_deleted',
        details: {
          checklist_id: params.id,
          checklist_name: checklist?.name || 'Unknown'
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Checklist deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting checklist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
