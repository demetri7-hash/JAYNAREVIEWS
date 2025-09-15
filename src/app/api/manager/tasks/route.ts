import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { createClient } from '@supabase/supabase-js';
import { filterTasksByUserPermissions, isManagerRole, UserRole, Department } from '../../../../types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check role and permissions
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user is a manager
    if (!isManagerRole(profile.role as UserRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Fetch all assignments (tasks assigned to users) with task details
    const { data: assignments, error: assignmentsError } = await supabase
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
        assignee:assigned_to(
          id,
          name,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
    }

    // Convert assignments to match the expected task format for the frontend
    const tasksWithAssignees = (assignments || []).map(assignment => ({
      id: assignment.id,
      task: assignment.task?.title || 'Untitled Task',
      completed: assignment.status === 'completed',
      notes: assignment.task?.description || '',
      due_date: assignment.due_date,
      departments: ['BOH'] as Department[], // Default department - will need to be enhanced later
      assigned_to: assignment.assigned_to,
      created_at: assignment.created_at,
      updated_at: assignment.created_at,
      assignee: assignment.assignee
    }));

    // For now, managers can see all tasks (bypass department filtering until we implement it properly)
    // const filteredTasks = filterTasksByUserPermissions(tasksWithAssignees || [], profile.role as UserRole);
    
    return NextResponse.json(tasksWithAssignees);

  } catch (error) {
    console.error('Manager tasks API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}