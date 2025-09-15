import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { createClient } from '@supabase/supabase-js';
import { isManagerRole, UserRole } from '../../../../types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('Debug endpoint called');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', { hasSession: !!session, email: session?.user?.email });
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized', debug: 'No session or email' }, { status: 401 });
    }

    // Get user profile to check role and permissions
    console.log('Fetching profile for email:', session.user.email);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', session.user.email)
      .single();

    console.log('Profile result:', { profile, profileError });

    if (profileError || !profile) {
      return NextResponse.json({ 
        error: 'Profile not found', 
        debug: { profileError, hasProfile: !!profile }
      }, { status: 404 });
    }

    // Check if user is a manager
    console.log('Checking manager role:', profile.role);
    if (!isManagerRole(profile.role as UserRole)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions', 
        debug: { userRole: profile.role, isManager: isManagerRole(profile.role as UserRole) }
      }, { status: 403 });
    }

    // Try to fetch tasks without the complex join first
    console.log('Fetching tasks...');
    const { data: tasks, error: tasksError } = await supabase
      .from('checklist_items')
      .select('*')
      .limit(5);

    console.log('Tasks result:', { taskCount: tasks?.length, tasksError });

    if (tasksError) {
      return NextResponse.json({ 
        error: 'Failed to fetch tasks', 
        debug: { tasksError }
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      debug: {
        userEmail: session.user.email,
        userRole: profile.role,
        taskCount: tasks?.length || 0,
        sampleTask: tasks?.[0] || null
      }
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      debug: { errorMessage: error instanceof Error ? error.message : 'Unknown error' }
    }, { status: 500 });
  }
}