import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        authenticated: false,
        error: 'No session found' 
      });
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', session.user.email)
      .single();

    return NextResponse.json({ 
      authenticated: true,
      session: {
        user: session.user,
        expires: session.expires
      },
      profile: userProfile
    });
  } catch (error) {
    return NextResponse.json({ 
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}