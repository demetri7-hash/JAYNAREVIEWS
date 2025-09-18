import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TaskSearchResult } from '@/types/workflow';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin;
    
    // Check if user has manager permissions (only managers can search tasks for workflow creation)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];

    let searchQuery = supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        tags,
        is_photo_mandatory,
        is_notes_mandatory
      `)
      .limit(limit)
      .order('title');

    // Add text search if query provided
    if (query.trim()) {
      searchQuery = searchQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Add tag filter if tags provided
    if (tags.length > 0) {
      // Use overlaps operator to check if any of the task's tags match any of the search tags
      searchQuery = searchQuery.overlaps('tags', tags);
    }

    const { data: tasks, error } = await searchQuery;

    if (error) {
      console.error('Error searching tasks:', error);
      return NextResponse.json({ error: 'Failed to search tasks' }, { status: 500 });
    }

    // Transform the data to match TaskSearchResult interface
    const searchResults: TaskSearchResult[] = tasks?.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      tags: task.tags || [],
      is_photo_mandatory: task.is_photo_mandatory || false,
      is_notes_mandatory: task.is_notes_mandatory || false
    })) || [];

    return NextResponse.json({ 
      tasks: searchResults,
      total: searchResults.length 
    });

  } catch (error) {
    console.error('Task search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST endpoint for creating new tasks from the workflow creator
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin;
    
    // Check if user has manager permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json({ 
        error: 'Title is required' 
      }, { status: 400 });
    }

    // Create the task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title: body.title,
        description: body.description,
        tags: body.tags || [],
        is_photo_mandatory: body.is_photo_mandatory || false,
        is_notes_mandatory: body.is_notes_mandatory || false,
        requires_photo: body.requires_photo || false,
        requires_notes: body.requires_notes || false,
        created_by: session.user.id
      })
      .select(`
        id,
        title,
        description,
        tags,
        is_photo_mandatory,
        is_notes_mandatory
      `)
      .single();

    if (taskError) {
      console.error('Error creating task:', taskError);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    // Transform to TaskSearchResult
    const searchResult: TaskSearchResult = {
      id: task.id,
      title: task.title,
      description: task.description,
      tags: task.tags || [],
      is_photo_mandatory: task.is_photo_mandatory || false,
      is_notes_mandatory: task.is_notes_mandatory || false
    };

    return NextResponse.json({ 
      task: searchResult,
      message: 'Task created successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Create task API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}