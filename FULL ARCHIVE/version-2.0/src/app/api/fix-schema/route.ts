import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    // First, let's try to add the missing department column using raw SQL
    console.log('Attempting to add department column to checklists...')
    
    // Try using the sql method directly
    const { data, error } = await supabase.rpc('sql', {
      query: `
        ALTER TABLE checklists 
        ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'BOTH';
        
        ALTER TABLE checklists 
        ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 30;
      `
    })

    if (error) {
      console.log('RPC sql failed, trying alternative method:', error.message)
      
      // Alternative: try to update an existing record to trigger column creation
      const { error: testError } = await supabase
        .from('checklists')
        .update({ department: 'BOTH' })
        .eq('id', 'non-existent-id')
      
      return NextResponse.json({
        success: false,
        message: 'Column addition failed - need manual database setup',
        sql_needed: `
          -- Run this SQL in Supabase SQL Editor:
          ALTER TABLE checklists ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'BOTH';
          ALTER TABLE checklists ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 30;
          UPDATE checklists SET department = 'BOTH' WHERE department IS NULL;
        `,
        error: error.message,
        alternative_error: testError?.message
      })
    }

    // Verify the column was added
    const { data: verifyData, error: verifyError } = await supabase
      .from('checklists')
      .select('id, name, department')
      .limit(1)

    if (verifyError) {
      return NextResponse.json({
        success: false,
        message: 'Column addition succeeded but verification failed',
        verify_error: verifyError.message
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully added department column to checklists table',
      verification: verifyData
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Please run the setup-database.sql script manually in Supabase SQL Editor'
    }, { status: 500 })
  }
}