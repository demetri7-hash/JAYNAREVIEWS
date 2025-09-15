import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Get the user's profile to get their UUID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (profileError || !profile) {
      console.error('Error finding user profile:', profileError)
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Fetch assignments for this user with task details, sorted by newest first
    const { data: assignments, error: assignmentsError } = await supabaseAdmin
      .from('assignments')
      .select(`
        *,
        task:tasks(
          id,
          title,
          description,
          requires_notes,
          requires_photo,
          created_at
        )
      `)
      .eq('assigned_to', profile.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError)
      return NextResponse.json({ 
        error: 'Failed to fetch assignments',
        details: assignmentsError.message 
      }, { status: 500 })
    }

    // Get total count for pagination
    const { count, error: countError } = await supabaseAdmin
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', profile.id)

    if (countError) {
      console.error('Error getting count:', countError)
    }

        return NextResponse.json({ 
      assignments: assignments || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('My tasks fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}