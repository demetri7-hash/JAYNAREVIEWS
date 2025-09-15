import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { createClient } from '@supabase/supabase-js';
import { isManagerRole, UserRole, getDepartmentPermissions, Department } from '../../../../types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
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

    const { taskId, targetUserId } = await request.json();

    if (!taskId || !targetUserId) {
      return NextResponse.json({ error: 'Task ID and target user ID required' }, { status: 400 });
    }

    // Verify manager has permission to modify this task
    const { data: task, error: taskError } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check permissions for the task
    const userPermissions = getDepartmentPermissions(profile.role as UserRole);
    const hasPermission = task.departments.some((dept: string) => 
      userPermissions.includes(dept as Department)
    );
    
    if (!hasPermission && profile.role !== 'manager') {
      return NextResponse.json({ 
        error: 'Insufficient permissions for this task' 
      }, { status: 403 });
    }

    // Reassign the task
    const { error: updateError } = await supabase
      .from('checklist_items')
      .update({ 
        assigned_to: targetUserId,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (updateError) {
      console.error('Task reassignment error:', updateError);
      return NextResponse.json({ error: 'Failed to reassign task' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Task reassignment API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}