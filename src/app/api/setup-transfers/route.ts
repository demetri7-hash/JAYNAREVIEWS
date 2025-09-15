import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    console.log('Setting up task transfers table...')

    // Create task_transfers table with direct SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS task_transfers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
        from_user_id UUID REFERENCES profiles(id) NOT NULL,
        to_user_id UUID REFERENCES profiles(id) NOT NULL,
        requested_by UUID REFERENCES profiles(id) NOT NULL,
        status TEXT CHECK (status IN ('pending_transferee', 'pending_manager', 'approved', 'rejected')) DEFAULT 'pending_transferee',
        transfer_reason TEXT,
        transferee_response TEXT,
        manager_response TEXT,
        requested_at TIMESTAMP DEFAULT NOW(),
        transferee_responded_at TIMESTAMP,
        manager_responded_at TIMESTAMP,
        CHECK (from_user_id != to_user_id)
      );
    `

    const { error: createError } = await supabase
      .from('task_transfers')
      .select('id')
      .limit(1)
    
    // If table doesn't exist, the query will fail, so we create it
    if (createError && createError.message?.includes('does not exist')) {
      // Need to use a direct connection or Supabase admin for DDL
      console.log('Table does not exist, creating...')
      
      // For now, return instructions to create manually
      return NextResponse.json({ 
        success: false,
        message: 'Task transfers table needs to be created manually',
        sql: createTableSQL
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Task transfers table setup checked' 
    })

  } catch (error) {
    console.error('Error setting up task transfers:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      note: 'You may need to run the SQL manually in Supabase dashboard'
    }, { status: 500 })
  }
}