import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    let workflowAssignments = null;
    let workflowTasks = null;
    let databaseProfile = null;
    
    if (session?.user?.id) {
      // Test database queries that are failing
      try {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        databaseProfile = profile;
        
        const { data: assignments } = await supabaseAdmin
          .from('workflow_assignments')
          .select('*')
          .eq('assigned_to', session.user.id)
          .limit(5);
        workflowAssignments = assignments;
        
        const { data: tasks } = await supabaseAdmin
          .from('workflow_tasks')
          .select('*')
          .limit(5);
        workflowTasks = tasks;
        
      } catch (dbError) {
        console.error('Database test error:', dbError);
      }
    }
    
    return NextResponse.json({
      hasSession: !!session,
      sessionUser: session?.user,
      userEmail: session?.user?.email,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      databaseProfile,
      workflowAssignments,
      workflowTasks
    });
  } catch (error) {
    console.error('Session debug error:', error);
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}