import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { createClient } from '@supabase/supabase-js';
import { isManagerRole, UserRole, Department, ROLE_PERMISSIONS } from '../../../../types';

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
          created_at,
          departments
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

    // Also fetch unassigned tasks
    let unassignedTasks = [];
    let unassignedError = null;
    
    try {
      const assignedTaskIds = (assignments || []).map(a => a.task_id).filter(Boolean);
      
      if (assignedTaskIds.length > 0) {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .not('id', 'in', `(${assignedTaskIds.join(',')})`)
          .order('created_at', { ascending: false });
        unassignedTasks = data || [];
        unassignedError = error;
      } else {
        // If no assignments, get all tasks
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });
        unassignedTasks = data || [];
        unassignedError = error;
      }
    } catch (error) {
      console.error('Error fetching unassigned tasks:', error);
      unassignedError = error;
    }

    if (unassignedError) {
      console.error('Error fetching unassigned tasks:', unassignedError);
    }

    console.log('Debug - Assignments found:', assignments?.length || 0);
    console.log('Debug - Unassigned tasks found:', unassignedTasks?.length || 0);

    // Convert assignments to match the expected task format for the frontend
    const tasksWithAssignees = (assignments || []).map(assignment => {
      // Get departments from the task data
      const departments = assignment.task?.departments || ['BOH'];

      return {
        id: assignment.id,
        task: assignment.task?.title || 'Untitled Task',
        completed: assignment.status === 'completed',
        notes: assignment.task?.description || '',
        due_date: assignment.due_date,
        departments,
        assigned_to: assignment.assigned_to,
        created_at: assignment.created_at,
        updated_at: assignment.created_at,
        assignee: assignment.assignee,
        task_id: assignment.task_id
      };
    });

    // Convert unassigned tasks to the expected format
    const unassignedTasksFormatted = (unassignedTasks || []).map(task => ({
      id: `unassigned-${task.id}`,
      task: task.title,
      completed: false,
      notes: task.description || '',
      due_date: null,
      departments: task.departments || ['BOH'],
      assigned_to: null,
      created_at: task.created_at,
      updated_at: task.updated_at,
      assignee: null,
      task_id: task.id,
      unassigned: true
    }));

    // Combine assigned and unassigned tasks
    const allTasks = [...tasksWithAssignees, ...unassignedTasksFormatted];

    // Apply proper department filtering based on manager's role and permissions
    const userPermissions = ROLE_PERMISSIONS[profile.role as UserRole] || [];
    const filteredTasks = allTasks.filter(task => 
      task.departments.some((dept: Department) => userPermissions.includes(dept))
    );
    
    return NextResponse.json(filteredTasks);

  } catch (error) {
    console.error('Manager tasks API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}