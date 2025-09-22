import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Test authentication
    const session = await getServerSession(authOptions);
    console.log('=== AUTH TEST ===');
    console.log('Session:', session?.user?.email || 'No session');
    
    const body = await request.json();
    console.log('ID:', id);
    console.log('Body:', body);
    
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
      auth_test: session?.user?.email || 'No auth'
    });

  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({ 
      error: 'Auth test error',
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