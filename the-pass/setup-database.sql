-- Jayna Gyro Workflow Management System Database Schema
-- Run this SQL in the Supabase SQL Editor to create all required tables

-- 1. Create employees table (required by existing API)
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100),
  role VARCHAR(50) DEFAULT 'employee',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create checklists table (required by existing API)
CREATE TABLE IF NOT EXISTS checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  department VARCHAR(100),
  estimated_duration INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create workflows table (required by existing API)
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  checklist_id UUID REFERENCES checklists(id),
  assigned_to UUID REFERENCES employees(id),
  assigned_by UUID REFERENCES employees(id),
  status VARCHAR(50) DEFAULT 'assigned',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create task_instances table (for individual tasks)
CREATE TABLE IF NOT EXISTS task_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  assigned_to UUID REFERENCES employees(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES employees(id),
  is_critical BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 1,
  notes TEXT,
  photo_url TEXT,
  estimated_duration INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflows_assigned_to ON workflows(assigned_to);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_task_instances_workflow ON task_instances(workflow_id);
CREATE INDEX IF NOT EXISTS idx_task_instances_status ON task_instances(status);
CREATE INDEX IF NOT EXISTS idx_task_instances_assigned_to ON task_instances(assigned_to);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_checklists_category ON checklists(category);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_instances ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for public access (temporary for setup)
CREATE POLICY "Allow all operations on employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on checklists" ON checklists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on workflows" ON workflows FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on task_instances" ON task_instances FOR ALL USING (true) WITH CHECK (true);

-- 8. Insert a default employee for testing
INSERT INTO employees (name, email, department, role) 
VALUES ('Restaurant Manager', 'manager@jaynagyro.com', 'Management', 'manager')
ON CONFLICT (email) DO NOTHING;

-- Confirmation message
SELECT 'Database schema created successfully! Ready for Jayna Gyro workflows.' as status;