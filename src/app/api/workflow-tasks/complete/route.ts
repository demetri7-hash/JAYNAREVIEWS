import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CompleteWorkflowTaskRequest } from '@/types/workflow';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin;
    const body: CompleteWorkflowTaskRequest = await request.json();
    
    // Validate required fields
    if (!body.workflow_assignment_id || !body.task_id) {
      return NextResponse.json({ 
        error: 'Workflow assignment ID and task ID are required' 
      }, { status: 400 });
    }

    // Verify the assignment belongs to the current user
    const { data: assignment, error: assignmentError } = await supabase
      .from('workflow_assignments')
      .select(`
        id,
        assigned_to,
        workflow_id,
        status
      `)
      .eq('id', body.workflow_assignment_id)
      .eq('assigned_to', session.user.id)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    if (assignment.status === 'completed') {
      return NextResponse.json({ 
        error: 'Workflow is already completed' 
      }, { status: 400 });
    }

    // Get workflow tasks for this workflow
    const { data: workflowTasks, error: tasksError } = await supabase
      .from('workflow_tasks')
      .select(`
        task_id,
        is_required,
        task:task_id(
          id,
          title,
          is_photo_mandatory,
          is_notes_mandatory
        )
      `)
      .eq('workflow_id', assignment.workflow_id);

    if (tasksError) {
      console.error('Error fetching workflow tasks:', tasksError);
      return NextResponse.json({ error: 'Failed to fetch workflow tasks' }, { status: 500 });
    }

    // Check if the task is part of this workflow
    const workflowTask = workflowTasks?.find(
      (wt: { task_id: string }) => wt.task_id === body.task_id
    );

    if (!workflowTask) {
      return NextResponse.json({ 
        error: 'Task is not part of this workflow' 
      }, { status: 400 });
    }

    // Check if photo is required but not provided
    if ((workflowTask as { task?: { is_photo_mandatory?: boolean } })?.task?.is_photo_mandatory && !body.photo_url) {
      return NextResponse.json({ 
        error: 'Photo is required for this task' 
      }, { status: 400 });
    }

    // Check if notes are required but not provided
    if ((workflowTask as { task?: { is_notes_mandatory?: boolean } })?.task?.is_notes_mandatory && !body.notes) {
      return NextResponse.json({ 
        error: 'Notes are required for this task' 
      }, { status: 400 });
    }

    // Check if task is already completed
    const { data: existingCompletion } = await supabase
      .from('workflow_task_completions')
      .select('id')
      .eq('workflow_assignment_id', body.workflow_assignment_id)
      .eq('task_id', body.task_id)
      .single();

    if (existingCompletion) {
      return NextResponse.json({ 
        error: 'Task is already completed' 
      }, { status: 400 });
    }

    // Create the task completion
    const { data: completion, error: completionError } = await supabase
      .from('workflow_task_completions')
      .insert({
        workflow_assignment_id: body.workflow_assignment_id,
        task_id: body.task_id,
        completed_by: session.user.id,
        notes: body.notes,
        photo_url: body.photo_url,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (completionError) {
      console.error('Error completing task:', completionError);
      return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 });
    }

    // Check if all required tasks are completed
    const { data: allCompletions } = await supabase
      .from('workflow_task_completions')
      .select('task_id')
      .eq('workflow_assignment_id', body.workflow_assignment_id);

    const completedTaskIds = allCompletions?.map(c => c.task_id) || [];
    const requiredTasks = workflowTasks?.filter((wt: { is_required: boolean }) => wt.is_required) || [];
    const allRequiredCompleted = requiredTasks.every((rt: { task_id: string }) => 
      completedTaskIds.includes(rt.task_id)
    );

    // If all required tasks are completed, mark the workflow assignment as completed
    if (allRequiredCompleted) {
      await supabase
        .from('workflow_assignments')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', body.workflow_assignment_id);
    }

    return NextResponse.json({ 
      completion,
      workflow_completed: allRequiredCompleted,
      message: allRequiredCompleted 
        ? 'Task completed and workflow finished!' 
        : 'Task completed successfully'
    });

  } catch (error) {
    console.error('Complete task API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}