-- Employee Management System
-- Adds TOAST employee data linking and enhanced user management

-- 1. Add employee linking and status columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS toast_employee_id TEXT,
ADD COLUMN IF NOT EXISTS employee_status TEXT CHECK (employee_status IN ('active', 'archived')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES profiles(id);

-- 2. Create employee_links table for linking users to TOAST employee data
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

-- 3. Employee activity log for tracking changes
CREATE TABLE IF NOT EXISTS employee_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  action_type TEXT NOT NULL, -- 'role_change', 'archive', 'restore', 'link_employee', 'permission_change'
  action_details JSONB,
  performed_by UUID REFERENCES profiles(id) NOT NULL,
  performed_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE employee_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for employee_links
CREATE POLICY "Managers can view all employee links" ON employee_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id::text = auth.uid()::text 
      AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Managers can insert employee links" ON employee_links
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id::text = auth.uid()::text 
      AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Managers can update employee links" ON employee_links
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id::text = auth.uid()::text 
      AND profiles.role = 'manager'
    )
  );

-- RLS policies for employee_activity_log
CREATE POLICY "Managers can view all activity logs" ON employee_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id::text = auth.uid()::text 
      AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Managers can insert activity logs" ON employee_activity_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id::text = auth.uid()::text 
      AND profiles.role = 'manager'
    )
  );

-- Users can view their own employee link
CREATE POLICY "Users can view their own employee link" ON employee_links
  FOR SELECT USING (user_id::text = auth.uid()::text);
