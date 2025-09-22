import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { taskIds } = await request.json();

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json({ error: 'Task IDs are required' }, { status: 400 });
    }

    // Try to update tasks - if table doesn't exist, return gracefully
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ archived: true, updated_at: new Date().toISOString() })
        .in('id', taskIds);

      if (error) {
        console.error('Error archiving tasks:', error);
        return NextResponse.json({ error: 'Failed to archive tasks' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: `${taskIds.length} tasks archived successfully` 
      });

    } catch (tableError: unknown) {
      const errorMessage = tableError instanceof Error ? tableError.message : 'Unknown error';
      console.log('Tasks table may not exist:', errorMessage);
      return NextResponse.json({ 
        success: false, 
        message: 'Tasks functionality not yet available' 
      });
    }

  } catch (error) {
    console.error('Archive tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}