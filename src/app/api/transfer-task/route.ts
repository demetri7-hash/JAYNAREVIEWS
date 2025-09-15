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

    const { assignmentId, toUserId, reason } = await request.json()

    if (!assignmentId || !toUserId) {
      return NextResponse.json({ 
        error: 'Assignment ID and target user ID are required' 
      }, { status: 400 })
    }

    // Get the current user's profile
    const { data: currentUser, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify the assignment belongs to the current user
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('id, assigned_to, status')
      .eq('id', assignmentId)
      .eq('assigned_to', currentUser.id)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json({ 
        error: 'Assignment not found or not assigned to you' 
      }, { status: 404 })
    }

    // Check if assignment is already completed
    if (assignment.status === 'completed') {
      return NextResponse.json({ 
        error: 'Cannot transfer completed tasks' 
      }, { status: 400 })
    }

    // Check if there's already a pending transfer for this assignment
    const { data: existingTransfer } = await supabase
      .from('task_transfers')
      .select('id')
      .eq('assignment_id', assignmentId)
      .in('status', ['pending_transferee', 'pending_manager'])
      .single()

    if (existingTransfer) {
      return NextResponse.json({ 
        error: 'A transfer request is already pending for this task' 
      }, { status: 400 })
    }

    // Verify target user exists
    const { data: targetUser, error: targetError } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('id', toUserId)
      .single()

    if (targetError || !targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    // Create the transfer request
    const { data: transfer, error: transferError } = await supabase
      .from('task_transfers')
      .insert({
        assignment_id: assignmentId,
        from_user_id: currentUser.id,
        to_user_id: toUserId,
        requested_by: currentUser.id,
        transfer_reason: reason || null,
        status: 'pending_transferee'
      })
      .select()
      .single()

    if (transferError) {
      console.error('Transfer creation error:', transferError)
      return NextResponse.json({ 
        error: 'Failed to create transfer request' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      transfer,
      message: `Transfer request sent to ${targetUser.name}. Awaiting their approval.`
    })

  } catch (error) {
    console.error('Transfer request error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}