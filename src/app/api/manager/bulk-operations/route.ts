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

    const { operation, taskIds, targetUserId } = await request.json();

    if (!operation || !taskIds || !Array.isArray(taskIds)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Verify manager has permission to modify these tasks
    const { data: tasksToModify, error: tasksError } = await supabase
      .from('checklist_items')
      .select('*')
      .in('id', taskIds);

    if (tasksError) {
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    // Check permissions for each task
    const userPermissions = getDepartmentPermissions(profile.role as UserRole);
    for (const task of tasksToModify || []) {
      const hasPermission = task.departments.some((dept: string) => 
        userPermissions.includes(dept as Department)
      );
      if (!hasPermission && profile.role !== 'manager') {
        return NextResponse.json({ 
          error: 'Insufficient permissions for some tasks' 
        }, { status: 403 });
      }
    }

    // Perform the operation
    let result;
    
    switch (operation) {
      case 'complete':
        result = await supabase
          .from('checklist_items')
          .update({ 
            completed: true,
            updated_at: new Date().toISOString()
          })
          .in('id', taskIds);
        break;

      case 'delete':
        result = await supabase
          .from('checklist_items')
          .delete()
          .in('id', taskIds);
        break;

      case 'reassign':
        if (!targetUserId) {
          return NextResponse.json({ error: 'Target user ID required for reassignment' }, { status: 400 });
        }
        result = await supabase
          .from('checklist_items')
          .update({ 
            assigned_to: targetUserId,
            updated_at: new Date().toISOString()
          })
          .in('id', taskIds);
        break;

      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    if (result.error) {
      console.error('Bulk operation error:', result.error);
      return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, affectedCount: taskIds.length });

  } catch (error) {
    console.error('Bulk operations API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}