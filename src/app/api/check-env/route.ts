import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    openai_configured: !!process.env.OPENAI_API_KEY,
    openai_key_preview: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'Not configured',
    environment: process.env.NODE_ENV
  });
}