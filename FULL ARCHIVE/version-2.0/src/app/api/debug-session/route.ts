import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      success: true,
      session: session,
      sessionStatus: session ? 'authenticated' : 'not authenticated',
      userEmail: session?.user?.email,
      hasEmployee: !!session?.user?.employee,
      employeeData: session?.user?.employee || null
    })
  } catch (error) {
    console.error('Debug session error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
