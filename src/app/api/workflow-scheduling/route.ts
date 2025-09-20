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
    const { workflow_id, user_ids, start_date, end_date } = body;

    if (!workflow_id || !user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json({ error: 'Missing required fields: workflow_id and user_ids' }, { status: 400 });
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

    const assignments = [];
    const startDate = start_date ? new Date(start_date) : new Date();
    const endDate = end_date ? new Date(end_date) : null;

    for (const userId of user_ids) {
      if (workflow.is_repeatable) {
        // Create recurring assignments
        const recurringAssignments = generateRecurringAssignments({
          workflow,
          userId,
          assignedBy: profile.id,
          startDate,
          endDate
        });
        assignments.push(...recurringAssignments);
      } else {
        // Create a single assignment
        const dueDate = workflow.due_date || startDate.toISOString().split('T')[0];
        assignments.push({
          workflow_id,
          assigned_to: userId,
          assigned_by: profile.id,
          due_date: dueDate,
          status: 'pending'
        });
      }
    }

    // Insert all assignments
    const { data: createdAssignments, error } = await supabaseAdmin
      .from('workflow_assignments')
      .insert(assignments)
      .select(`
        *,
        workflow:workflows(*),
        assignee:profiles!assigned_to(id, name, email, role)
      `);

    if (error) {
      console.error('Error creating workflow assignments:', error);
      return NextResponse.json({ error: 'Failed to create workflow assignments' }, { status: 500 });
    }

    return NextResponse.json({ 
      assignments: createdAssignments,
      message: `Created ${createdAssignments.length} workflow assignments`
    });

  } catch (error) {
    console.error('Workflow scheduling error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Helper function to generate recurring assignments
function generateRecurringAssignments({
  workflow,
  userId,
  assignedBy,
  startDate,
  endDate
}: {
  workflow: {
    id: string;
    recurrence_type?: string;
  };
  userId: string;
  assignedBy: string;
  startDate: Date;
  endDate: Date | null;
}) {
  const assignments = [];
  const maxAssignments = 100; // Safety limit
  // eslint-disable-next-line prefer-const
  let currentDate = new Date(startDate);
  
  // Default end date to 6 months from start if not provided
  const finalEndDate = endDate || new Date(startDate.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);

  let count = 0;
  while (currentDate <= finalEndDate && count < maxAssignments) {
    assignments.push({
      workflow_id: workflow.id,
      assigned_to: userId,
      assigned_by: assignedBy,
      due_date: currentDate.toISOString().split('T')[0],
      status: 'pending'
    });

    // Calculate next occurrence
    switch (workflow.recurrence_type) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      default:
        // For 'once' or unknown types, only create one assignment
        return assignments;
    }
    
    count++;
  }

  return assignments;
}