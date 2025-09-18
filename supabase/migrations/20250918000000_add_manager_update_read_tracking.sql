-- Add read tracking for manager updates
-- File: supabase/migrations/20250918000000_add_manager_update_read_tracking.sql

-- Table for tracking which users have read which manager updates
CREATE TABLE IF NOT EXISTS manager_update_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id UUID NOT NULL REFERENCES manager_updates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(update_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_manager_update_reads_update_id ON manager_update_reads(update_id);
CREATE INDEX IF NOT EXISTS idx_manager_update_reads_user_id ON manager_update_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_manager_update_reads_composite ON manager_update_reads(update_id, user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE manager_update_reads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own read status" ON manager_update_reads
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'kitchen_manager', 'ordering_manager', 'assistant_foh_manager')
  ));

CREATE POLICY "Users can mark updates as read" ON manager_update_reads
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own read status" ON manager_update_reads
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own read status" ON manager_update_reads
  FOR DELETE USING (user_id = auth.uid());