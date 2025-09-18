import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all'; // all, pending, in_progress, completed
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get user's workflow assignments with related data
    let query = supabase
      .from('workflow_assignments')
      .select(`
        id,
        workflow_id,
        user_id,
        status,
        assigned_at,
        started_at,
        completed_at,
        workflow:workflow_id(
          id,
          name,
          description,
          is_repeatable,
          recurrence_type,
          due_date,
          due_time,
          workflow_tasks(
            id,
            task_id,
            order_index,
            is_required,
            task:task_id(
              id,
              title,
              description,
              tags,
              is_photo_mandatory,
              is_notes_mandatory
            )
          )
        ),
        workflow_task_completions(
          id,
          task_id,
          completed_by,
          notes,
          photo_url,
          completed_at,
          task:task_id(
            id,
            title
          )
        )
      `)
      .eq('user_id', session.user.id)
      .limit(limit)
      .order('assigned_at', { ascending: false });

    // Filter by status if specified
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: assignments, error } = await query;

    if (error) {
      console.error('Error fetching user workflows:', error);
      return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
    }

    // Calculate completion progress for each assignment
    const enrichedAssignments = assignments?.map(assignment => {
      // The workflow relationship returns an array, so we take the first item
      const workflowData = Array.isArray(assignment.workflow) ? assignment.workflow[0] : assignment.workflow;
      const completions = assignment.workflow_task_completions || [];
      const workflowTasks = workflowData?.workflow_tasks || [];
      const totalTasks = workflowTasks.length;
      const completedTasks = completions.length;
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Find next task to complete
      const completedTaskIds = completions.map((c: { task_id: string }) => c.task_id);
      const nextTask = workflowTasks
        .filter((wt: { task_id: string }) => !completedTaskIds.includes(wt.task_id))
        .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)?.[0];

      return {
        ...assignment,
        progress: {
          completed: completedTasks,
          total: totalTasks,
          percentage: progressPercentage
        },
        nextTask: nextTask ? {
          id: nextTask.task_id,
          title: (nextTask as { task?: { title?: string } }).task?.title || '',
          description: (nextTask as { task?: { description?: string } }).task?.description,
          is_required: nextTask.is_required,
          is_photo_mandatory: (nextTask as { task?: { is_photo_mandatory?: boolean } }).task?.is_photo_mandatory || false,
          is_notes_mandatory: (nextTask as { task?: { is_notes_mandatory?: boolean } }).task?.is_notes_mandatory || false
        } : null
      };
    }) || [];

    return NextResponse.json({ 
      assignments: enrichedAssignments,
      total: enrichedAssignments.length 
    });

  } catch (error) {
    console.error('My workflows API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST endpoint to start a workflow (change status from pending to in_progress)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin;
    const body = await request.json();
    
    if (!body.assignment_id) {
      return NextResponse.json({ 
        error: 'Assignment ID is required' 
      }, { status: 400 });
    }

    // Verify the assignment belongs to the current user
    const { data: assignment, error: fetchError } = await supabase
      .from('workflow_assignments')
      .select('id, user_id, status')
      .eq('id', body.assignment_id)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    if (assignment.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Workflow is already started or completed' 
      }, { status: 400 });
    }

    // Update assignment status to in_progress
    const { data: updatedAssignment, error: updateError } = await supabase
      .from('workflow_assignments')
      .update({ 
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', body.assignment_id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error starting workflow:', updateError);
      return NextResponse.json({ error: 'Failed to start workflow' }, { status: 500 });
    }

    return NextResponse.json({ 
      assignment: updatedAssignment,
      message: 'Workflow started successfully' 
    });

  } catch (error) {
    console.error('Start workflow API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}