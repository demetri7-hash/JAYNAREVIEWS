-- Workflow Management System Migration
-- Run this in your Supabase SQL editor

-- Core checklist templates (created by managers)
CREATE TABLE checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  department TEXT CHECK (department IN ('FOH', 'BOH', 'BOTH')) DEFAULT 'BOTH',
  category TEXT, -- 'opening', 'closing', 'daily', 'weekly', etc.
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual tasks within checklists
CREATE TABLE checklist_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  estimated_minutes INTEGER, -- estimated completion time
  requires_photo BOOLEAN DEFAULT false,
  requires_note BOOLEAN DEFAULT false,
  sort_order INTEGER NOT NULL, -- for drag-drop reordering
  is_critical BOOLEAN DEFAULT false, -- critical tasks block completion
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow instances (when a checklist is assigned/started)
CREATE TABLE workflow_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID REFERENCES checklists(id),
  name TEXT NOT NULL, -- e.g., "Morning Opening - Sept 12, 2025"
  assigned_to UUID REFERENCES employees(id),
  assigned_by UUID REFERENCES employees(id),
  department TEXT CHECK (department IN ('FOH', 'BOH', 'BOTH')),
  status TEXT CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')) DEFAULT 'assigned',
  due_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual task instances within workflow instances
CREATE TABLE task_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
  checklist_task_id UUID REFERENCES checklist_tasks(id),
  title TEXT NOT NULL, -- copied from checklist_task for flexibility
  description TEXT,
  assigned_to UUID REFERENCES employees(id), -- can be reassigned individually
  reassigned_by UUID REFERENCES employees(id), -- who reassigned it
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'blocked')) DEFAULT 'pending',
  sort_order INTEGER NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_note TEXT,
  photo_url TEXT,
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  is_critical BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments and communication on tasks
CREATE TABLE task_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_instance_id UUID REFERENCES task_instances(id) ON DELETE CASCADE,
  user_id UUID REFERENCES employees(id),
  comment TEXT NOT NULL,
  is_system_message BOOLEAN DEFAULT false, -- for reassignment notifications
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit trail for task reassignments and status changes
CREATE TABLE task_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_instance_id UUID REFERENCES task_instances(id) ON DELETE CASCADE,
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'assigned', 'reassigned', 'status_changed', 'completed'
  old_value TEXT,
  new_value TEXT,
  performed_by UUID REFERENCES employees(id),
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Workflow templates for quick creation
CREATE TABLE workflow_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  department TEXT CHECK (department IN ('FOH', 'BOH', 'BOTH')) DEFAULT 'BOTH',
  checklist_ids UUID[], -- array of checklist IDs to include
  default_assignee_role TEXT, -- 'employee', 'manager', etc.
  auto_assign BOOLEAN DEFAULT false, -- auto-assign based on schedule
  created_by UUID REFERENCES employees(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences for workflow notifications
CREATE TABLE user_workflow_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES employees(id),
  email_notifications BOOLEAN DEFAULT true,
  task_reminder_minutes INTEGER DEFAULT 30, -- remind X minutes before due
  auto_accept_reassignments BOOLEAN DEFAULT true,
  preferred_view TEXT DEFAULT 'list', -- 'list', 'kanban', 'calendar'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_workflow_instances_assigned_to ON workflow_instances(assigned_to);
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX idx_task_instances_assigned_to ON task_instances(assigned_to);
CREATE INDEX idx_task_instances_status ON task_instances(status);
CREATE INDEX idx_task_instances_workflow ON task_instances(workflow_instance_id);
CREATE INDEX idx_checklist_tasks_checklist ON checklist_tasks(checklist_id, sort_order);
CREATE INDEX idx_task_audit_log_task ON task_audit_log(task_instance_id);

-- Views for common queries
CREATE VIEW active_workflow_summary AS
SELECT 
  wi.id,
  wi.name,
  wi.status,
  wi.assigned_to,
  e.name as assignee_name,
  wi.due_date,
  wi.total_tasks,
  wi.completed_tasks,
  ROUND((wi.completed_tasks::float / NULLIF(wi.total_tasks, 0)) * 100, 1) as completion_percentage,
  wi.created_at,
  wi.updated_at
FROM workflow_instances wi
JOIN employees e ON wi.assigned_to = e.id
WHERE wi.status IN ('assigned', 'in_progress');

CREATE VIEW user_task_summary AS
SELECT 
  ti.id,
  ti.title,
  ti.status,
  ti.assigned_to,
  wi.name as workflow_name,
  wi.due_date,
  ti.estimated_minutes,
  ti.is_critical,
  ti.created_at,
  ti.updated_at
FROM task_instances ti
JOIN workflow_instances wi ON ti.workflow_instance_id = wi.id
WHERE ti.status IN ('pending', 'in_progress');

-- Insert some sample data based on your reference documents
INSERT INTO checklists (name, description, department, category, created_by) VALUES
('FOH Opening Checklist', 'Complete opening procedures for front of house', 'FOH', 'opening', (SELECT id FROM employees WHERE role = 'manager' LIMIT 1)),
('BOH Cleaning Opening', 'Back of house opening cleaning procedures', 'BOH', 'opening', (SELECT id FROM employees WHERE role = 'manager' LIMIT 1)),
('Bar Closing Procedures', 'Complete bar closing and inventory', 'FOH', 'closing', (SELECT id FROM employees WHERE role = 'manager' LIMIT 1)),
('Daily Prep Worksheet', 'Daily food preparation checklist', 'BOH', 'daily', (SELECT id FROM employees WHERE role = 'manager' LIMIT 1));

-- Sample tasks for FOH Opening
INSERT INTO checklist_tasks (checklist_id, title, description, estimated_minutes, sort_order, is_critical) VALUES
((SELECT id FROM checklists WHERE name = 'FOH Opening Checklist'), 'Unlock front door and disarm alarm', 'Turn off alarm system and unlock main entrance', 2, 1, true),
((SELECT id FROM checklists WHERE name = 'FOH Opening Checklist'), 'Turn on all lights and music', 'Activate lighting and background music systems', 3, 2, false),
((SELECT id FROM checklists WHERE name = 'FOH Opening Checklist'), 'Check dining room cleanliness', 'Inspect tables, chairs, and floor for cleanliness', 5, 3, true),
((SELECT id FROM checklists WHERE name = 'FOH Opening Checklist'), 'Set up POS system', 'Boot up and test point of sale system', 5, 4, true),
((SELECT id FROM checklists WHERE name = 'FOH Opening Checklist'), 'Check restroom supplies', 'Verify toilet paper, soap, and paper towels', 3, 5, false);

-- Sample tasks for BOH Cleaning
INSERT INTO checklist_tasks (checklist_id, title, description, estimated_minutes, sort_order, is_critical, requires_photo) VALUES
((SELECT id FROM checklists WHERE name = 'BOH Cleaning Opening'), 'Clean and sanitize prep surfaces', 'Wipe down all prep tables with sanitizer', 10, 1, true, true),
((SELECT id FROM checklists WHERE name = 'BOH Cleaning Opening'), 'Check equipment temperatures', 'Verify refrigeration and heating equipment temps', 5, 2, true, false),
((SELECT id FROM checklists WHERE name = 'BOH Cleaning Opening'), 'Stock cleaning supplies', 'Ensure adequate cleaning chemicals and tools', 5, 3, false, false),
((SELECT id FROM checklists WHERE name = 'BOH Cleaning Opening'), 'Empty trash and replace liners', 'Clear all waste containers and install new liners', 8, 4, false, false);

-- Create a function to update workflow completion counts
CREATE OR REPLACE FUNCTION update_workflow_completion_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total and completed task counts for the workflow
  UPDATE workflow_instances 
  SET 
    total_tasks = (
      SELECT COUNT(*) 
      FROM task_instances 
      WHERE workflow_instance_id = NEW.workflow_instance_id
    ),
    completed_tasks = (
      SELECT COUNT(*) 
      FROM task_instances 
      WHERE workflow_instance_id = NEW.workflow_instance_id 
      AND status = 'completed'
    ),
    updated_at = NOW()
  WHERE id = NEW.workflow_instance_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update completion counts
CREATE TRIGGER trigger_update_workflow_completion
  AFTER INSERT OR UPDATE OR DELETE ON task_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_completion_counts();
