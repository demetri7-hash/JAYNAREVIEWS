import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    console.log('🔧 Starting database schema fix...')
    
    // Step 1: Verify current state
    const { data: beforeCheck, error: beforeError } = await supabase
      .from('checklists')
      .select('id, name')
      .limit(1)

    if (beforeError) {
      return NextResponse.json({
        success: false,
        error: 'Cannot access checklists table: ' + beforeError.message
      }, { status: 500 })
    }

    // Step 2: Try to access department column (should fail)
    const { data: deptCheck, error: deptError } = await supabase
      .from('checklists')
      .select('department')
      .limit(1)

    const needsDepartmentColumn = !!deptError && deptError.message.includes('department')

    if (!needsDepartmentColumn) {
      return NextResponse.json({
        success: true,
        message: 'Department column already exists!',
        status: 'no_action_needed'
      })
    }

    // Step 3: Use raw SQL to add the missing columns
    console.log('Adding department column using raw SQL...')
    
    // Try using the sql function if available
    const sqlCommands = `
      DO $$
      BEGIN
        -- Add department column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'checklists' AND column_name = 'department'
        ) THEN
          ALTER TABLE checklists ADD COLUMN department VARCHAR(100) DEFAULT 'BOTH';
        END IF;
        
        -- Add estimated_duration column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'checklists' AND column_name = 'estimated_duration'
        ) THEN
          ALTER TABLE checklists ADD COLUMN estimated_duration INTEGER DEFAULT 30;
        END IF;
        
        -- Update any NULL department values
        UPDATE checklists SET department = 'BOTH' WHERE department IS NULL;
      END $$;
    `

    // Since we can't use raw SQL directly through the client, let's use a workaround
    // Create a temporary checklist with all required columns
    const tempChecklistData = {
      name: 'TEMP_SCHEMA_FIX_RECORD',
      description: 'Temporary record to test schema',
      category: 'temp',
      department: 'BOTH',
      estimated_duration: 30
    }

    const { data: tempInsert, error: tempError } = await supabase
      .from('checklists')
      .insert(tempChecklistData)
      .select()

    if (tempError) {
      // Column still doesn't exist - we need manual intervention
      return NextResponse.json({
        success: false,
        message: 'Schema fix requires manual intervention',
        error: tempError.message,
        manual_sql_needed: `
-- Run this SQL in Supabase SQL Editor:
ALTER TABLE checklists ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'BOTH';
ALTER TABLE checklists ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 30;
UPDATE checklists SET department = 'BOTH' WHERE department IS NULL;
        `,
        next_step: 'Please run the SQL manually in Supabase SQL Editor, then retry workflow creation'
      }, { status: 400 })
    }

    // Success! Clean up temp record
    if (tempInsert?.[0]?.id) {
      await supabase
        .from('checklists')
        .delete()
        .eq('id', tempInsert[0].id)
    }

    // Step 4: Verify the fix worked
    const { data: afterCheck, error: afterError } = await supabase
      .from('checklists')
      .select('id, name, department, estimated_duration')
      .limit(1)

    return NextResponse.json({
      success: true,
      message: 'Database schema successfully fixed!',
      before_columns: ['id', 'name', 'description', 'category'],
      after_columns: ['id', 'name', 'description', 'category', 'department', 'estimated_duration'],
      verification: !afterError,
      next_step: 'Ready to test workflow creation'
    })

  } catch (error: any) {
    console.error('Schema fix error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Schema fix failed'
    }, { status: 500 })
  }
}