import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      name,
      email,
      department = 'FOH',
      role = 'employee'
    } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email' },
        { status: 400 }
      )
    }

    // Check if employee already exists
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('id, name, email')
      .eq('email', email)
      .single()

    if (existingEmployee) {
      return NextResponse.json({
        success: true,
        employee: existingEmployee,
        message: 'Employee already exists'
      })
    }

    // Create new employee
    const { data: employee, error } = await supabase
      .from('employees')
      .insert({
        name,
        email,
        department,
        role,
        language: 'en',
        is_active: true,
        status: 'online',
        display_name: name,
        timezone: 'America/Los_Angeles'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create employee', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      employee,
      message: 'Employee created successfully'
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
