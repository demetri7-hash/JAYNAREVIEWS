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

    // Get user permission overrides from database
    const { data: overrides, error } = await supabase
      .from('user_permission_overrides')
      .select('department')
      .eq('user_id', userId)
      .eq('access_granted', true);

    if (error) {
      console.error('Error fetching user permission overrides:', error);
      return NextResponse.json({ error: 'Failed to fetch user permission overrides' }, { status: 500 });
    }

    // Convert to simple array of departments
    const userOverrides = overrides?.map(override => override.department) || [];

    return NextResponse.json({ 
      overrides: userOverrides
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
    const { userId, departments } = await request.json();
    if (!userId || !Array.isArray(departments)) {
      return NextResponse.json({ error: 'Missing userId or departments array' }, { status: 400 });
    }
    // Remove all previous overrides for this user
    const { error: deleteError } = await supabase
      .from('user_permission_overrides')
      .delete()
      .eq('user_id', userId);
    if (deleteError) {
      console.error('Error deleting previous overrides:', deleteError);
      return NextResponse.json({ error: 'Failed to update user permissions' }, { status: 500 });
    }
    // Insert new overrides
    if (departments.length > 0) {
      const overridesToInsert = departments.map((department: string) => ({
        user_id: userId,
        department,
        access_granted: true
      }));
      const { error: insertError } = await supabase
        .from('user_permission_overrides')
        .insert(overridesToInsert);
      if (insertError) {
        console.error('Error inserting new overrides:', insertError);
        return NextResponse.json({ error: 'Failed to save user permissions' }, { status: 500 });
      }
    }
    return NextResponse.json({
      success: true,
      message: `User permission overrides updated successfully`,
      userId,
      departments
    });
  } catch (error) {
    console.error('Error in PATCH /api/manager/user-permissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}