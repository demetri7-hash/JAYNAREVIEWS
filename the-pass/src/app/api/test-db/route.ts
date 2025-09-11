import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing database connectivity...');
    
    const db = new DatabaseService();
    
    // Test basic connectivity
    const testResult = await db.testConnection();
    
    console.log('Database test result:', testResult);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test completed',
      result: testResult
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to test database connection'
  });
}
