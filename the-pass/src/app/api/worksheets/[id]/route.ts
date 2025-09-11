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
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Get worksheet data
    const { data: worksheet, error } = await supabase
      .from('worksheets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Worksheet not found' }, { status: 404 })
    }

    // Verify user has access to this worksheet (either created it or is manager/admin)
    const { data: employee } = await supabase
      .from('employees')
      .select('id, role')
      .eq('email', session.user.email)
      .single()

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    const isOwner = worksheet.employee_id === employee.id
    const isManagerOrAdmin = ['manager', 'admin'].includes(employee.role)

    if (!isOwner && !isManagerOrAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ success: true, worksheet })
  } catch (error) {
    console.error('Error fetching worksheet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { checklist_data, completion_percentage, status } = body

    // Get current worksheet
    const { data: worksheet, error: fetchError } = await supabase
      .from('worksheets')
      .select('employee_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Worksheet not found' }, { status: 404 })
    }

    // Get employee
    const { data: employee } = await supabase
      .from('employees')
      .select('id, role')
      .eq('email', session.user.email)
      .single()

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Verify access
    const isOwner = worksheet.employee_id === employee.id
    const isManagerOrAdmin = ['manager', 'admin'].includes(employee.role)

    if (!isOwner && !isManagerOrAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update worksheet
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (checklist_data) updateData.checklist_data = checklist_data
    if (completion_percentage !== undefined) updateData.completion_percentage = completion_percentage
    if (status) updateData.status = status

    // Set completed_at if status is completed
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('worksheets')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      console.error('Error updating worksheet:', updateError)
      return NextResponse.json({ error: 'Failed to update worksheet' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating worksheet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
