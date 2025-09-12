# Workflow Management Database Schema
## Designed for: Task Management, Assignments, Drag-Drop, Manager Controls

```sql
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
```

## Key Features Supported:

### 🎯 **Manager Controls**
- Create/edit checklists and tasks
- Assign workflows to users
- Reassign individual tasks between users
- View completion progress and performance metrics
- Audit trail of all task changes

### 📋 **Drag & Drop Support**
- `sort_order` fields for reordering tasks
- Workflow templates for quick deployment
- Flexible task reassignment

### 👥 **User Assignment**
- Individual task assignment/reassignment
- Bulk workflow assignment
- Auto-assignment based on roles/templates

### 📊 **Tracking & Analytics**
- Completion percentages
- Time tracking (estimated vs actual)
- Performance views and summaries
- Audit logs for accountability

### 🔄 **Workflow States**
- Checklist templates → Workflow instances → Task instances
- Multiple status levels for granular control
- Critical task blocking for quality assurance
