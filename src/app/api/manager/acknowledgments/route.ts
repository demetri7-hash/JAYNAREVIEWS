import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Check which updates user needs to acknowledge
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Get all active manager updates that require acknowledgment
    const { data: activeUpdates, error: updatesError } = await supabase
      .from('manager_updates')
      .select('id, title, message, priority, type, created_at')
      .eq('is_active', true)
      .eq('requires_acknowledgment', true);

    if (updatesError) {
      console.error('Error fetching active updates:', updatesError);
      return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 });
    }

    // Get updates this user has already acknowledged
    const { data: acknowledgedUpdates, error: ackError } = await supabase
      .from('update_acknowledgments')
      .select('update_id')
      .eq('user_id', userProfile.id);

    if (ackError) {
      console.error('Error fetching acknowledgments:', ackError);
      return NextResponse.json({ error: 'Failed to fetch acknowledgments' }, { status: 500 });
    }

    const acknowledgedIds = new Set(acknowledgedUpdates?.map(ack => ack.update_id) || []);
    const unacknowledgedUpdates = activeUpdates?.filter(update => !acknowledgedIds.has(update.id)) || [];

    return NextResponse.json({ 
      unacknowledgedUpdates
    });
  } catch (error) {
    console.error('Error in GET /api/manager/acknowledgments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Submit acknowledgment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('email', session.user.email)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const { updateId, fullNameEntered } = await request.json();

    if (!updateId || !fullNameEntered) {
      return NextResponse.json({ error: 'Missing updateId or fullNameEntered' }, { status: 400 });
    }

    // Validate that the entered name matches the user's profile name
    const normalizedProfileName = userProfile.name.toLowerCase().trim();
    const normalizedEnteredName = fullNameEntered.toLowerCase().trim();

    if (normalizedProfileName !== normalizedEnteredName) {
      return NextResponse.json({ 
        error: 'The full name entered does not match your profile name. Please enter your exact full name as it appears in your profile.',
        profileName: userProfile.name
      }, { status: 400 });
    }

    // Get client IP and User-Agent for audit trail
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Save acknowledgment to database
    const { error: insertError } = await supabase
      .from('update_acknowledgments')
      .insert({
        update_id: updateId,
        user_id: userProfile.id,
        full_name_entered: fullNameEntered,
        ip_address: clientIp,
        user_agent: userAgent
      });

    if (insertError) {
      console.error('Error saving acknowledgment:', insertError);
      return NextResponse.json({ error: 'Failed to save acknowledgment' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Acknowledgment recorded successfully',
      updateId,
      acknowledgedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in POST /api/manager/acknowledgments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}