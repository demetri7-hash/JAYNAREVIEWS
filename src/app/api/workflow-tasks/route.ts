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
    const workflowId = url.searchParams.get('workflow_id');

    if (!workflowTaskId && !workflowId) {
      return NextResponse.json({ error: 'Workflow task ID or workflow ID required' }, { status: 400 });
    }

    let deleteQuery = supabaseAdmin.from('workflow_tasks').delete();

    if (workflowTaskId) {
      deleteQuery = deleteQuery.eq('id', workflowTaskId);
    } else if (workflowId) {
      deleteQuery = deleteQuery.eq('workflow_id', workflowId);
    }

    const { error } = await deleteQuery;

    if (error) {
      console.error('Error deleting workflow task(s):', error);
      return NextResponse.json({ error: 'Failed to delete workflow task(s)' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Workflow task deletion error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}