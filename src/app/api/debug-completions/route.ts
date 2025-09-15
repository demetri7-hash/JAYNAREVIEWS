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

    // Calculate what the archive would be looking for (using LA timezone)
    const now = new Date()
    const laDate = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}))
    const dayOfWeek = laDate.getDay()
    
    let daysBackToLastMonday
    if (dayOfWeek === 1) { // If today is Monday
      daysBackToLastMonday = 7 // Go back to previous Monday
    } else if (dayOfWeek === 0) { // If today is Sunday
      daysBackToLastMonday = 6 // Go back to Monday of this week
    } else { // Tuesday-Saturday
      daysBackToLastMonday = dayOfWeek - 1 + 7 // Go back to previous Monday
    }
    
    const weekStart = new Date(laDate)
    weekStart.setDate(laDate.getDate() - daysBackToLastMonday)
    weekStart.setHours(0, 0, 0, 0)
    
    const weekEnding = new Date(weekStart)
    weekEnding.setDate(weekStart.getDate() + 6)
    weekEnding.setHours(23, 59, 59, 999)

    return NextResponse.json({
      success: true,
      debug: {
        currentUTC: now.toISOString(),
        currentLA: laDate.toISOString(),
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