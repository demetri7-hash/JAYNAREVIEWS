import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all completed assignments with their completion dates
    const { data: completed, error } = await supabaseAdmin
      .from('assignments')
      .select(`
        id,
        status,
        created_at,
        completions (
          completed_at,
          completed_by
        )
      `)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Debug query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate what the archive would be looking for
    const today = new Date()
    const dayOfWeek = today.getDay()
    
    let daysBackToLastMonday
    if (dayOfWeek === 0) { // Sunday
      daysBackToLastMonday = 8
    } else if (dayOfWeek === 1) { // Monday
      daysBackToLastMonday = 7
    } else { // Tuesday-Saturday
      daysBackToLastMonday = dayOfWeek + 6
    }
    
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - daysBackToLastMonday)
    weekStart.setHours(0, 0, 0, 0)
    
    const weekEnding = new Date(weekStart)
    weekEnding.setDate(weekStart.getDate() + 6)
    weekEnding.setHours(23, 59, 59, 999)

    return NextResponse.json({
      success: true,
      debug: {
        today: today.toISOString(),
        weekStart: weekStart.toISOString(),
        weekEnding: weekEnding.toISOString(),
        dayOfWeek,
        daysBackToLastMonday
      },
      completedAssignments: completed,
      totalFound: completed?.length || 0
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}