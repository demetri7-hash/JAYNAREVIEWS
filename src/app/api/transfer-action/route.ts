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

    const { transferId, action, response } = await request.json()

    if (!transferId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        error: 'Transfer ID and valid action (approve/reject) are required' 
      }, { status: 400 })
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

    // Get the transfer request with related data
    const { data: transfer, error: transferError } = await supabase
      .from('task_transfers')
      .select(`
        id,
        assignment_id,
        from_user_id,
        to_user_id,
        status,
        assignment:assignment_id (
          id,
          assigned_to,
          task:task_id (
            title
          )
        )
      `)
      .eq('id', transferId)
      .single()

    if (transferError || !transfer) {
      return NextResponse.json({ error: 'Transfer request not found' }, { status: 404 })
    }

    // Check authorization based on current status and user role
    let canTakeAction = false
    let newStatus = ''
    let updateFields: Record<string, string> = {}

    if (transfer.status === 'pending_transferee' && transfer.to_user_id === currentUser.id) {
      // Transferee can approve/reject
      canTakeAction = true
      if (action === 'approve') {
        newStatus = 'pending_manager'
        updateFields = {
          status: newStatus,
          transferee_responded_at: new Date().toISOString(),
          transferee_response: response || null
        }
      } else {
        newStatus = 'rejected'
        updateFields = {
          status: newStatus,
          transferee_responded_at: new Date().toISOString(),
          transferee_response: response || null
        }
      }
    } else if (transfer.status === 'pending_manager' && currentUser.role === 'manager') {
      // Manager can approve/reject
      canTakeAction = true
      if (action === 'approve') {
        newStatus = 'approved'
        updateFields = {
          status: newStatus,
          manager_responded_at: new Date().toISOString(),
          manager_response: response || null
        }
      } else {
        newStatus = 'rejected'
        updateFields = {
          status: newStatus,
          manager_responded_at: new Date().toISOString(),
          manager_response: response || null
        }
      }
    }

    if (!canTakeAction) {
      return NextResponse.json({ 
        error: 'You are not authorized to take action on this transfer request' 
      }, { status: 403 })
    }

    // Update the transfer request
    const { error: updateError } = await supabase
      .from('task_transfers')
      .update(updateFields)
      .eq('id', transferId)

    if (updateError) {
      console.error('Error updating transfer:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update transfer request' 
      }, { status: 500 })
    }

    // If fully approved, update the assignment
    if (newStatus === 'approved') {
      const { error: assignmentError } = await supabase
        .from('assignments')
        .update({ 
          assigned_to: transfer.to_user_id,
          status: 'pending' // Reset to pending for new assignee
        })
        .eq('id', transfer.assignment_id)

      if (assignmentError) {
        console.error('Error updating assignment:', assignmentError)
        return NextResponse.json({ 
          error: 'Transfer approved but failed to update task assignment' 
        }, { status: 500 })
      }
    }

    const actionText = action === 'approve' ? 'approved' : 'rejected'
    const statusText = newStatus === 'pending_manager' 
      ? 'approved and sent to manager for final approval'
      : actionText

    return NextResponse.json({ 
      success: true, 
      message: `Transfer request has been ${statusText}`,
      newStatus 
    })

  } catch (error) {
    console.error('Transfer action error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}