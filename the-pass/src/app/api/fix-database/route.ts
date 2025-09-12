import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    const fixes = []
    const errors = []

    // Fix 1: Add missing department column to checklists table
    try {
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE checklists 
          ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'BOTH';
          
          UPDATE checklists 
          SET department = 'BOTH' 
          WHERE department IS NULL;
        `
      })

      if (alterError) {
        // Try alternative approach using direct SQL
        const { error: directError } = await supabase
          .from('checklists')
          .select('department')
          .limit(1)

        if (directError && directError.message.includes('does not exist')) {
          // We need to add the column via SQL execution
          fixes.push('Need to add department column to checklists table via Supabase SQL Editor')
          errors.push('Cannot alter table structure via API - requires direct SQL execution')
        }
      } else {
        fixes.push('Added department column to checklists table')
      }
    } catch (err: any) {
      errors.push(`Column addition error: ${err.message}`)
    }

    // Fix 2: Ensure manager employee exists
    try {
      const { data: managers, error: managerError } = await supabase
        .from('employees')
        .select('*')
        .eq('role', 'manager')
        .limit(1)

      if (managerError) {
        errors.push(`Manager check error: ${managerError.message}`)
      } else if (!managers || managers.length === 0) {
        // Create a manager employee
        const { data: newManager, error: createError } = await supabase
          .from('employees')
          .insert({
            name: 'Restaurant Manager',
            email: 'manager@jaynagyro.com',
            department: 'FOH',
            role: 'manager',
            is_active: true
          })
          .select()
          .single()

        if (createError) {
          errors.push(`Manager creation error: ${createError.message}`)
        } else {
          fixes.push('Created manager employee for workflow assignments')
        }
      } else {
        fixes.push('Manager employee already exists')
      }
    } catch (err: any) {
      errors.push(`Manager setup error: ${err.message}`)
    }

    const success = errors.length === 0
    const needsSqlEditor = errors.some(e => e.includes('requires direct SQL execution'))

    return NextResponse.json({
      success,
      fixes_applied: fixes,
      errors: errors,
      needs_manual_sql: needsSqlEditor,
      manual_sql_command: needsSqlEditor ? `
-- Run this in Supabase SQL Editor:
ALTER TABLE checklists 
ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'BOTH';

UPDATE checklists 
SET department = 'BOTH' 
WHERE department IS NULL;
      `.trim() : null,
      next_steps: needsSqlEditor ? [
        'Go to Supabase Dashboard > SQL Editor',
        'Run the provided SQL command',
        'Test workflow creation again'
      ] : [
        'Database should now be ready for workflow creation',
        'Test the create-jayna-workflows API'
      ]
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}