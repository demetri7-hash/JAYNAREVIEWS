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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const date = searchParams.get('date'); // Optional date filter YYYY-MM-DD
    
    const offset = (page - 1) * limit;
    const supabase = supabaseAdmin;

    // Base query for completed workflow assignments
    let query = supabase
      .from('workflow_assignments')
      .select(`
        id,
        workflow_id,
        assigned_to,
        status,
        assigned_at,
        started_at,
        completed_at,
        workflow:workflow_id(
          id,
          name,
          description,
          created_by,
          is_repeatable,
          recurrence_type,
          due_date,
          due_time
        ),
        user:assigned_to(
          id,
          name,
          email
        ),
        workflow_task_completions(
          id,
          task_id,
          completed_by,
          notes,
          photo_url,
          completed_at,
          edited_by,
          edited_at,
          edit_history,
          task:task_id(
            id,
            title,
            description,
            tags,
            is_photo_mandatory,
            is_notes_mandatory
          ),
          completed_by_user:completed_by(
            id,
            name,
            email
          ),
          edited_by_user:edited_by(
            id,
            name,
            email
          )
        )
      `)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add date filter if specified
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query = query
        .gte('completed_at', startDate.toISOString())
        .lt('completed_at', endDate.toISOString());
    }

    const { data: assignments, error } = await query;

    if (error) {
      console.error('Error fetching finished workflows:', error);
      return NextResponse.json({ error: 'Failed to fetch finished workflows' }, { status: 500 });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('workflow_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      countQuery = countQuery
        .gte('completed_at', startDate.toISOString())
        .lt('completed_at', endDate.toISOString());
    }

    const { count } = await countQuery;

    // Enrich assignments with task completion details
    const enrichedAssignments = assignments?.map(assignment => {
      const workflowData = Array.isArray(assignment.workflow) ? assignment.workflow[0] : assignment.workflow;
      const userData = Array.isArray(assignment.user) ? assignment.user[0] : assignment.user;
      const completions = assignment.workflow_task_completions || [];

      // Sort completions by task order and completion time
      const sortedCompletions = completions.sort((a: { completed_at: string }, b: { completed_at: string }) => 
        new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
      );

      return {
        ...assignment,
        workflow: workflowData,
        user: userData,
        task_completions: sortedCompletions,
        total_tasks: completions.length
      };
    }) || [];

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      assignments: enrichedAssignments,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasMore: page < totalPages
      }
    });

  } catch (error) {
    console.error('Finished workflows API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}