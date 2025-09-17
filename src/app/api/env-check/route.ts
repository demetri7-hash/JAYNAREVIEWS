import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const envCheck = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET (length: ' + process.env.NEXTAUTH_SECRET.length + ')' : 'NOT SET',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET (partial: ' + process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...)' : 'NOT SET',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET (length: ' + process.env.GOOGLE_CLIENT_SECRET.length + ')' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL || 'NOT SET',
      VERCEL_REGION: process.env.VERCEL_REGION || 'NOT SET',
    };

    return NextResponse.json({
      status: 'Auth Environment Check',
      environment: envCheck,
      timestamp: new Date().toISOString(),
      suggestions: [
        'Check if NEXTAUTH_URL matches current domain',
        'Verify Google OAuth redirect URIs include callback URL',
        'Check if NEXTAUTH_SECRET is properly set',
        'Ensure environment variables are deployed to Vercel'
      ]
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check environment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}