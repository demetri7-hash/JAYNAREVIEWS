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

    const body = await request.json();
    const { confirm } = body;
    
    if (!confirm) {
      return NextResponse.json({ 
        error: 'Please confirm schema setup by sending { "confirm": true }' 
      }, { status: 400 });
    }

    const setupSteps = [];

    try {
      // 1. Create time_tracking table
      const { error: tableError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS time_tracking (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            task_id UUID REFERENCES task_instances(id) ON DELETE CASCADE,
            employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
            start_time TIMESTAMPTZ NOT NULL,
            end_time TIMESTAMPTZ,
            duration_seconds INTEGER,
            session_data JSONB DEFAULT '[]',
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      });

      if (tableError) throw tableError;
      setupSteps.push('✓ Created time_tracking table');

      // 2. Add time tracking columns to task_instances
      const { error: columnError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE task_instances 
          ADD COLUMN IF NOT EXISTS actual_duration INTEGER,
          ADD COLUMN IF NOT EXISTS time_tracking_id UUID REFERENCES time_tracking(id) ON DELETE SET NULL;
        `
      });

      if (columnError) throw columnError;
      setupSteps.push('✓ Added time tracking columns to task_instances');

      // 3. Create productivity_insights table for aggregated data
      const { error: insightsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS productivity_insights (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            tasks_completed INTEGER DEFAULT 0,
            total_time_seconds INTEGER DEFAULT 0,
            avg_time_per_task_seconds INTEGER DEFAULT 0,
            efficiency_percentage DECIMAL(5,2) DEFAULT 100.00,
            focus_score DECIMAL(5,2) DEFAULT 0.00,
            break_time_seconds INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(employee_id, date)
          );
        `
      });

      if (insightsError) throw insightsError;
      setupSteps.push('✓ Created productivity_insights table');

      // 4. Create performance indexes
      const { error: indexError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_time_tracking_employee_date 
          ON time_tracking(employee_id, start_time);
          
          CREATE INDEX IF NOT EXISTS idx_time_tracking_task 
          ON time_tracking(task_id);
          
          CREATE INDEX IF NOT EXISTS idx_productivity_insights_employee_date 
          ON productivity_insights(employee_id, date);
          
          CREATE INDEX IF NOT EXISTS idx_task_instances_actual_duration 
          ON task_instances(actual_duration) WHERE actual_duration IS NOT NULL;
        `
      });

      if (indexError) throw indexError;
      setupSteps.push('✓ Created performance indexes');

      // 5. Create updated_at triggers
      const { error: triggerError } = await supabase.rpc('exec_sql', {
        sql: `
          DROP TRIGGER IF EXISTS update_time_tracking_updated_at ON time_tracking;
          DROP TRIGGER IF EXISTS update_productivity_insights_updated_at ON productivity_insights;
          
          CREATE TRIGGER update_time_tracking_updated_at
            BEFORE UPDATE ON time_tracking
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
            
          CREATE TRIGGER update_productivity_insights_updated_at
            BEFORE UPDATE ON productivity_insights
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        `
      });

      if (triggerError) throw triggerError;
      setupSteps.push('✓ Created updated_at triggers');

      // 6. Create function to calculate daily insights
      const { error: functionError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION calculate_daily_insights(employee_uuid UUID, target_date DATE)
          RETURNS productivity_insights AS $$
          DECLARE
            insight_record productivity_insights;
            total_time_sec INTEGER;
            task_count INTEGER;
            avg_time_sec INTEGER;
            efficiency_pct DECIMAL(5,2);
          BEGIN
            -- Calculate metrics for the day
            SELECT 
              COALESCE(SUM(duration_seconds), 0),
              COUNT(*) FILTER (WHERE end_time IS NOT NULL),
              COALESCE(AVG(duration_seconds) FILTER (WHERE end_time IS NOT NULL), 0)
            INTO total_time_sec, task_count, avg_time_sec
            FROM time_tracking tt
            WHERE tt.employee_id = employee_uuid
              AND DATE(tt.start_time) = target_date;
            
            -- Calculate efficiency (estimated vs actual time)
            SELECT COALESCE(AVG(
              CASE 
                WHEN ti.estimated_duration > 0 AND tt.duration_seconds > 0 
                THEN (ti.estimated_duration * 60.0) / tt.duration_seconds * 100.0
                ELSE 100.0
              END
            ), 100.0)
            INTO efficiency_pct
            FROM time_tracking tt
            JOIN task_instances ti ON tt.task_id = ti.id
            WHERE tt.employee_id = employee_uuid
              AND DATE(tt.start_time) = target_date
              AND tt.end_time IS NOT NULL
              AND ti.estimated_duration > 0;
            
            -- Insert or update insight record
            INSERT INTO productivity_insights (
              employee_id, date, tasks_completed, total_time_seconds,
              avg_time_per_task_seconds, efficiency_percentage
            ) VALUES (
              employee_uuid, target_date, task_count, total_time_sec,
              avg_time_sec, efficiency_pct
            )
            ON CONFLICT (employee_id, date) 
            DO UPDATE SET
              tasks_completed = EXCLUDED.tasks_completed,
              total_time_seconds = EXCLUDED.total_time_seconds,
              avg_time_per_task_seconds = EXCLUDED.avg_time_per_task_seconds,
              efficiency_percentage = EXCLUDED.efficiency_percentage,
              updated_at = NOW()
            RETURNING * INTO insight_record;
            
            RETURN insight_record;
          END;
          $$ LANGUAGE plpgsql;
        `
      });

      if (functionError) throw functionError;
      setupSteps.push('✓ Created daily insights calculation function');

      // 7. Create trigger to auto-calculate insights when time tracking is updated
      const { error: autoTriggerError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION trigger_calculate_insights()
          RETURNS TRIGGER AS $$
          BEGIN
            -- Calculate insights for the day when time tracking is updated
            PERFORM calculate_daily_insights(
              COALESCE(NEW.employee_id, OLD.employee_id),
              DATE(COALESCE(NEW.start_time, OLD.start_time))
            );
            RETURN COALESCE(NEW, OLD);
          END;
          $$ LANGUAGE plpgsql;
          
          DROP TRIGGER IF EXISTS auto_calculate_insights ON time_tracking;
          
          CREATE TRIGGER auto_calculate_insights
            AFTER INSERT OR UPDATE OR DELETE ON time_tracking
            FOR EACH ROW
            EXECUTE FUNCTION trigger_calculate_insights();
        `
      });

      if (autoTriggerError) throw autoTriggerError;
      setupSteps.push('✓ Created auto-calculation triggers');

      return NextResponse.json({
        success: true,
        message: 'Time tracking schema setup completed successfully',
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
    console.error('Time tracking schema setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
