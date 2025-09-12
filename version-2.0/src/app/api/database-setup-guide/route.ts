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
        suggestion: 'Please create the employees table in Supabase with the required columns'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      employeeCount: data?.length || 0,
      sampleData: data || [],
      tableStructure: data?.[0] ? Object.keys(data[0]) : 'No data to analyze structure'
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error.message
    })
  }
}

export async function POST(request: NextRequest) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Database Setup Guide - The Pass</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .container { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #007bff; }
        .sql-block { background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 5px; overflow-x: auto; font-family: 'Courier New', monospace; }
        .step { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border: 1px solid #dee2e6; }
        h1, h2 { color: #2d3748; }
        .warning { background: #fff3cd; border-color: #ffc107; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .success { background: #d1e7dd; border-color: #198754; padding: 10px; border-radius: 4px; margin: 10px 0; }
        code { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
    </style>
</head>
<body>
    <h1>🗄️ Database Setup Guide for The Pass</h1>
    
    <div class="warning">
        <strong>⚠️ If you're seeing database errors, you may need to create the employees table in Supabase.</strong>
    </div>

    <div class="container">
        <h2>Step 1: Go to Supabase Dashboard</h2>
        <div class="step">
            <p>1. Go to <a href="https://supabase.com/dashboard" target="_blank">Supabase Dashboard</a></p>
            <p>2. Select your project: <code>xedpssqxgmnwufatyoje</code></p>
            <p>3. Click on <strong>"SQL Editor"</strong> in the left sidebar</p>
        </div>
    </div>

    <div class="container">
        <h2>Step 2: Create the Employees Table</h2>
        <div class="step">
            <p>Copy and paste this SQL into the SQL Editor and click "Run":</p>
            <div class="sql-block">
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'lead', 'manager', 'admin')),
  department TEXT DEFAULT 'unassigned',
  shift_preference TEXT DEFAULT 'any',
  is_active BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '["view_workflows"]'::jsonb,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);

-- Create audit log table for tracking changes
CREATE TABLE IF NOT EXISTS user_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_employee_id UUID REFERENCES employees(id),
  performed_by UUID REFERENCES employees(id),
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
CREATE POLICY "Service role can do everything on employees" ON employees
  FOR ALL USING (true);

CREATE POLICY "Service role can do everything on audit log" ON user_audit_log
  FOR ALL USING (true);
            </div>
        </div>
    </div>

    <div class="container">
        <h2>Step 3: Verify the Setup</h2>
        <div class="step">
            <p>After running the SQL, test the setup:</p>
            <p>1. <a href="/api/database-test" target="_blank">Test Database Connection</a></p>
            <p>2. <a href="/debug" target="_blank">Return to Debug Interface</a></p>
        </div>
    </div>

    <div class="success">
        <strong>✅ Once this is done, you can return to the debug interface to activate your manager account!</strong>
    </div>

    <div class="container">
        <h2>What This Creates</h2>
        <div class="step">
            <ul>
                <li><strong>employees table</strong>: Stores user accounts with roles and permissions</li>
                <li><strong>user_audit_log table</strong>: Tracks all management actions</li>
                <li><strong>Indexes</strong>: For fast lookups by email, role, and status</li>
                <li><strong>Security policies</strong>: Allows your app to access the data</li>
            </ul>
        </div>
    </div>

</body>
</html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
