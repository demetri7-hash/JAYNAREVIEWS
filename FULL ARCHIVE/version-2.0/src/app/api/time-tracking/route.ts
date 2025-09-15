import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeEmail = searchParams.get('employee_email') || session.user.email;
    const period = searchParams.get('period') || 'today'; // today, week, month

    // Get employee info
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('email', employeeEmail)
      .single();

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // today
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Fetch time tracking data
    const { data: timeEntries, error } = await supabase
      .from('time_tracking')
      .select(`
        *,
        task_instances (
          task_title,
          estimated_duration,
          workflow_instance:workflow_instances (
            checklist_title
          )
        )
      `)
      .eq('employee_id', employee.id)
      .gte('start_time', startDate.toISOString())
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching time tracking data:', error);
      return NextResponse.json({ error: 'Failed to fetch time data' }, { status: 500 });
    }

    // Calculate aggregated statistics
    const stats = calculateTimeStats(timeEntries || []);

    return NextResponse.json({
      entries: timeEntries || [],
      stats,
      period
    });

  } catch (error) {
    console.error('Time tracking GET error:', error);
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
      task_id,
      start_time,
      end_time,
      duration_seconds,
      session_data,
      notes
    } = body;

    // Get employee info
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Insert time tracking entry
    const { data: timeEntry, error } = await supabase
      .from('time_tracking')
      .insert({
        task_id,
        employee_id: employee.id,
        start_time,
        end_time,
        duration_seconds,
        session_data: session_data || [],
        notes,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating time tracking entry:', error);
      return NextResponse.json({ error: 'Failed to save time data' }, { status: 500 });
    }

    // Update task with actual time spent
    if (end_time) {
      await supabase
        .from('task_instances')
        .update({
          actual_duration: Math.floor(duration_seconds / 60), // Convert to minutes
          time_tracking_id: timeEntry.id
        })
        .eq('id', task_id);
    }

    return NextResponse.json(timeEntry);

  } catch (error) {
    console.error('Time tracking POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { time_entry_id, end_time, duration_seconds, session_data, notes } = body;

    // Update time tracking entry
    const { data: timeEntry, error } = await supabase
      .from('time_tracking')
      .update({
        end_time,
        duration_seconds,
        session_data,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', time_entry_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating time tracking entry:', error);
      return NextResponse.json({ error: 'Failed to update time data' }, { status: 500 });
    }

    return NextResponse.json(timeEntry);

  } catch (error) {
    console.error('Time tracking PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateTimeStats(entries: any[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayEntries = entries.filter(entry => 
    new Date(entry.start_time) >= today
  );

  const totalTimeToday = todayEntries.reduce((sum, entry) => 
    sum + (entry.duration_seconds || 0), 0
  );

  const tasksCompletedToday = todayEntries.filter(entry => 
    entry.end_time
  ).length;

  const avgTimePerTask = tasksCompletedToday > 0 
    ? totalTimeToday / tasksCompletedToday 
    : 0;

  // Calculate efficiency (actual vs estimated time)
  const completedTasksWithEstimates = todayEntries.filter(entry => 
    entry.end_time && entry.task_instances?.estimated_duration
  );

  const efficiency = completedTasksWithEstimates.length > 0
    ? completedTasksWithEstimates.reduce((sum, entry) => {
        const estimated = entry.task_instances.estimated_duration * 60; // Convert to seconds
        const actual = entry.duration_seconds;
        return sum + (estimated / actual * 100);
      }, 0) / completedTasksWithEstimates.length
    : 100;

  // Weekly trend calculation
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayEntries = entries.filter(entry => {
      const entryDate = new Date(entry.start_time);
      return entryDate >= date && entryDate <= dayEnd;
    });

    const dayTotalTime = dayEntries.reduce((sum, entry) => 
      sum + (entry.duration_seconds || 0), 0
    );

    const dayTasksCompleted = dayEntries.filter(entry => 
      entry.end_time
    ).length;

    const dayCompletedWithEstimates = dayEntries.filter(entry => 
      entry.end_time && entry.task_instances?.estimated_duration
    );

    const dayEfficiency = dayCompletedWithEstimates.length > 0
      ? dayCompletedWithEstimates.reduce((sum, entry) => {
          const estimated = entry.task_instances.estimated_duration * 60;
          const actual = entry.duration_seconds;
          return sum + (estimated / actual * 100);
        }, 0) / dayCompletedWithEstimates.length
      : 100;

    last7Days.push({
      date: date.toISOString().split('T')[0],
      tasksCompleted: dayTasksCompleted,
      totalTime: Math.floor(dayTotalTime / 60), // Convert to minutes
      efficiency: Math.round(dayEfficiency)
    });
  }

  return {
    daily: {
      tasksCompleted: tasksCompletedToday,
      totalTime: Math.floor(totalTimeToday / 60), // Convert to minutes
      avgTimePerTask: Math.floor(avgTimePerTask / 60), // Convert to minutes
      efficiency: Math.round(efficiency)
    },
    weeklyTrend: last7Days,
    totalEntries: entries.length,
    totalTime: Math.floor(entries.reduce((sum, entry) => 
      sum + (entry.duration_seconds || 0), 0
    ) / 60)
  };
}
