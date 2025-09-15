import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { is_active, recurrence_pattern, recurrence_config, assigned_to } = body;

    const updateData: any = {};
    
    if (typeof is_active === 'boolean') {
      updateData.is_active = is_active;
    }
    
    if (recurrence_pattern) {
      updateData.recurrence_pattern = recurrence_pattern;
    }
    
    if (recurrence_config) {
      updateData.recurrence_config = recurrence_config;
      // Recalculate next assignment if config changed
      updateData.next_assignment = calculateNextAssignment(
        recurrence_pattern || body.current_pattern, 
        recurrence_config
      ).toISOString();
    }
    
    if (assigned_to) {
      updateData.assigned_to = assigned_to;
    }

    const { data: workflow, error } = await supabase
      .from('recurring_workflows')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating recurring workflow:', error);
      return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 });
    }

    return NextResponse.json(workflow);

  } catch (error) {
    console.error('Recurring workflow PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('recurring_workflows')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting recurring workflow:', error);
      return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Recurring workflow DELETE error:', error);
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
