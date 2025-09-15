import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.employee) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only managers can list all employees
    const isManager = session.user.employee.role === 'manager' || session.user.employee.role === 'admin'
    if (!isManager) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check for active filter
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    let query = supabase
      .from('employees')
      .select('*')

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: employees, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching employees:', error)
      return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
    }

    return NextResponse.json({ success: true, employees })
  } catch (error) {
    console.error('Error in GET /api/employees:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
