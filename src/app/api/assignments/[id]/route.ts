import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: assignmentId } = await params

    // Get the user's profile to verify they own this assignment
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (profileError || !profile) {
      console.error('Error finding user profile:', profileError)
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Fetch the specific assignment with task details and completion info
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('assignments')
      .select(`
        *,
        task:tasks(
          id,
          title,
          description,
          requires_notes,
          requires_photo,
          created_at
        ),
        completion:completions(
          id,
          notes,
          photo_url,
          completed_at,
          completed_by:profiles!completions_completed_by_fkey(
            name,
            email
          )
        )
      `)
      .eq('id', assignmentId)
      .eq('assigned_to', profile.id)
      .single()

    if (assignmentError) {
      console.error('Error fetching assignment:', assignmentError)
      return NextResponse.json({ 
        error: 'Assignment not found',
        details: assignmentError.message 
      }, { status: 404 })
    }

    // Calculate status
    const now = new Date()
    const dueDate = new Date(assignment.due_date)
    let status = assignment.status

    if (status === 'pending' && dueDate < now) {
      status = 'overdue'
    }

    return NextResponse.json({ 
      assignment: {
        ...assignment,
        status,
        completion: Array.isArray(assignment.completion) ? assignment.completion[0] : assignment.completion
      }
    })

  } catch (error) {
    console.error('Assignment fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}