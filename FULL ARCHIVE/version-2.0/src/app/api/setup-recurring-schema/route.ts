import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (optional security check)
    const body = await request.json();
    const { confirm } = body;
    
    if (!confirm) {
      return NextResponse.json({ 
        error: 'Please confirm schema setup by sending { "confirm": true }' 
      }, { status: 400 });
    }

    const setupSteps = [];

    try {
      // 1. Create recurring_workflows table
      const { error: tableError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS recurring_workflows (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
            recurrence_pattern TEXT NOT NULL CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly')),
            recurrence_config JSONB NOT NULL DEFAULT '{}',
            assigned_to TEXT[] NOT NULL DEFAULT '{}',
            assigned_by TEXT NOT NULL,
            assigned_by_name TEXT NOT NULL,
            is_active BOOLEAN DEFAULT true,
            next_assignment TIMESTAMPTZ NOT NULL,
            last_assigned TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      });

      if (tableError) throw tableError;
      setupSteps.push('✓ Created recurring_workflows table');

      // 2. Add recurring_workflow_id to workflow_instances (optional foreign key)
      const { error: columnError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE workflow_instances 
          ADD COLUMN IF NOT EXISTS recurring_workflow_id UUID REFERENCES recurring_workflows(id) ON DELETE SET NULL;
        `
      });

      if (columnError) throw columnError;
      setupSteps.push('✓ Added recurring_workflow_id column to workflow_instances');

      // 3. Create indexes for performance
      const { error: indexError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_recurring_workflows_next_assignment 
          ON recurring_workflows(next_assignment) WHERE is_active = true;
          
          CREATE INDEX IF NOT EXISTS idx_recurring_workflows_template 
          ON recurring_workflows(template_id);
          
          CREATE INDEX IF NOT EXISTS idx_workflow_instances_recurring 
          ON workflow_instances(recurring_workflow_id) WHERE recurring_workflow_id IS NOT NULL;
        `
      });

      if (indexError) throw indexError;
      setupSteps.push('✓ Created performance indexes');

      // 4. Create updated_at trigger
      const { error: triggerError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
          END;
          $$ language 'plpgsql';

          DROP TRIGGER IF EXISTS update_recurring_workflows_updated_at ON recurring_workflows;
          
          CREATE TRIGGER update_recurring_workflows_updated_at
            BEFORE UPDATE ON recurring_workflows
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        `
      });

      if (triggerError) throw triggerError;
      setupSteps.push('✓ Created updated_at trigger');

      // 5. Create workflow_templates table if it doesn't exist
      const { error: templatesError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS workflow_templates (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            estimated_duration INTEGER DEFAULT 30,
            created_by TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS workflow_template_tasks (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
            task_title TEXT NOT NULL,
            task_description TEXT,
            sort_order INTEGER NOT NULL DEFAULT 0,
            estimated_duration INTEGER DEFAULT 10,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      });

      if (templatesError) throw templatesError;
      setupSteps.push('✓ Ensured workflow_templates tables exist');

      return NextResponse.json({
        success: true,
        message: 'Recurring workflows schema setup completed successfully',
        steps: setupSteps
      });

    } catch (dbError) {
      console.error('Database setup error:', dbError);
      return NextResponse.json({ 
        error: 'Database setup failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown error',
        completedSteps: setupSteps
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Schema setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
