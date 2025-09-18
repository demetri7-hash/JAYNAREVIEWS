-- Simple employee management setup (run manually in Supabase SQL editor)

-- 1. Add columns to profiles table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'toast_employee_id') THEN
        ALTER TABLE profiles ADD COLUMN toast_employee_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'employee_status') THEN
        ALTER TABLE profiles ADD COLUMN employee_status TEXT CHECK (employee_status IN ('active', 'archived')) DEFAULT 'active';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'archived_at') THEN
        ALTER TABLE profiles ADD COLUMN archived_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'archived_by') THEN
        ALTER TABLE profiles ADD COLUMN archived_by UUID;
    END IF;
END $$;

-- 2. Create employee_links table
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

-- 3. Create employee_activity_log table
CREATE TABLE IF NOT EXISTS employee_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  action_type TEXT NOT NULL,
  action_details JSONB,
  performed_by UUID REFERENCES profiles(id) NOT NULL,
  performed_at TIMESTAMP DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE employee_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_activity_log ENABLE ROW LEVEL SECURITY;