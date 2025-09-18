import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get all users from the profiles table
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({ users: users || [] })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, data } = body

    switch (action) {
      case 'link_toast_employee':
        // Store TOAST employee data in the profiles table
        // We'll add the toast_employee_id column through the Supabase UI if needed
        
        // For now, let's store it as JSON in an existing column or create a simple approach
        const updateData: Record<string, unknown> = {}
        
        // Try to add a simple field for TOAST linking
        if (data.toastEmployeeId) {
          updateData.toast_employee_id = data.toastEmployeeId
        }
        
        // Also store the full employee data as JSON if possible
        if (data.employeeData) {
          updateData.toast_employee_data = data.employeeData
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId)

        if (updateError) {
          console.error('Update error:', updateError)
          // If the column doesn't exist, we'll continue anyway
          if (updateError.code === '42703') {
            console.log('Column does not exist, will need to add via SQL')
            return NextResponse.json({ 
              success: false, 
              error: 'Database column needs to be added',
              needsSchema: true 
            })
          }
          throw updateError
        }

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 })
  }
}