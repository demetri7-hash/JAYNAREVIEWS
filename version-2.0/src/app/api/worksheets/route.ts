import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { department, shift_type, checklist_id } = body

    if (!department || !shift_type || !checklist_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get employee
    const { data: employee } = await supabase
      .from('employees')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    if (!employee.is_active) {
      return NextResponse.json({ error: 'Account not activated' }, { status: 403 })
    }

    // Get checklist template
    const { data: checklist } = await supabase
      .from('checklists')
      .select('*')
      .eq('id', checklist_id)
      .single()

    if (!checklist) {
      return NextResponse.json({ error: 'Checklist not found' }, { status: 404 })
    }

    // Create worksheet
    const { data: worksheet, error } = await supabase
      .from('worksheets')
      .insert({
        employee_id: employee.id,
        checklist_id: checklist_id,
        department: department,
        shift_type: shift_type,
        checklist_data: checklist.tasks || [],
        status: 'in_progress',
        completion_percentage: 0,
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating worksheet:', error)
      return NextResponse.json({ error: 'Failed to create worksheet' }, { status: 500 })
    }

    return NextResponse.json({ success: true, worksheet })
  } catch (error) {
    console.error('Error creating worksheet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get employee
    const { data: employee } = await supabase
      .from('employees')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Get worksheets based on role
    let query = supabase
      .from('worksheets')
      .select(`
        *,
        employee:employees(name, email, department),
        checklist:checklists(name, description)
      `)
      .order('created_at', { ascending: false })

    // If not manager/admin, only show own worksheets
    if (!['manager', 'admin'].includes(employee.role)) {
      query = query.eq('employee_id', employee.id)
    }

    const { data: worksheets, error } = await query

    if (error) {
      console.error('Error fetching worksheets:', error)
      return NextResponse.json({ error: 'Failed to fetch worksheets' }, { status: 500 })
    }

    return NextResponse.json({ success: true, worksheets })
  } catch (error) {
    console.error('Error fetching worksheets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
