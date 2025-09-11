import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      employee_id,
      department,
      shift_type,
      checklist_data = [],
      photo_urls = null,
      notes = null,
      completion_percentage = 0,
      priority = 'medium',
      status = 'in_progress'
    } = body

    // Validate required fields
    if (!employee_id || !department || !shift_type) {
      return NextResponse.json(
        { error: 'Missing required fields: employee_id, department, shift_type' },
        { status: 400 }
      )
    }

    // Create the worksheet
    const { data: worksheet, error } = await supabase
      .from('worksheets')
      .insert({
        employee_id,
        department,
        shift_type,
        checklist_data,
        photo_urls,
        notes,
        completion_percentage,
        priority,
        status
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create worksheet', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      worksheet,
      message: 'Worksheet created successfully' 
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
    // Get recent worksheets
    const { data: worksheets, error } = await supabase
      .from('worksheets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch worksheets', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      worksheets: worksheets || [],
      count: worksheets?.length || 0
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Worksheet ID is required' },
        { status: 400 }
      )
    }

    // Update the worksheet
    const { data: worksheet, error } = await supabase
      .from('worksheets')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update worksheet', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      worksheet,
      message: 'Worksheet updated successfully' 
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
