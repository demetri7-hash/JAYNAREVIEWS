import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UpdateWorkflowRequest } from '@/types/workflow';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin;
    
    // Check if user has manager permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get workflow with all related data
    const { data: workflow, error } = await supabase
      .from('workflows')
      .select(`
        *,
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
        ),
        workflow_assignments(
          id,
          user_id,
          assigned_at,
          status,
          user:user_id(
            id,
            full_name,
            email,
            role,
            department
          )
        ),
        creator:created_by(
          id,
          full_name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
      }
      console.error('Error fetching workflow:', error);
      return NextResponse.json({ error: 'Failed to fetch workflow' }, { status: 500 });
    }

    return NextResponse.json({ workflow });

  } catch (error) {
    console.error('Get workflow API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin;
    
    // Check if user has manager permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body: UpdateWorkflowRequest = await request.json();
    
    // Update the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .update({
        name: body.name,
        description: body.description,
        departments: body.departments,
        roles: body.roles,
        assigned_users: body.assigned_users,
        is_repeatable: body.is_repeatable,
        recurrence_type: body.recurrence_type,
        due_date: body.due_date,
        due_time: body.due_time,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (workflowError) {
      if (workflowError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
      }
      console.error('Error updating workflow:', workflowError);
      return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 });
    }

    // If tasks are provided, update workflow tasks
    if (body.tasks) {
      // Delete existing workflow tasks
      await supabase
        .from('workflow_tasks')
        .delete()
        .eq('workflow_id', id);

      // Insert new workflow tasks
      const workflowTasks = body.tasks.map((task, index) => ({
        workflow_id: id,
        task_id: task.task_id,
        order_index: task.order_index ?? index,
        is_required: task.is_required ?? true
      }));

      const { error: tasksError } = await supabase
        .from('workflow_tasks')
        .insert(workflowTasks);

      if (tasksError) {
        console.error('Error updating workflow tasks:', tasksError);
        return NextResponse.json({ error: 'Failed to update workflow tasks' }, { status: 500 });
      }
    }

    // Update workflow assignments if departments/roles/users changed
    if (body.departments !== undefined || body.roles !== undefined || body.assigned_users !== undefined) {
      // Delete existing assignments
      await supabase
        .from('workflow_assignments')
        .delete()
        .eq('workflow_id', id);

      // Create new assignments
      const assignments = [];
      
      // Get users for departments
      if (body.departments && body.departments.length > 0) {
        const { data: deptUsers } = await supabase
          .from('profiles')
          .select('id')
          .in('department', body.departments);
        
        if (deptUsers) {
          assignments.push(...deptUsers.map((user: { id: string }) => ({
            workflow_id: id,
            user_id: user.id
          })));
        }
      }

      // Get users for roles
      if (body.roles && body.roles.length > 0) {
        const { data: roleUsers } = await supabase
          .from('profiles')
          .select('id')
          .in('role', body.roles);
        
        if (roleUsers) {
          assignments.push(...roleUsers.map((user: { id: string }) => ({
            workflow_id: id,
            user_id: user.id
          })));
        }
      }

      // Add specific users
      if (body.assigned_users && body.assigned_users.length > 0) {
        assignments.push(...body.assigned_users.map(userId => ({
          workflow_id: id,
          user_id: userId
        })));
      }

      // Remove duplicates and insert assignments
      const uniqueAssignments = assignments.filter((assignment, index, self) => 
        index === self.findIndex(a => a.user_id === assignment.user_id)
      );

      if (uniqueAssignments.length > 0) {
        const { error: assignmentsError } = await supabase
          .from('workflow_assignments')
          .insert(uniqueAssignments);

        if (assignmentsError) {
          console.error('Error updating workflow assignments:', assignmentsError);
          // Don't fail here as the workflow update was successful
        }
      }
    }

    return NextResponse.json({ 
      workflow,
      message: 'Workflow updated successfully' 
    });

  } catch (error) {
    console.error('Update workflow API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin;
    
    // Check if user has manager permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if workflow exists
    const { data: existingWorkflow } = await supabase
      .from('workflows')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingWorkflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Delete the workflow (cascading deletes will handle related records)
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting workflow:', error);
      return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Workflow deleted successfully' 
    });

  } catch (error) {
    console.error('Delete workflow API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}