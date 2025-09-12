-- Jayna Gyro Workflow Management System Database Schema
-- Run this SQL in the Supabase SQL Editor to create all required tables

-- 1. Create workflow_templates table
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_title VARCHAR(255) NOT NULL,
  checklist_description TEXT,
  department VARCHAR(100),
  estimated_duration INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  language VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create workflow_tasks table
CREATE TABLE IF NOT EXISTS workflow_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
  task_title VARCHAR(255) NOT NULL,
  task_description TEXT,
  sort_order INTEGER DEFAULT 1,
  estimated_duration INTEGER DEFAULT 5,
  section VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create workflow_role_assignments table
CREATE TABLE IF NOT EXISTS workflow_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
  role_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create workflow_instances table
CREATE TABLE IF NOT EXISTS workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_template_id UUID REFERENCES workflow_templates(id),
  checklist_title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to_email VARCHAR(255),
  assigned_by_email VARCHAR(255),
  assigned_by_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create workflow_task_instances table
CREATE TABLE IF NOT EXISTS workflow_task_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
  task_title VARCHAR(255) NOT NULL,
  task_description TEXT,
  sort_order INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by VARCHAR(255),
  notes TEXT,
  photo_url TEXT,
  estimated_duration INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_workflow_instances_assigned_to ON workflow_instances(assigned_to_email);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX IF NOT EXISTS idx_workflow_task_instances_workflow ON workflow_task_instances(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_workflow_task_instances_status ON workflow_task_instances(status);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_template ON workflow_tasks(workflow_template_id);
CREATE INDEX IF NOT EXISTS idx_workflow_role_assignments_template ON workflow_role_assignments(workflow_template_id);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_task_instances ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for public access (temporary for setup)
CREATE POLICY "Allow all operations on workflow_templates" ON workflow_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on workflow_tasks" ON workflow_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on workflow_role_assignments" ON workflow_role_assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on workflow_instances" ON workflow_instances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on workflow_task_instances" ON workflow_task_instances FOR ALL USING (true) WITH CHECK (true);

-- Confirmation message
SELECT 'Database schema created successfully! Ready for Jayna Gyro workflows.' as status;