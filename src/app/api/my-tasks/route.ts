import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's profile to get their UUID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (profileError || !profile) {
      console.error('Error finding user profile:', profileError)
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Fetch assignments for this user with task details
    const { data: assignments, error: assignmentsError } = await supabaseAdmin
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
        )
      `)
      .eq('assigned_to', profile.id)
      .order('due_date', { ascending: true })

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError)
      return NextResponse.json({ 
        error: 'Failed to fetch assignments',
        details: assignmentsError.message 
      }, { status: 500 })
    }

    // Calculate status for each assignment
    const now = new Date()
    console.log('Current time for overdue calculation:', now.toISOString())
    
    const assignmentsWithStatus = assignments.map(assignment => {
      const dueDate = new Date(assignment.due_date)
      console.log('Checking assignment due date:', assignment.due_date, 'parsed as:', dueDate.toISOString())
      
      let status = assignment.status

      // If not manually completed, check if overdue
      // Only mark as overdue if the due date/time has actually passed
      if (status === 'pending' && dueDate < now) {
        console.log('Marking as overdue:', assignment.due_date)
        status = 'overdue'
      } else if (status === 'pending') {
        console.log('Keeping as pending:', assignment.due_date)
      }

      return {
        ...assignment,
        status
      }
    })

    return NextResponse.json({ 
      assignments: assignmentsWithStatus,
      total: assignmentsWithStatus.length,
      pending: assignmentsWithStatus.filter(a => a.status === 'pending').length,
      completed: assignmentsWithStatus.filter(a => a.status === 'completed').length,
      overdue: assignmentsWithStatus.filter(a => a.status === 'overdue').length
    })

  } catch (error) {
    console.error('My tasks fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}