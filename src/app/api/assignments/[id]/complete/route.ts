import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: assignmentId } = await params
    const body = await request.json()
    const { notes, photo_count } = body

    // Get the user's profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (profileError || !profile) {
      console.error('Error finding user profile:', profileError)
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Verify the assignment belongs to this user
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('assignments')
      .select('id, task_id, assigned_to')
      .eq('id', assignmentId)
      .eq('assigned_to', profile.id)
      .single()

    if (assignmentError || !assignment) {
      console.error('Error finding assignment:', assignmentError)
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Create completion record
    const { data: completion, error: completionError } = await supabaseAdmin
      .from('completions')
      .insert([
        {
          assignment_id: assignmentId,
          completed_by: profile.id,
          completed_at: new Date().toISOString(),
          notes: notes || null,
          photo_count: photo_count || 0
        }
      ])
      .select()
      .single()

    if (completionError) {
      console.error('Error creating completion:', completionError)
      return NextResponse.json({ 
        error: 'Failed to create completion record',
        details: completionError.message 
      }, { status: 500 })
    }

    // Update assignment status to completed
    const { error: updateError } = await supabaseAdmin
      .from('assignments')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId)

    if (updateError) {
      console.error('Error updating assignment status:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update assignment status',
        details: updateError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      completion,
      message: 'Task completed successfully'
    })

  } catch (error) {
    console.error('Task completion error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}