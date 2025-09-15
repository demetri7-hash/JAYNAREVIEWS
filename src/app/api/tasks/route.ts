import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const { title, description, frequency, requires_notes, requires_photo, assignees, due_date, due_time } = body

    if (!title || !frequency || !due_date || !due_time) {
      return NextResponse.json({ error: 'Title, frequency, due date, and due time are required' }, { status: 400 })
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

    // Create the task template
    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .insert([
        {
          title,
          description: description || null,
          requires_notes: requires_notes || false,
          requires_photo: requires_photo || false,
          created_by: profile.id
        }
      ])
      .select()
      .single()

    if (taskError) {
      console.error('Error creating task:', taskError)
      return NextResponse.json({ 
        error: 'Failed to create task',
        details: taskError.message 
      }, { status: 500 })
    }

    // If assignees are provided, create assignments
    if (assignees && Array.isArray(assignees) && assignees.length > 0) {
      // Combine date and time into a proper ISO string for Pacific timezone
      const dueDateTimeString = `${due_date}T${due_time}:00`
      const dueDateTime = new Date(dueDateTimeString)
      
      // Convert to UTC for storage (assuming input is Pacific time)
      const pacificOffset = -8 * 60 // Pacific Standard Time offset in minutes
      const utcDateTime = new Date(dueDateTime.getTime() - (pacificOffset * 60 * 1000))
      
      for (const assigneeId of assignees) {
        const { error: assignmentError } = await supabaseAdmin
          .from('assignments')
          .insert([
            {
              task_id: task.id,
              assigned_to: assigneeId,
              assigned_by: profile.id,
              due_date: utcDateTime.toISOString(),
              recurrence: frequency
            }
          ])

        if (assignmentError) {
          console.error('Error creating assignment for user:', assigneeId, assignmentError)
          // Don't fail the request, just log the error
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      task,
      message: 'Task created successfully'
    })

  } catch (error) {
    console.error('Task creation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: tasks, error } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        assignments(
          id,
          assigned_to,
          due_date,
          status
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    return NextResponse.json({ tasks })

  } catch (error) {
    console.error('Tasks fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

function getNextDueDate(frequency: string): string {
  const now = new Date()
  
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1)
      break
    case 'weekly':
      now.setDate(now.getDate() + 7)
      break
    case 'monthly':
      now.setMonth(now.getMonth() + 1)
      break
    case 'yearly':
      now.setFullYear(now.getFullYear() + 1)
      break
    case 'once':
    default:
      // For 'once', set due date to tomorrow by default
      now.setDate(now.getDate() + 1)
      break
  }
  
  return now.toISOString()
}