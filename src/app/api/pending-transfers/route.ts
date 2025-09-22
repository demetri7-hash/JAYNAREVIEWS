import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current user's profile
    const { data: currentUser, error: userError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', session.user.email)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if task_transfers table exists by testing a simple query
    console.log('Testing task_transfers table...');
    const { data: testData, error: testError } = await supabase
      .from('task_transfers')
      .select('count', { count: 'exact', head: true });

    if (testError) {
      console.log('task_transfers table does not exist:', testError.message);
      // Return empty result instead of error for missing table
      if (testError.message.includes('does not exist') || testError.code === '42P01') {
        return NextResponse.json({ transfers: [] });
      }
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Try a simpler query first to avoid join issues
    const { data: transfers, error: transfersError } = await supabase
      .from('task_transfers')
      .select(`
        id,
        assignment_id,
        from_user_id,
        to_user_id,
        status,
        transfer_reason,
        requested_at,
        transferee_responded_at,
        manager_responded_at
      `)
      .or(currentUser.role === 'manager' 
        ? `status.eq.pending_manager,and(status.eq.pending_transferee,to_user_id.eq.${currentUser.id})`
        : `from_user_id.eq.${currentUser.id},to_user_id.eq.${currentUser.id}`
      );

    if (transfersError) {
      console.error('Error fetching transfers:', transfersError);
      return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 });
    }

    return NextResponse.json({ transfers: transfers || [] });

  } catch (error) {
    console.error('Pending transfers API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}