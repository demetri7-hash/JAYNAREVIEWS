import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a manager
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (!profile || profile.role !== 'manager') {
      return NextResponse.json({ error: 'Manager access required' }, { status: 403 });
    }

    const body = await request.json();
    const { workflow_id, task_id, order_index, is_required } = body;

    if (!workflow_id || !task_id || order_index === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Add task to workflow
    const { data: workflowTask, error } = await supabaseAdmin
      .from('workflow_tasks')
      .insert([{
        workflow_id,
        task_id,
        order_index,
        is_required: is_required !== undefined ? is_required : true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding task to workflow:', error);
      return NextResponse.json({ error: 'Failed to add task to workflow' }, { status: 500 });
    }

    return NextResponse.json({ workflowTask });

  } catch (error) {
    console.error('Workflow task creation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const workflowId = url.searchParams.get('workflow_id');

    let query = supabaseAdmin
      .from('workflow_tasks')
      .select(`
        *,
        task:tasks(*)
      `)
      .order('order_index');

    if (workflowId) {
      query = query.eq('workflow_id', workflowId);
    }

    const { data: workflowTasks, error } = await query;

    if (error) {
      console.error('Error fetching workflow tasks:', error);
      return NextResponse.json({ error: 'Failed to fetch workflow tasks' }, { status: 500 });
    }

    return NextResponse.json({ workflowTasks });

  } catch (error) {
    console.error('Workflow tasks fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a manager
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (!profile || profile.role !== 'manager') {
      return NextResponse.json({ error: 'Manager access required' }, { status: 403 });
    }

    const url = new URL(request.url);
    const workflowTaskId = url.searchParams.get('id');

    if (!workflowTaskId) {
      return NextResponse.json({ error: 'Workflow task ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('workflow_tasks')
      .delete()
      .eq('id', workflowTaskId);

    if (error) {
      console.error('Error deleting workflow task:', error);
      return NextResponse.json({ error: 'Failed to delete workflow task' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Workflow task deletion error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}