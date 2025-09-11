import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Update employees table to support authentication and roles
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add authentication and role columns to employees table
        ALTER TABLE employees 
        ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
        ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'employee',
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '["view_workflows"]'::jsonb,
        ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
        ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

        -- Create index on email for faster lookups
        CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
        CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
        CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);

        -- Create user_sessions table for session management
        CREATE TABLE IF NOT EXISTS user_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
          session_token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );

        -- Create audit log for user management actions
        CREATE TABLE IF NOT EXISTS user_audit_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          action VARCHAR(100) NOT NULL, -- 'role_change', 'activate', 'deactivate', 'permission_change'
          target_employee_id UUID REFERENCES employees(id),
          performed_by UUID REFERENCES employees(id),
          old_values JSONB,
          new_values JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        );

        -- Function to update updated_at timestamp
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        -- Create trigger for updated_at
        DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
        CREATE TRIGGER update_employees_updated_at
          BEFORE UPDATE ON employees
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `
    })

    if (alterError) {
      console.error('Database update error:', alterError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update database schema',
        details: alterError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Database schema updated for authentication and role management'
    })

  } catch (error: any) {
    console.error('Schema update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
