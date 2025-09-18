-- Create manager updates and acknowledgments system
-- File: supabase/migrations/20250916130000_add_manager_updates_system.sql

-- Table for storing manager updates/announcements
CREATE TABLE manager_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  type TEXT NOT NULL CHECK (type IN ('announcement', 'alert', 'policy', 'emergency')),
  requires_acknowledgment BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Table for tracking user acknowledgments of critical updates
CREATE TABLE update_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id UUID NOT NULL REFERENCES manager_updates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name_entered TEXT NOT NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  UNIQUE(update_id, user_id)
);

-- Insert some sample manager updates (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM manager_updates WHERE title = 'New Team Member Roles Available') THEN
    INSERT INTO manager_updates (title, message, priority, type, requires_acknowledgment, created_by) VALUES
      (
        'New Team Member Roles Available',
        'FOH and BOH Team Member roles have been added for better department management. Please review the updated role assignments.',
        'medium',
        'announcement',
        FALSE,
        (SELECT id FROM profiles WHERE role = 'manager' LIMIT 1)
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM manager_updates WHERE title = 'Updated Safety Protocols - MANDATORY ACKNOWLEDGMENT') THEN
    INSERT INTO manager_updates (title, message, priority, type, requires_acknowledgment, created_by) VALUES
      (
        'Updated Safety Protocols - MANDATORY ACKNOWLEDGMENT',
        'New safety protocols are now in effect. All team members must read and acknowledge these changes before their next shift. Failure to acknowledge will result in shift suspension.',
        'critical',
        'policy',
        TRUE,
        (SELECT id FROM profiles WHERE role = 'manager' LIMIT 1)
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM manager_updates WHERE title = 'Outstanding Team Performance!') THEN
    INSERT INTO manager_updates (title, message, priority, type, requires_acknowledgment, created_by) VALUES
      (
        'Outstanding Team Performance!',
        'Team completion rate is above 85% this week! Keep up the great work! Pizza party scheduled for Friday.',
        'high',
        'announcement',
        FALSE,
        (SELECT id FROM profiles WHERE role = 'manager' LIMIT 1)
      );
  END IF;
END $$;

-- Enable RLS (Row Level Security)
ALTER TABLE manager_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_acknowledgments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for manager_updates
CREATE POLICY "All authenticated users can view active manager updates" 
  ON manager_updates FOR SELECT 
  TO authenticated 
  USING (is_active = TRUE);

CREATE POLICY "Only managers can create/modify manager updates" 
  ON manager_updates FOR ALL
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('manager', 'kitchen_manager', 'ordering_manager', 'assistant_foh_manager')
    )
  );

-- RLS Policies for update_acknowledgments
CREATE POLICY "Users can view their own acknowledgments" 
  ON update_acknowledgments FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own acknowledgments" 
  ON update_acknowledgments FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Managers can view all acknowledgments" 
  ON update_acknowledgments FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('manager', 'kitchen_manager', 'ordering_manager', 'assistant_foh_manager')
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_manager_updates_active ON manager_updates(is_active, created_at DESC);
CREATE INDEX idx_manager_updates_requires_ack ON manager_updates(requires_acknowledgment, is_active);
CREATE INDEX idx_update_acknowledgments_user ON update_acknowledgments(user_id);
CREATE INDEX idx_update_acknowledgments_update ON update_acknowledgments(update_id);