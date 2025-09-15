import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

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

    // Fetch recurring workflows with template information
    const { data: workflows, error } = await supabase
      .from('recurring_workflows')
      .select(`
        *,
        workflow_templates (
          name,
          description,
          estimated_duration
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recurring workflows:', error);
      return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
    }

    // Format the response to include template names
    const formattedWorkflows = workflows?.map(workflow => ({
      ...workflow,
      template_name: workflow.workflow_templates?.name || 'Unknown Template'
    })) || [];

    return NextResponse.json(formattedWorkflows);

  } catch (error) {
    console.error('Recurring workflows GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      template_id,
      recurrence_pattern,
      recurrence_config,
      assigned_to,
      assigned_by
    } = body;

    // Validate required fields
    if (!template_id || !recurrence_pattern || !assigned_to?.length) {
      return NextResponse.json({ 
        error: 'Missing required fields: template_id, recurrence_pattern, assigned_to' 
      }, { status: 400 });
    }

    // Get employee information for assigned_by
    const { data: employee } = await supabase
      .from('employees')
      .select('name')
      .eq('email', assigned_by)
      .single();

    // Calculate next assignment date
    const nextAssignment = calculateNextAssignment(recurrence_pattern, recurrence_config);

    // Create recurring workflow
    const { data: workflow, error } = await supabase
      .from('recurring_workflows')
      .insert({
        template_id,
        recurrence_pattern,
        recurrence_config,
        assigned_to,
        assigned_by,
        assigned_by_name: employee?.name || assigned_by,
        is_active: true,
        next_assignment: nextAssignment.toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating recurring workflow:', error);
      return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
    }

    return NextResponse.json(workflow);

  } catch (error) {
    console.error('Recurring workflows POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateNextAssignment(pattern: string, config: any): Date {
  const now = new Date();
  const next = new Date();
  const frequency = config.frequency || 1;
  const time = config.time || '09:00';
  
  // Set the time
  const [hours, minutes] = time.split(':');
  next.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  switch (pattern) {
    case 'daily':
      next.setDate(now.getDate() + frequency);
      break;
      
    case 'weekly':
      const daysOfWeek: number[] = config.daysOfWeek || [now.getDay()];
      const currentDay = now.getDay();
      
      // Find the next occurrence
      let nextDay = daysOfWeek.find((day: number) => day > currentDay);
      if (!nextDay) {
        nextDay = daysOfWeek[0];
        next.setDate(now.getDate() + (7 * frequency) - currentDay + nextDay);
      } else {
        next.setDate(now.getDate() + (nextDay - currentDay));
      }
      break;
      
    case 'monthly':
      const dayOfMonth = config.dayOfMonth || 1;
      next.setMonth(now.getMonth() + frequency);
      next.setDate(dayOfMonth);
      
      // If the date doesn't exist (e.g., Feb 31), move to last day of month
      if (next.getDate() !== dayOfMonth) {
        next.setDate(0); // Go to last day of previous month
      }
      break;
  }

  // If the calculated time is in the past, add one period
  if (next <= now) {
    return calculateNextAssignment(pattern, { ...config, frequency: frequency + 1 });
  }

  return next;
}
