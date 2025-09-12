-- Workflow Management System Database Schema
-- Run this in your Supabase SQL editor

-- Create checklists table
CREATE TABLE IF NOT EXISTS checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  estimated_minutes INTEGER DEFAULT 15,
  allow_notes BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  checklist_id UUID REFERENCES checklists(id),
  assigned_to UUID REFERENCES employees(id),
  assigned_by UUID REFERENCES employees(id),
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')),
  due_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create task_completions table
CREATE TABLE IF NOT EXISTS task_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  completed_by UUID REFERENCES employees(id),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, task_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflows_assigned_to ON workflows(assigned_to);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_tasks_checklist_id ON tasks(checklist_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_workflow_id ON task_completions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_comments_workflow_id ON comments(workflow_id);

-- Insert some sample data
INSERT INTO checklists (name, description, category) VALUES
  ('Opening Checklist', 'Morning opening procedures', 'Opening'),
  ('Closing Checklist', 'Evening closing procedures', 'Closing'),
  ('Prep Checklist', 'Daily prep tasks', 'Prep')
ON CONFLICT DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (checklist_id, title, description, order_index, estimated_minutes, allow_notes)
SELECT 
  c.id,
  task_data.title,
  task_data.description,
  task_data.order_index,
  task_data.estimated_minutes,
  task_data.allow_notes
FROM checklists c,
(VALUES 
  ('Opening Checklist', 'Turn on equipment', 'Turn on all kitchen equipment', 1, 10, false),
  ('Opening Checklist', 'Check temperatures', 'Verify all equipment temperatures', 2, 15, true),
  ('Opening Checklist', 'Stock prep areas', 'Ensure all prep areas are stocked', 3, 20, false),
  ('Closing Checklist', 'Clean equipment', 'Clean all kitchen equipment', 1, 30, true),
  ('Closing Checklist', 'Count register', 'Count cash register', 2, 15, false),
  ('Closing Checklist', 'Lock doors', 'Secure all entrances', 3, 5, false)
) AS task_data(checklist_name, title, description, order_index, estimated_minutes, allow_notes)
WHERE c.name = task_data.checklist_name
ON CONFLICT DO NOTHING;

COMMENT ON TABLE checklists IS 'Template checklists for different types of workflows';
COMMENT ON TABLE tasks IS 'Individual tasks within a checklist';
COMMENT ON TABLE workflows IS 'Assigned instances of checklists to employees';
COMMENT ON TABLE task_completions IS 'Record of completed tasks within workflows';
COMMENT ON TABLE comments IS 'Comments on workflow tasks for communication';
COMMENT ON TABLE audit_logs IS 'Audit trail for user actions';
