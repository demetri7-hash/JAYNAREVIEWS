import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
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
      updated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Simple test error:', error);
    return NextResponse.json({ 
      error: 'Test error',
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