import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await context.params;
    
    const { data: comments, error } = await supabase
      .from('task_comments')
      .select(`
        id,
        comment,
        created_at,
        created_by_name
      `)
      .eq('task_instance_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(comments || []);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await context.params;
    const body = await request.json();
    const { comment, created_by } = body;

    if (!comment || !created_by) {
      return NextResponse.json(
        { error: 'Comment and created_by are required' },
        { status: 400 }
      );
    }

    // Get user name from employees table
    const { data: employee } = await supabase
      .from('employees')
      .select('name')
      .eq('email', created_by)
      .single();

    const { data, error } = await supabase
      .from('task_comments')
      .insert({
        task_instance_id: taskId,
        comment,
        created_by,
        created_by_name: employee?.name || created_by
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
