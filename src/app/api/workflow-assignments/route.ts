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
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Manager access required' }, { status: 403 });
    }

    const body = await request.json();
    const { workflow_id, assigned_to, due_date } = body;

    if (!workflow_id || !assigned_to) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get workflow details
    const { data: workflow, error: workflowError } = await supabaseAdmin
      .from('workflows')
      .select('*')
      .eq('id', workflow_id)
      .single();

    if (workflowError || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Calculate due date based on workflow recurrence if not provided
    let calculatedDueDate = due_date;
    if (!calculatedDueDate && workflow.is_repeatable) {
      calculatedDueDate = calculateNextDueDate(workflow.recurrence_type, workflow.due_time);
    } else if (!calculatedDueDate && workflow.due_date) {
      calculatedDueDate = workflow.due_date;
    } else if (!calculatedDueDate) {
      calculatedDueDate = new Date().toISOString().split('T')[0]; // Today
    }

    // Create workflow assignment
    const { data: assignment, error } = await supabaseAdmin
      .from('workflow_assignments')
      .insert([{
        workflow_id,
        assigned_to,
        assigned_by: profile.id,
        due_date: calculatedDueDate,
        status: 'pending'
      }])
      .select(`
        *,
        workflow:workflows(*),
        assignee:profiles!assigned_to(id, name, email, role),
        assigner:profiles!assigned_by(id, name, email)
      `)
      .single();

    if (error) {
      console.error('Error creating workflow assignment:', error);
      return NextResponse.json({ error: 'Failed to create workflow assignment' }, { status: 500 });
    }

    return NextResponse.json({ assignment });

  } catch (error) {
    console.error('Workflow assignment creation error:', error);
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
    const userId = url.searchParams.get('user_id');
    const status = url.searchParams.get('status');
    const workflowId = url.searchParams.get('workflow_id');

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    let query = supabaseAdmin
      .from('workflow_assignments')
      .select(`
        *,
        workflow:workflows(*),
        assignee:profiles!assigned_to(id, name, email, role),
        assigner:profiles!assigned_by(id, name, email)
      `);

    // If not a manager, only show user's own assignments
    if (!['manager', 'admin'].includes(profile.role)) {
      query = query.eq('assigned_to', profile.id);
    } else if (userId) {
      query = query.eq('assigned_to', userId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (workflowId) {
      query = query.eq('workflow_id', workflowId);
    }

    const { data: assignments, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workflow assignments:', error);
      return NextResponse.json({ error: 'Failed to fetch workflow assignments' }, { status: 500 });
    }

    return NextResponse.json({ assignments });

  } catch (error) {
    console.error('Workflow assignments fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { assignment_id, status, started_at, completed_at } = body;

    if (!assignment_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Check if user has permission to update this assignment
    const { data: assignment } = await supabaseAdmin
      .from('workflow_assignments')
      .select('assigned_to')
      .eq('id', assignment_id)
      .single();

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Users can only update their own assignments, managers can update any
    if (!['manager', 'admin'].includes(profile.role) && assignment.assigned_to !== profile.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const updateData: {
      status: string;
      started_at?: string;
      completed_at?: string;
      next_due_date?: string;
    } = { status };
    
    if (started_at) {
      updateData.started_at = started_at;
    }
    
    if (completed_at) {
      updateData.completed_at = completed_at;
    }

    const { data: updatedAssignment, error } = await supabaseAdmin
      .from('workflow_assignments')
      .update(updateData)
      .eq('id', assignment_id)
      .select(`
        *,
        workflow:workflows(*),
        assignee:profiles!assigned_to(id, name, email, role),
        assigner:profiles!assigned_by(id, name, email)
      `)
      .single();

    if (error) {
      console.error('Error updating workflow assignment:', error);
      return NextResponse.json({ error: 'Failed to update workflow assignment' }, { status: 500 });
    }

    return NextResponse.json({ assignment: updatedAssignment });

  } catch (error) {
    console.error('Workflow assignment update error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Helper function to calculate next due date based on recurrence
function calculateNextDueDate(currentDate: Date, recurrenceType: string): Date {
  const now = new Date(currentDate);
  
  switch (recurrenceType) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      return now;
    case 'weekly':
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      return nextWeek;
    case 'monthly':
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);
      return nextMonth;
    default:
      return now;
  }
}