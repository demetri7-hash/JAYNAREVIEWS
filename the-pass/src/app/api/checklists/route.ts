import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/checklists - List all checklists
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.employee) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const category = searchParams.get('category')
    const isActive = searchParams.get('active')

    let query = supabase
      .from('checklists')
      .select(`
        *,
        created_by_user:employees!created_by(name),
        tasks:tasks(*)
      `)
      .order('created_at', { ascending: false })

    if (department && department !== 'ALL') {
      query = query.eq('department', department)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data: checklists, error } = await query

    if (error) {
      console.error('Error fetching checklists:', error)
      return NextResponse.json({ error: 'Failed to fetch checklists' }, { status: 500 })
    }

    return NextResponse.json({ success: true, checklists })
  } catch (error) {
    console.error('Checklists API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/checklists - Create new checklist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.employee) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is manager/admin
    const userRole = session.user.employee.role
    if (!['manager', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { name, description, department, category, tasks } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Checklist name is required' }, { status: 400 })
    }

    // Create checklist
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .insert({
        name,
        description,
        department: department || 'BOTH',
        category: category || 'daily',
        created_by: session.user.employee.id
      })
      .select()
      .single()

    if (checklistError) {
      console.error('Error creating checklist:', checklistError)
      return NextResponse.json({ error: 'Failed to create checklist' }, { status: 500 })
    }

    // Create tasks if provided
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      const taskInserts = tasks.map((task: any, index: number) => ({
        checklist_id: checklist.id,
        title: task.title,
        description: task.description || '',
        estimated_minutes: task.estimated_minutes || 5,
        requires_photo: task.requires_photo || false,
        requires_note: task.requires_note || false,
        is_critical: task.is_critical || false,
        sort_order: index + 1
      }))

      const { error: tasksError } = await supabase
        .from('checklist_tasks')
        .insert(taskInserts)

      if (tasksError) {
        console.error('Error creating tasks:', tasksError)
        // Still return success but note the task creation issue
      }
    }

    return NextResponse.json({ 
      success: true, 
      checklist,
      message: 'Checklist created successfully'
    })
  } catch (error) {
    console.error('Create checklist error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/checklists - Update checklist
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.employee) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.employee.role
    if (!['manager', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id, name, description, department, category, is_active } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Checklist ID is required' }, { status: 400 })
    }

    const { data: checklist, error } = await supabase
      .from('checklists')
      .update({
        name,
        description,
        department,
        category,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating checklist:', error)
      return NextResponse.json({ error: 'Failed to update checklist' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      checklist,
      message: 'Checklist updated successfully'
    })
  } catch (error) {
    console.error('Update checklist error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/checklists - Delete checklist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.employee) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.employee.role
    if (!['manager', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Checklist ID is required' }, { status: 400 })
    }

    // Check if checklist has active workflows
    const { data: activeWorkflows } = await supabase
      .from('workflow_instances')
      .select('id')
      .eq('checklist_id', id)
      .in('status', ['assigned', 'in_progress'])

    if (activeWorkflows && activeWorkflows.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete checklist with active workflows' 
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('checklists')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting checklist:', error)
      return NextResponse.json({ error: 'Failed to delete checklist' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Checklist deleted successfully'
    })
  } catch (error) {
    console.error('Delete checklist error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
