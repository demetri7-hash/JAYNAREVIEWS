import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `manager-updates/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('task-photos')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading photo:', error);
      return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('task-photos')
      .getPublicUrl(filePath);

    return NextResponse.json({ 
      url: urlData.publicUrl,
      path: filePath 
    });

  } catch (error) {
    console.error('Photo upload API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}