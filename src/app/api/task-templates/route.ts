import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin;
    
    // Check if user has manager permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get all task templates
    const { data: templates, error } = await supabase
      .from('task_templates')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      console.error('Error fetching task templates:', error);
      // If table doesn't exist, return empty array instead of error
      if (error.message.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ templates: [] });
      }
      return NextResponse.json({ error: 'Failed to fetch task templates' }, { status: 500 });
    }

    return NextResponse.json({ templates: templates || [] });

  } catch (error) {
    console.error('Task templates API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin;
    
    // Check if user has manager permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const templateData = await request.json();

    // Validate required fields
    const { title, description, estimated_duration, priority } = templateData;
    if (!title || !description || !estimated_duration || !priority) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create the template
    const { data: template, error } = await supabase
      .from('task_templates')
      .insert({
        title,
        description,
        estimated_duration,
        priority,
        requires_photo: templateData.requires_photo || false,
        requires_notes: templateData.requires_notes || false,
        created_by: session.user.email
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task template:', error);
      return NextResponse.json({ error: 'Failed to create task template' }, { status: 500 });
    }

    return NextResponse.json({ template }, { status: 201 });

  } catch (error) {
    console.error('Task template creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}