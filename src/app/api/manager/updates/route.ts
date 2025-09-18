import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { translateText } from '@/lib/translation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch manager updates
export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/manager/updates called ===');
    const session = await getServerSession(authOptions);
    console.log('Session:', !!session, session?.user?.email);
    
    if (!session?.user) {
      console.log('No session or user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const requiresAck = url.searchParams.get('requiresAck');
    console.log('requiresAck param:', requiresAck);

    // Get user profile
    console.log('Getting user profile for:', session.user.email);
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    console.log('Profile query result:', { userProfile, profileError });

    if (!userProfile) {
      console.log('User profile not found');
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Fetch all active manager updates from database
    console.log('Fetching manager updates from database...');
    const { data: updates, error } = await supabase
      .from('manager_updates')
      .select(`
        id,
        title,
        message,
        title_en,
        title_es,
        title_tr,
        message_en,
        message_es,
        message_tr,
        priority,
        type,
        requires_acknowledgment,
        created_at,
        expires_at,
        is_active,
        created_by
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    console.log('Database query result:', { updates: updates?.length, error });

    if (error) {
      console.error('Error fetching manager updates:', error);
      return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 });
    }

    // Filter by requires acknowledgment if specified
    let filteredUpdates = updates || [];
    if (requiresAck === 'true') {
      filteredUpdates = filteredUpdates.filter(update => update.requires_acknowledgment);
    }

    console.log('Returning updates:', filteredUpdates.length);
    return NextResponse.json({ updates: filteredUpdates });
  } catch (error) {
    console.error('Error in GET /api/manager/updates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new manager update
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a manager
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (!userProfile || !['manager', 'kitchen_manager', 'ordering_manager', 'assistant_foh_manager'].includes(userProfile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { title, message, priority, type, requiresAcknowledgment, expiresAt } = await request.json();

    if (!title || !message || !priority || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user profile to get the user ID
    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (!creatorProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Auto-translate title and message with error handling
    let titleTranslations, messageTranslations;
    try {
      console.log('=== TRANSLATION DEBUG ===');
      console.log('Attempting translation for title:', title);
      console.log('Attempting translation for message:', message);
      console.log('OpenAI API Key configured:', !!process.env.OPENAI_API_KEY);
      console.log('OpenAI API Key preview:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'Not set');
      
      titleTranslations = await translateText(title);
      console.log('Title translations result:', titleTranslations);
      
      messageTranslations = await translateText(message);
      console.log('Message translations result:', messageTranslations);
      
      console.log('Translation completed successfully');
    } catch (error) {
      console.error('=== TRANSLATION ERROR ===');
      console.error('Translation failed:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Fallback to original text for all languages
      titleTranslations = { en: title, es: title, tr: title };
      messageTranslations = { en: message, es: message, tr: message };
      
      console.log('Using fallback translations:', { titleTranslations, messageTranslations });
    }

    // Create the update in the database with translations
    const { data: newUpdate, error } = await supabase
      .from('manager_updates')
      .insert({
        title,
        message,
        title_en: titleTranslations.en,
        title_es: titleTranslations.es,
        title_tr: titleTranslations.tr,
        message_en: messageTranslations.en,
        message_es: messageTranslations.es,
        message_tr: messageTranslations.tr,
        priority,
        type,
        requires_acknowledgment: requiresAcknowledgment || priority === 'critical',
        expires_at: expiresAt || null,
        created_by: creatorProfile.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating manager update:', error);
      return NextResponse.json({ error: 'Failed to create update' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Manager update created successfully',
      update: newUpdate
    });
  } catch (error) {
    console.error('Error in POST /api/manager/updates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update existing manager update
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a manager
    const { data: managerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (!managerProfile || managerProfile.role !== 'manager') {
      return NextResponse.json({ error: 'Only managers can modify updates' }, { status: 403 });
    }

    const { updateId, isActive } = await request.json();

    if (!updateId || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Missing updateId or isActive' }, { status: 400 });
    }

    // Update the manager update in the database
    const { error } = await supabase
      .from('manager_updates')
      .update({ is_active: isActive })
      .eq('id', updateId);

    if (error) {
      console.error('Error updating manager update:', error);
      return NextResponse.json({ error: 'Failed to update manager update' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: `Update ${isActive ? 'activated' : 'deactivated'} successfully`,
      updateId,
      isActive
    });
  } catch (error) {
    console.error('Error in PATCH /api/manager/updates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}