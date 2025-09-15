import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user and verify manager role
    const { data: currentUser, error: userError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', session.user.email)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only managers can access weekly reports
    if (currentUser.role !== 'manager') {
      return NextResponse.json({ error: 'Manager access required' }, { status: 403 })
    }

    // Get all weekly reports, ordered by most recent first
    const { data: weeklyReports, error: reportsError } = await supabase
      .from('weekly_reports')
      .select('*')
      .order('week_ending', { ascending: false })
      .limit(12) // Last 12 weeks

    if (reportsError) {
      throw reportsError
    }

    // Get user weekly stats for the most recent week
    const latestWeek = weeklyReports?.[0]?.week_ending
    let userStats = []
    
    if (latestWeek) {
      const { data: stats } = await supabase
        .from('user_weekly_stats')
        .select(`
          *,
          user:user_id (
            name,
            email
          )
        `)
        .eq('week_ending', latestWeek)
        .order('completion_rate', { ascending: false })

      userStats = stats || []
    }

    // Format reports for display
    const formattedReports = weeklyReports?.map(report => ({
      ...report,
      week_start: new Date(new Date(report.week_ending).getTime() - 6 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0],
      formatted_week: formatWeekRange(report.week_ending)
    })) || []

    return NextResponse.json({
      reports: formattedReports,
      latest_user_stats: userStats,
      total_reports: weeklyReports?.length || 0
    })

  } catch (error) {
    console.error('Weekly reports error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weekly reports' },
      { status: 500 }
    )
  }
}

function formatWeekRange(weekEnding: string): string {
  const endDate = new Date(weekEnding)
  const startDate = new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000)
  
  const formatOptions: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric' 
  }
  
  return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}, ${endDate.getFullYear()}`
}