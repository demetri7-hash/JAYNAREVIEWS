import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // TEMPORARY DEV BYPASS - REMOVE IN PRODUCTION
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        message: 'Dev bypass not available in production'
      }, { status: 403 });
    }
    
    // Create a temporary session for testing
    const response = NextResponse.json({
      message: 'Temporary auth bypass created',
      user: {
        email: 'test@jaynarestaurant.com',
        name: 'Test Manager',
        role: 'manager'
      }
    });

    // Set a simple auth cookie for testing
    response.cookies.set('temp-auth', 'bypass-user', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    });

    return response;
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to create bypass',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}