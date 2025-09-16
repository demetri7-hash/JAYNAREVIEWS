import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { language } = await request.json();
    
    if (!language || !['en', 'es', 'tr'].includes(language)) {
      return NextResponse.json({ error: 'Invalid language code' }, { status: 400 });
    }

    // Update user's language preference
    const { error } = await supabase
      .from('profiles')
      .update({ preferred_language: language })
      .eq('email', session.user.email);

    if (error) {
      console.error('Error updating language preference:', error);
      return NextResponse.json({ error: 'Failed to update language preference' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Language preference updated successfully' 
    });
  } catch (error) {
    console.error('Error in PATCH /api/user/language:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}