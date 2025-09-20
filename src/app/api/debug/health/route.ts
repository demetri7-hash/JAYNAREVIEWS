import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true,
      message: 'API is working',
      timestamp: new Date().toISOString(),
      env_check: {
        nextauth_url: !!process.env.NEXTAUTH_URL,
        nextauth_secret: !!process.env.NEXTAUTH_SECRET,
        google_client_id: !!process.env.GOOGLE_CLIENT_ID,
        google_client_secret: !!process.env.GOOGLE_CLIENT_SECRET,
        supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}