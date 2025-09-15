import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { createClient } from '@supabase/supabase-js';
import { filterTasksByUserPermissions, isManagerRole, UserRole } from '../../../../types';

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

    // Fetch all tasks first
    const { data: tasks, error: tasksError } = await supabase
      .from('checklist_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    // Fetch user profiles separately to avoid join issues
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email, role');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch user profiles' }, { status: 500 });
    }

    // Combine tasks with assignee information
    const tasksWithAssignees = (tasks || []).map(task => ({
      ...task,
      assignee: profiles?.find(p => p.id === task.assigned_to) || null
    }));

    // Filter tasks based on manager's department permissions
    const filteredTasks = filterTasksByUserPermissions(tasksWithAssignees || [], profile.role as UserRole);

    return NextResponse.json(filteredTasks);

  } catch (error) {
    console.error('Manager tasks API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}