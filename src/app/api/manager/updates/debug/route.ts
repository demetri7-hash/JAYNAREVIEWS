// Debug version of manager updates API without translation
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG POST /api/manager/updates ===');
    
    const session = await getServerSession(authOptions);
    console.log('Session check:', !!session, session?.user?.email);
    
    if (!session?.user) {
      console.log('No session, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Getting user profile...');
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, email')
      .eq('email', session.user.email)
      .single();

    console.log('User profile result:', { userProfile, profileError });

    if (!userProfile) {
      console.log('No user profile found');
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    if (!['manager', 'kitchen_manager', 'ordering_manager', 'assistant_foh_manager'].includes(userProfile.role)) {
      console.log('Insufficient permissions for role:', userProfile.role);
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    console.log('Parsing request body...');
    const body = await request.json();
    console.log('Request body:', body);
    
    const { title, message, priority, type, requiresAcknowledgment, expiresAt, photoUrl } = body;

    if (!title || !message || !priority || !type) {
      console.log('Missing required fields:', { title: !!title, message: !!message, priority: !!priority, type: !!type });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Creating update in database...');
    const { data: newUpdate, error: insertError } = await supabase
      .from('manager_updates')
      .insert({
        title,
        message,
        title_en: title, // Simple fallback
        title_es: title,
        title_tr: title,
        message_en: message,
        message_es: message,
        message_tr: message,
        priority,
        type,
        requires_acknowledgment: requiresAcknowledgment || priority === 'critical',
        expires_at: expiresAt || null,
        created_by: userProfile.id,
        photo_url: photoUrl || null
      })
      .select()
      .single();

    console.log('Database insert result:', { newUpdate, insertError });

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create update', details: insertError }, { status: 500 });
    }

    console.log('Update created successfully:', newUpdate.id);
    return NextResponse.json({ 
      success: true,
      message: 'Manager update created successfully',
      update: newUpdate
    });
    
  } catch (error) {
    console.error('=== ERROR in POST /api/manager/updates ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}