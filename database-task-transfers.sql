-- Task Transfer System Database Addition
-- Add task transfers table for handling task reassignment workflow

-- 5. Task Transfers (multi-step approval process)
CREATE TABLE IF NOT EXISTS task_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES profiles(id) NOT NULL,
  to_user_id UUID REFERENCES profiles(id) NOT NULL,
  requested_by UUID REFERENCES profiles(id) NOT NULL,
  status TEXT CHECK (status IN ('pending_transferee', 'pending_manager', 'approved', 'rejected')) DEFAULT 'pending_transferee',
  transfer_reason TEXT,
  transferee_response TEXT,
  manager_response TEXT,
  
  -- Timestamps for tracking approval workflow
  requested_at TIMESTAMP DEFAULT NOW(),
  transferee_responded_at TIMESTAMP,
  manager_responded_at TIMESTAMP,
  
  -- Constraint: from_user and to_user must be different
  CHECK (from_user_id != to_user_id)
);

-- Enable Row Level Security for transfers
ALTER TABLE task_transfers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Task Transfers

-- Users can view transfers they're involved in (from, to, or requesting)
CREATE POLICY "Users can view their transfers" ON task_transfers 
  FOR SELECT USING (
    auth.uid()::text = from_user_id::text OR 
    auth.uid()::text = to_user_id::text OR 
    auth.uid()::text = requested_by::text
  );

-- Users can create transfers for their own assignments
CREATE POLICY "Users can create transfers for own assignments" ON task_transfers 
  FOR INSERT WITH CHECK (
    auth.uid()::text = from_user_id::text AND
    auth.uid()::text = requested_by::text
  );

-- Users can update transfers they're involved in (for approval/rejection)
CREATE POLICY "Users can update transfers they're involved in" ON task_transfers 
  FOR UPDATE USING (
    auth.uid()::text = to_user_id::text OR -- transferee can approve/reject
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id::text = auth.uid()::text 
      AND profiles.role = 'manager'
    ) -- managers can approve/reject
  );

-- Managers can view all transfers for oversight
CREATE POLICY "Managers can view all transfers" ON task_transfers 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id::text = auth.uid()::text 
      AND profiles.role = 'manager'
    )
  );

-- Add index for performance on common queries
CREATE INDEX IF NOT EXISTS idx_task_transfers_status ON task_transfers (status);
CREATE INDEX IF NOT EXISTS idx_task_transfers_assignment ON task_transfers (assignment_id);
CREATE INDEX IF NOT EXISTS idx_task_transfers_to_user ON task_transfers (to_user_id);
CREATE INDEX IF NOT EXISTS idx_task_transfers_from_user ON task_transfers (from_user_id);