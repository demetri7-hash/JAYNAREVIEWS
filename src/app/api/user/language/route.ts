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

    // Try to update user's language preference in database
    // If the column doesn't exist, we'll gracefully handle it
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_language: language })
        .eq('email', session.user.email);

      if (error) {
        // Check if error is due to missing column
        if (error.message.includes('column "preferred_language" of relation "profiles" does not exist')) {
          console.log('preferred_language column not found in profiles table, skipping database update');
          // Language preference will be stored in localStorage only
          return NextResponse.json({ 
            success: true,
            message: 'Language preference updated successfully (localStorage only)' 
          });
        } else {
          console.error('Error updating language preference:', error);
          return NextResponse.json({ error: 'Failed to update language preference' }, { status: 500 });
        }
      }
    } catch (dbError) {
      console.log('Database update failed, continuing with localStorage only:', dbError);
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