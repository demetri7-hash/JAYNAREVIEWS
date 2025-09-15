-- Archive System for Weekly Task Reports
-- This adds tables to support Monday morning auto-archiving and weekly reports

-- 1. Archived Assignments (completed tasks moved here weekly)
CREATE TABLE IF NOT EXISTS archived_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_assignment_id UUID NOT NULL, -- reference to original assignment
  task_id UUID REFERENCES tasks(id),
  assigned_to UUID REFERENCES profiles(id),
  assigned_by UUID REFERENCES profiles(id),
  due_date TIMESTAMP NOT NULL,
  status TEXT NOT NULL, -- will be 'completed' for archived items
  created_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP NOT NULL,
  completed_by UUID REFERENCES profiles(id),
  notes TEXT,
  photo_url TEXT,
  archived_at TIMESTAMP DEFAULT NOW(),
  week_ending DATE NOT NULL -- which week this belongs to (Sunday date)
);

-- 2. Weekly Reports (summary reports generated Monday mornings)
CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_ending DATE NOT NULL, -- Sunday date for the week
  total_tasks_completed INTEGER NOT NULL DEFAULT 0,
  total_tasks_assigned INTEGER NOT NULL DEFAULT 0,
  completion_rate DECIMAL(5,2) NOT NULL DEFAULT 0, -- percentage
  total_users_active INTEGER NOT NULL DEFAULT 0,
  top_performer_id UUID REFERENCES profiles(id),
  top_performer_completions INTEGER DEFAULT 0,
  report_data JSONB, -- detailed breakdown by user, department, etc.
  generated_at TIMESTAMP DEFAULT NOW()
);

-- 3. User Weekly Stats (individual performance for each week)
CREATE TABLE IF NOT EXISTS user_weekly_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  week_ending DATE NOT NULL,
  tasks_assigned INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  completion_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  tasks_overdue INTEGER NOT NULL DEFAULT 0,
  avg_completion_time INTERVAL, -- average time to complete tasks
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, week_ending)
);

-- Enable Row Level Security
ALTER TABLE archived_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_weekly_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Archived Assignments
CREATE POLICY "archived_assignments_select" ON archived_assignments
    FOR SELECT USING (true); -- All authenticated users can view archived data

CREATE POLICY "archived_assignments_insert" ON archived_assignments
    FOR INSERT WITH CHECK (true); -- System can insert during archiving

-- RLS Policies for Weekly Reports
CREATE POLICY "weekly_reports_select" ON weekly_reports
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'manager'
      )
    ); -- Only managers can view reports

CREATE POLICY "weekly_reports_insert" ON weekly_reports
    FOR INSERT WITH CHECK (true); -- System can insert during archiving

-- RLS Policies for User Weekly Stats
CREATE POLICY "user_weekly_stats_select" ON user_weekly_stats
    FOR SELECT USING (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'manager'
      )
    ); -- Users can see their own stats, managers can see all

CREATE POLICY "user_weekly_stats_insert" ON user_weekly_stats
    FOR INSERT WITH CHECK (true); -- System can insert during archiving

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_archived_assignments_week_ending ON archived_assignments(week_ending);
CREATE INDEX IF NOT EXISTS idx_archived_assignments_assigned_to ON archived_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_week_ending ON weekly_reports(week_ending);
CREATE INDEX IF NOT EXISTS idx_user_weekly_stats_user_week ON user_weekly_stats(user_id, week_ending);