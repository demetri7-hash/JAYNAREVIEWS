import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: assignmentId } = await params;
    const supabase = supabaseAdmin;

    // Get workflow assignment with workflow details
    const { data: assignment, error: assignmentError } = await supabase
      .from('workflow_assignments')
      .select(`
        *,
        workflows (
          id,
          name,
          description,
          due_date,
          due_time,
          is_repeatable,
          recurrence_type
        )
      `)
      .eq('id', assignmentId)
      .eq('assigned_to', session.user.id)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Get all tasks for this workflow with completion status
    const { data: tasks, error: tasksError } = await supabase
      .from('workflow_tasks')
      .select(`
        *,
        workflow_task_completions!left (
          completed_at,
          notes,
          photo_url
        )
      `)
      .eq('workflow_id', assignment.workflow_id)
      .eq('workflow_task_completions.assignment_id', assignmentId)
      .order('order_index', { ascending: true });

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    // Calculate progress
    const completedTasks = tasks?.filter(task => 
      task.workflow_task_completions && 
      task.workflow_task_completions.length > 0 && 
      task.workflow_task_completions[0]?.completed_at
    ) || [];
    
    const progress = {
      completed: completedTasks.length,
      total: tasks?.length || 0,
      percentage: tasks?.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0
    };

    // Format the response
    const response = {
      id: assignment.id,
      workflow_id: assignment.workflow_id,
      status: assignment.status,
      assigned_at: assignment.assigned_at,
      started_at: assignment.started_at,
      completed_at: assignment.completed_at,
      workflow: {
        id: assignment.workflows.id,
        name: assignment.workflows.name,
        description: assignment.workflows.description,
        due_date: assignment.workflows.due_date,
        due_time: assignment.workflows.due_time,
        is_repeatable: assignment.workflows.is_repeatable,
        recurrence_type: assignment.workflows.recurrence_type
      },
      tasks: tasks?.map(task => {
        const completion = task.workflow_task_completions?.[0];
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          is_required: Boolean(task.is_required),
          is_photo_mandatory: Boolean(task.is_photo_mandatory),
          is_notes_mandatory: Boolean(task.is_notes_mandatory),
          order_index: task.order_index,
          completed_at: completion?.completed_at,
          notes: completion?.notes,
          photo_url: completion?.photo_url
        };
      }) || [],
      progress
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching workflow assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}