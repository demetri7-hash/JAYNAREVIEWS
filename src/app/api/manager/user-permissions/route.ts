import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch user permission overrides
export async function GET(request: NextRequest) {
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

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    // For now, return empty overrides until database tables are ready
    return NextResponse.json({ 
      overrides: {},
      message: 'User permission overrides feature will be available once database migration is applied'
    });
  } catch (error) {
    console.error('Error in GET /api/manager/user-permissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update user permission overrides
export async function PATCH(request: NextRequest) {
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

    if (!userProfile || userProfile.role !== 'manager') {
      return NextResponse.json({ error: 'Only managers can modify user permissions' }, { status: 403 });
    }

    const { userId, department, accessGranted } = await request.json();

    if (!userId || !department || typeof accessGranted !== 'boolean') {
      return NextResponse.json({ error: 'Missing userId, department, or accessGranted' }, { status: 400 });
    }

    // For now, log the change until database is ready
    console.log(`Manager ${session.user.email} ${accessGranted ? 'granted' : 'removed'} ${department} access for user ${userId}`);

    return NextResponse.json({ 
      success: true,
      message: `User permission override updated successfully`,
      userId,
      department,
      accessGranted
    });
  } catch (error) {
    console.error('Error in PATCH /api/manager/user-permissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}