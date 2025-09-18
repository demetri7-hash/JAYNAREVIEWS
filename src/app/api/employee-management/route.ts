import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {    
    // Get all users
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Get department permissions
    const { data: permissions } = await supabase
      .from('role_permissions')
      .select('*')

    // Get user permission overrides
    const { data: overrides } = await supabase
      .from('user_permission_overrides')
      .select('*')

    return NextResponse.json({
      success: true,
      users: users || [],
      permissions: permissions || [],
      overrides: overrides || []
    })

  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, data } = body

    switch (action) {
      case 'update_role':
        const { error: roleError } = await supabase
          .from('profiles')
          .update({ role: data.role })
          .eq('id', userId)

        if (roleError) throw roleError

        return NextResponse.json({ success: true })

      case 'link_employee':
        // Update profiles table with TOAST employee ID
        const { error: linkError } = await supabase
          .from('profiles')
          .update({ 
            toast_employee_id: data.toastEmployeeId,
          })
          .eq('id', userId)

        if (linkError) throw linkError

        // Log the linking activity
        await supabase
          .from('employee_activity_log')
          .insert({
            user_id: userId,
            action_type: 'link_employee',
            action_details: { toast_employee_id: data.toastEmployeeId },
            performed_by: userId // In a real scenario, this would be the manager's ID
          })

        return NextResponse.json({ success: true })

      case 'archive_user':
        const { error: archiveError } = await supabase
          .from('profiles')
          .update({ 
            employee_status: 'archived',
            archived_at: new Date().toISOString(),
            archived_by: userId // In a real scenario, this would be the manager's ID
          })
          .eq('id', userId)

        if (archiveError) throw archiveError

        // Log the archiving activity
        await supabase
          .from('employee_activity_log')
          .insert({
            user_id: userId,
            action_type: 'archive',
            action_details: { reason: 'User archived by manager' },
            performed_by: userId // In a real scenario, this would be the manager's ID
          })

        return NextResponse.json({ success: true })

      case 'restore_user':
        const { error: restoreError } = await supabase
          .from('profiles')
          .update({ 
            employee_status: 'active',
            archived_at: null,
            archived_by: null
          })
          .eq('id', userId)

        if (restoreError) throw restoreError

        // Log the restoration activity
        await supabase
          .from('employee_activity_log')
          .insert({
            user_id: userId,
            action_type: 'restore',
            action_details: { reason: 'User restored by manager' },
            performed_by: userId // In a real scenario, this would be the manager's ID
          })

        return NextResponse.json({ success: true })

      case 'update_permissions':
        // Handle permission updates - store as array of departments
        if (data.departments && Array.isArray(data.departments)) {
          // Delete existing overrides
          await supabase
            .from('user_permission_overrides')
            .delete()
            .eq('user_id', userId)

          // Insert new overrides
          const overrides = data.departments.map((department: string) => ({
            user_id: userId,
            department: department,
            access_granted: true
          }))

          const { error: permError } = await supabase
            .from('user_permission_overrides')
            .insert(overrides)

          if (permError) throw permError
        }

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 })
  }
}