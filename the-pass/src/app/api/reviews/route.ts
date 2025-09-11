import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      employee_id,
      employee_name,
      shift_type,
      department,
      overall_rating,
      workflow_efficiency,
      team_communication,
      equipment_condition,
      cleanliness_score,
      comments,
      suggestions,
      language_used = 'en'
    } = body

    // Validate required fields
    if (!employee_name || !shift_type || !overall_rating) {
      return NextResponse.json(
        { error: 'Missing required fields: employee_name, shift_type, overall_rating' },
        { status: 400 }
      )
    }

    // Create the review
    const { data: review, error } = await supabase
      .from('close_reviews')
      .insert({
        employee_id,
        employee_name,
        shift_type,
        department,
        overall_rating,
        workflow_efficiency,
        team_communication,
        equipment_condition,
        cleanliness_score,
        comments,
        suggestions,
        language_used,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create review', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      review,
      message: 'Review submitted successfully' 
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get recent reviews
    const { data: reviews, error } = await supabase
      .from('close_reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reviews', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      reviews: reviews || [],
      count: reviews?.length || 0
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
