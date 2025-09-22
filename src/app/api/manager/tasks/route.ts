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

    console.log('Manager tasks API: Starting fetch for user:', profile.role);

    // First, let's just try to get all tasks directly to see if any exist
    const { data: rawTasks, error: allTasksError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('All tasks found:', rawTasks?.length || 0);
    if (allTasksError) {
      console.error('Error fetching all tasks:', allTasksError);
    }

    // If there are no tasks at all, return empty array
    if (!rawTasks || rawTasks.length === 0) {
      console.log('No tasks found in database');
      return NextResponse.json([]);
    }

    // Simple master list - ALL tasks ever created  
    const formattedTasks = rawTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      departments: task.departments || [],
      created_at: task.created_at,
      updated_at: task.updated_at,
      archived: task.archived || false,
      requires_photo: task.requires_photo || false,
      requires_notes: task.requires_notes || false
    }));

    console.log('Returning formatted tasks:', formattedTasks.length);
    return NextResponse.json(formattedTasks);

  } catch (error) {
    console.error('Manager tasks API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}