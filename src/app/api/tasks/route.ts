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
    
    const { title, description, frequency, notes_required, photos_required, assigned_to } = body

    if (!title || !frequency) {
      return NextResponse.json({ error: 'Title and frequency are required' }, { status: 400 })
    }

    // Create the task template
    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .insert([
        {
          title,
          description: description || null,
          frequency,
          notes_required: notes_required || false,
          photos_required: photos_required || false,
          created_by: session.user.email
        }
      ])
      .select()
      .single()

    if (taskError) {
      console.error('Error creating task:', taskError)
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }

    // If assigned_to is provided, create an assignment
    if (assigned_to && assigned_to.trim()) {
      const { error: assignmentError } = await supabaseAdmin
        .from('assignments')
        .insert([
          {
            task_id: task.id,
            assigned_to: assigned_to.trim(),
            assigned_by: session.user.email,
            due_date: getNextDueDate(frequency)
          }
        ])

      if (assignmentError) {
        console.error('Error creating assignment:', assignmentError)
        // Don't fail the request, just log the error
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
      error: 'Internal server error' 
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