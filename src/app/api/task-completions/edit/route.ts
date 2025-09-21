import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin;
    const body = await request.json();
    
    if (!body.completion_id || !body.notes) {
      return NextResponse.json({ 
        error: 'Completion ID and notes are required' 
      }, { status: 400 });
    }

    // Check if user has manager permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get the current task completion to preserve edit history
    const { data: currentCompletion, error: fetchError } = await supabase
      .from('workflow_task_completions')
      .select('*')
      .eq('id', body.completion_id)
      .single();

    if (fetchError || !currentCompletion) {
      return NextResponse.json({ error: 'Task completion not found' }, { status: 404 });
    }

    // Prepare edit history entry
    const editHistoryEntry = {
      edited_by: profile.id,
      edited_at: new Date().toISOString(),
      previous_notes: currentCompletion.notes,
      new_notes: body.notes
    };

    // Add to existing edit history or create new array
    const updatedEditHistory = [
      ...(currentCompletion.edit_history || []),
      editHistoryEntry
    ];

    // Update the task completion with new notes and edit tracking
    const { data: updatedCompletion, error: updateError } = await supabase
      .from('workflow_task_completions')
      .update({
        notes: body.notes,
        edited_by: profile.id,
        edited_at: new Date().toISOString(),
        edit_history: updatedEditHistory
      })
      .eq('id', body.completion_id)
      .select(`
        *,
        task:task_id(
          id,
          title,
          description,
          tags,
          is_photo_mandatory,
          is_notes_mandatory
        ),
        completed_by_user:completed_by(
          id,
          name,
          email
        ),
        edited_by_user:edited_by(
          id,
          name,
          email
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating task completion:', updateError);
      return NextResponse.json({ error: 'Failed to update task completion' }, { status: 500 });
    }

    return NextResponse.json({ 
      completion: updatedCompletion,
      message: 'Task completion updated successfully' 
    });

  } catch (error) {
    console.error('Edit task completion API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}