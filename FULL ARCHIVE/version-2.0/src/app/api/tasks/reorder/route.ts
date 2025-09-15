import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
        .update({ sort_order, updated_at: new Date().toISOString() })
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

    // Log the reorder action
    await supabase
      .from('task_audit_log')
      .insert({
        workflow_instance_id: workflow_id,
        action_type: 'reordered',
        new_value: JSON.stringify(task_orders),
        performed_by: session.user.employee.id,
        notes: 'Tasks reordered via drag and drop'
      })

    return NextResponse.json({ 
      success: true,
      message: 'Tasks reordered successfully'
    })
  } catch (error) {
    console.error('Reorder tasks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
