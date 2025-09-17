import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, archived } = await request.json()

    if (!userId || typeof archived !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Prevent managers from archiving themselves
    const { data: targetUser } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    if (targetUser?.email === session.user.email) {
      return NextResponse.json({ error: 'Cannot archive yourself' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ archived })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user archive status:', error)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in archive API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}