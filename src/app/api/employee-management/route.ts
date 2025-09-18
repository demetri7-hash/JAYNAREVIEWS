import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get all users with basic info
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        name,
        role,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('Users fetch error:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Get department permissions
    const { data: permissions, error: permError } = await supabase
      .from('role_permissions')
      .select('*')

    // Get user permission overrides
    const { data: overrides, error: overrideError } = await supabase
      .from('user_permission_overrides')
      .select(`
        *,
        user:profiles!user_permission_overrides_user_id_fkey(name, email),
        granted_by_user:profiles!user_permission_overrides_granted_by_fkey(name)
      `)

    return NextResponse.json({
      users: users || [],
      permissions: permissions || [],
      overrides: overrides || []
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
            // Store employee data in a JSONB column if it exists, or we can add it later
          })
          .eq('id', userId)

        if (linkError) throw linkError

        return NextResponse.json({ success: true })

      case 'update_permissions':
        // Handle permission updates for existing tables
        const { error: permError } = await supabase
          .from('user_permission_overrides')
          .upsert({
            user_id: userId,
            department: data.department,
            access_granted: data.accessGranted,
            granted_by: data.performedBy,
            granted_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,department'
          })

        if (permError) throw permError

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 })
  }
}