import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CreateWorkflowRequest } from '@/types/workflow';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin;
    
    // Check if user has manager permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get all workflows with task counts - use simpler query to avoid join issues
    const { data: workflows, error } = await supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workflows:', error);
      return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
    }

    return NextResponse.json({ workflows });

  } catch (error) {
    console.error('Workflows API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin;
    
    // Check if user has manager permissions and get user ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body: CreateWorkflowRequest = await request.json();
    
    // For now, remove the tasks requirement since we'll handle it differently
    if (!body.name) {
      return NextResponse.json({ 
        error: 'Missing required fields: name is required' 
      }, { status: 400 });
    }

    // Create the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .insert({
        name: body.name,
        description: body.description || null,
        departments: body.departments || [],
        roles: body.roles || [],
        assigned_users: body.assigned_users || [],
        is_repeatable: body.is_repeatable || false,
        recurrence_type: body.recurrence_type || null,
        due_date: body.due_date || null,
        due_time: body.due_time || null,
        is_active: true,
        created_by: profile.id
      })
      .select()
      .single();

    if (workflowError) {
      console.error('Error creating workflow:', workflowError);
      console.error('Workflow data:', {
        name: body.name,
        description: body.description,
        departments: body.departments,
        roles: body.roles,
        assigned_users: body.assigned_users,
        profile_id: profile.id
      });
      return NextResponse.json({ 
        error: 'Failed to create workflow', 
        details: workflowError.message 
      }, { status: 500 });
    }

    // Create workflow tasks if they are provided
    if (body.tasks && body.tasks.length > 0) {
      const workflowTasks = body.tasks.map((task, index) => ({
        workflow_id: workflow.id,
        task_id: task.task_id,
        order_index: task.order_index ?? index,
        is_required: task.is_required ?? true
      }));

      const { error: tasksError } = await supabase
        .from('workflow_tasks')
        .insert(workflowTasks);

      if (tasksError) {
        console.error('Error creating workflow tasks:', tasksError);
        // Rollback workflow creation
        await supabase.from('workflows').delete().eq('id', workflow.id);
        return NextResponse.json({ error: 'Failed to create workflow tasks' }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      workflow,
      message: 'Workflow created successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Create workflow API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}