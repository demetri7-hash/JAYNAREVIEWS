import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Mark an update as read
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { updateId } = await request.json();
    
    if (!updateId) {
      return NextResponse.json({ error: 'Update ID is required' }, { status: 400 });
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Insert or update read status (upsert)
    const { error } = await supabase
      .from('manager_update_reads')
      .upsert({
        update_id: updateId,
        user_id: userProfile.id,
        read_at: new Date().toISOString()
      }, {
        onConflict: 'update_id,user_id'
      });

    if (error) {
      console.error('Error marking update as read:', error);
      return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in mark-read API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Mark an update as unread
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const updateId = searchParams.get('updateId');
    
    if (!updateId) {
      return NextResponse.json({ error: 'Update ID is required' }, { status: 400 });
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Delete read status
    const { error } = await supabase
      .from('manager_update_reads')
      .delete()
      .eq('update_id', updateId)
      .eq('user_id', userProfile.id);

    if (error) {
      console.error('Error marking update as unread:', error);
      return NextResponse.json({ error: 'Failed to mark as unread' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in mark-unread API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}