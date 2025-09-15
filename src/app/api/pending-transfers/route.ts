import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current user's profile
    const { data: currentUser, error: userError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', session.user.email)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let query = supabase
      .from('task_transfers')
      .select(`
        id,
        assignment_id,
        from_user_id,
        to_user_id,
        status,
        transfer_reason,
        requested_at,
        transferee_responded_at,
        manager_responded_at,
        from_user:from_user_id (
          id,
          name,
          email
        ),
        to_user:to_user_id (
          id,
          name,
          email
        ),
        assignment:assignment_id (
          id,
          due_date,
          task:task_id (
            id,
            title,
            description,
            requires_notes,
            requires_photo
          )
        )
      `)

    // Filter based on user role and involvement
    if (currentUser.role === 'manager') {
      // Managers see all transfers that need their approval or are in their oversight
      query = query.or(`status.eq.pending_manager,and(status.eq.pending_transferee,to_user_id.eq.${currentUser.id})`)
    } else {
      // Staff see transfers assigned to them that need their approval
      query = query.eq('to_user_id', currentUser.id).eq('status', 'pending_transferee')
    }

    const { data: transfers, error: transfersError } = await query
      .order('requested_at', { ascending: false })

    if (transfersError) {
      console.error('Error fetching transfers:', transfersError)
      return NextResponse.json({ 
        error: 'Failed to fetch transfer requests' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      transfers: transfers || []
    })

  } catch (error) {
    console.error('Pending transfers fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}