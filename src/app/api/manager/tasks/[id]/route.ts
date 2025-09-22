import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
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
    console.log('Task update request:', { id, body });
    
    const {
      title,
      description,
      departments,
      requires_photo,
      requires_notes,
      archived
    } = body;

    // Validation - copy from task creation
    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    if (!departments || !Array.isArray(departments) || departments.length === 0) {
      return NextResponse.json({ error: 'At least one department must be selected' }, { status: 400 });
    }

    // Update the task - copying the exact pattern from task creation
    const { data: updatedTask, error } = await supabaseAdmin
      .from('tasks')
      .update({
        title,
        description: description || null,
        requires_notes: requires_notes || false,
        requires_photo: requires_photo || false,
        departments: departments || [],
        archived: archived || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return NextResponse.json({ 
        error: 'Failed to update task',
        details: error.message 
      }, { status: 500 });
    }

    console.log('Task updated successfully:', updatedTask);
    return NextResponse.json(updatedTask);

  } catch (error) {
    console.error('Update task API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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

    // Delete the task - copying the pattern from task creation
    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return NextResponse.json({ 
        error: 'Failed to delete task',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });

  } catch (error) {
    console.error('Delete task API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}