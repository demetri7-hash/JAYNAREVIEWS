-- Create role permissions and user permission overrides tables
-- File: supabase/migrations/20250916120000_add_role_permissions_system.sql

-- Table for storing role-based department permissions
CREATE TABLE role_permissions (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, department)
);

-- Table for storing user-specific permission overrides
CREATE TABLE user_permission_overrides (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  access_granted BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, department)
);

-- Insert default role permissions based on current system
INSERT INTO role_permissions (role, department) VALUES
  -- Staff has no default departments (only assigned tasks)
  
  -- FOH Team Member
  ('foh_team_member', 'FOH'),
  ('foh_team_member', 'CLEAN'),
  ('foh_team_member', 'TRANSITION'),
  
  -- BOH Team Member  
  ('boh_team_member', 'BOH'),
  ('boh_team_member', 'PREP'),
  
  -- Kitchen Manager
  ('kitchen_manager', 'BOH'),
  ('kitchen_manager', 'PREP'),
  
  -- Ordering Manager
  ('ordering_manager', 'BOH'),
  ('ordering_manager', 'PREP'),
  
  -- Lead Prep Cook
  ('lead_prep_cook', 'BOH'),
  ('lead_prep_cook', 'PREP'),
  
  -- Assistant FOH Manager
  ('assistant_foh_manager', 'FOH'),
  ('assistant_foh_manager', 'TRANSITION'),
  
  -- General Manager (all access)
  ('manager', 'BOH'),
  ('manager', 'FOH'),
  ('manager', 'AM'),
  ('manager', 'PM'),
  ('manager', 'PREP'),
  ('manager', 'CLEAN'),
  ('manager', 'CATERING'),
  ('manager', 'SPECIAL'),
  ('manager', 'TRANSITION');

-- Enable RLS (Row Level Security)
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permission_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for role_permissions
CREATE POLICY "Managers can view role permissions" 
  ON role_permissions FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('manager', 'kitchen_manager', 'ordering_manager', 'assistant_foh_manager')
    )
  );

CREATE POLICY "Managers can modify role permissions" 
  ON role_permissions FOR ALL
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'manager'
    )
  );

-- RLS Policies for user_permission_overrides  
CREATE POLICY "Managers can view user permission overrides" 
  ON user_permission_overrides FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('manager', 'kitchen_manager', 'ordering_manager', 'assistant_foh_manager')
    )
  );

CREATE POLICY "Managers can modify user permission overrides" 
  ON user_permission_overrides FOR ALL
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'manager'
    )
  );