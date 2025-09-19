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
    const showRead = url.searchParams.get('showRead'); // 'true' for history page
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '3');
    console.log('Query params:', { requiresAck, showRead, page, limit });

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

    // Fetch all active manager updates with read status
    console.log('Fetching manager updates with read status...');
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
        created_by,
        photo_url,
        manager_update_reads!left(
          id,
          read_at,
          user_id
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    console.log('Database query result:', { updates: updates?.length, error });

    if (error) {
      console.error('Error fetching manager updates:', error);
      return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 });
    }

    // Process updates to add read status and apply filtering
    let processedUpdates = (updates || []).map(update => {
      const userRead = update.manager_update_reads?.find(
        (read: { read_at?: string; user_id?: string }) => 
          read && read.user_id === userProfile.id
      );
      
      return {
        ...update,
        isRead: !!userRead,
        readAt: userRead?.read_at || null,
        manager_update_reads: undefined // Remove from response
      };
    });

    // Apply filtering logic
    if (showRead === 'true') {
      // History page: show only read updates
      processedUpdates = processedUpdates.filter(update => update.isRead);
    } else {
      // Main page: show unread updates, with required acknowledgment floating to top
      processedUpdates = processedUpdates.filter(update => !update.isRead);
      
      // Sort: required acknowledgment first, then by priority, then by date
      processedUpdates.sort((a, b) => {
        // Required acknowledgment always first
        if (a.requires_acknowledgment && !b.requires_acknowledgment) return -1;
        if (!a.requires_acknowledgment && b.requires_acknowledgment) return 1;
        
        // Then by priority (critical, high, medium, low)
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
        if (aPriority !== bPriority) return aPriority - bPriority;
        
        // Then by creation date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    // Apply additional filters
    if (requiresAck === 'true') {
      processedUpdates = processedUpdates.filter(update => update.requires_acknowledgment);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUpdates = processedUpdates.slice(startIndex, endIndex);
    const hasMore = endIndex < processedUpdates.length;

    console.log('Returning updates:', { 
      total: processedUpdates.length, 
      page, 
      limit, 
      returned: paginatedUpdates.length,
      hasMore 
    });

    return NextResponse.json({ 
      updates: paginatedUpdates,
      pagination: {
        page,
        limit,
        total: processedUpdates.length,
        hasMore,
        totalPages: Math.ceil(processedUpdates.length / limit)
      }
    });
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

    const { title, message, priority, type, requiresAcknowledgment, expiresAt, photoUrl } = await request.json();

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
        created_by: creatorProfile.id,
        photo_url: photoUrl || null
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