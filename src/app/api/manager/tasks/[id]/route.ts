import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Test authentication
    const session = await getServerSession(authOptions);
    console.log('=== SUPABASE TEST ===');
    console.log('Session:', session?.user?.email || 'No session');
    
    const body = await request.json();
    console.log('ID:', id);
    console.log('Body:', body);
    
    // Test Supabase connection WITH a simple database query
    console.log('Supabase client exists:', !!supabaseAdmin);
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
    console.log('Supabase Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
    
    // Test with a simple database read first
    const { data: testData, error: testError } = await supabaseAdmin
      .from('checklist_items')
      .select('id')
      .limit(1);
    
    console.log('Database test result:', { data: testData, error: testError });
    
    // Just return a mock success for testing
    return NextResponse.json({
      id: id,
      title: body.title || 'Updated Task',
      description: body.description || 'Updated description',
      departments: body.departments || ['FOH'],
      requires_photo: body.requires_photo || false,
      requires_notes: body.requires_notes || false,
      archived: body.archived || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      auth_test: session?.user?.email || 'No auth',
      supabase_test: 'Database test completed',
      db_test_result: testData ? 'Success' : 'Failed',
      db_error: testError?.message || 'None'
    });

  } catch (error) {
    console.error('Supabase test error:', error);
    return NextResponse.json({ 
      error: 'Supabase test error',
      message: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({ success: true, message: 'Test delete successful' });
}