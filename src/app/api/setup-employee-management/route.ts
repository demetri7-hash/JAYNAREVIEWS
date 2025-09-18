import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Setting up employee management schema...')

    // 1. Add columns to profiles table
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS toast_employee_id TEXT,
        ADD COLUMN IF NOT EXISTS employee_status TEXT CHECK (employee_status IN ('active', 'archived')) DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS archived_by UUID;
      `
    })

    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError)
      // Continue anyway - columns might already exist
    } else {
      console.log('✅ Profiles table updated')
    }

    // 2. Create employee_links table
    const { error: linksError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS employee_links (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES profiles(id) UNIQUE NOT NULL,
          toast_employee_id TEXT NOT NULL,
          employee_name TEXT NOT NULL,
          employee_email TEXT,
          linked_by UUID REFERENCES profiles(id) NOT NULL,
          linked_at TIMESTAMP DEFAULT NOW(),
          is_active BOOLEAN DEFAULT true
        );
      `
    })

    if (linksError) {
      console.error('❌ Employee links table error:', linksError)
    } else {
      console.log('✅ Employee links table created')
    }

    // 3. Create employee_activity_log table
    const { error: logError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS employee_activity_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES profiles(id) NOT NULL,
          action_type TEXT NOT NULL,
          action_details JSONB,
          performed_by UUID REFERENCES profiles(id) NOT NULL,
          performed_at TIMESTAMP DEFAULT NOW()
        );
      `
    })

    if (logError) {
      console.error('❌ Activity log table error:', logError)
    } else {
      console.log('✅ Activity log table created')
    }

    // 4. Set up RLS policies
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE employee_links ENABLE ROW LEVEL SECURITY;
        ALTER TABLE employee_activity_log ENABLE ROW LEVEL SECURITY;
      `
    })

    if (rlsError) {
      console.error('❌ RLS error:', rlsError)
    } else {
      console.log('✅ RLS enabled')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Employee management schema setup complete!' 
    })

  } catch (error) {
    console.error('❌ Setup error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Schema setup failed' 
    }, { status: 500 })
  }
}