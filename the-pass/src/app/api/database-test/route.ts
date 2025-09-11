import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Test basic database connectivity
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .limit(5)

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: error.message,
        nextStep: 'Visit /api/database-setup-guide for setup instructions'
      })
    }

    // Check table structure
    const columns = data?.[0] ? Object.keys(data[0]) : []
    const requiredColumns = ['id', 'name', 'email', 'role', 'is_active', 'permissions']
    const missingColumns = requiredColumns.filter(col => !columns.includes(col))

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      employeeCount: data?.length || 0,
      tableColumns: columns,
      missingColumns: missingColumns.length > 0 ? missingColumns : null,
      recommendation: missingColumns.length > 0 
        ? 'Some required columns are missing. Visit /api/database-setup-guide for setup instructions.'
        : 'Database structure looks good! You can proceed with user activation.',
      sampleEmployee: data?.[0] || 'No employees found'
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error.message,
      nextStep: 'Visit /api/database-setup-guide for setup instructions'
    })
  }
}
