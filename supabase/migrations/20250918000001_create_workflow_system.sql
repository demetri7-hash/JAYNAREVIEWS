-- Migration: Create Workflow System
-- Description: Add workflows, workflow_tasks junction table, and enhance tasks table
-- Date: September 18, 2025

-- Create workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_repeatable BOOLEAN DEFAULT false,
    recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('once', 'daily', 'weekly', 'monthly')),
    due_date DATE,
    due_time TIME,
    departments TEXT[] DEFAULT '{}',
    roles TEXT[] DEFAULT '{}', 
    assigned_users UUID[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_tasks junction table
CREATE TABLE IF NOT EXISTS workflow_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workflow_id, task_id),
    UNIQUE(workflow_id, order_index)
);

-- Enhance tasks table with new fields
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_photo_mandatory BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_notes_mandatory BOOLEAN DEFAULT false;

-- Create workflow_assignments table to track assigned workflows
CREATE TABLE IF NOT EXISTS workflow_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workflow_id, assigned_to, due_date)
);

-- Create workflow_task_completions table to track individual task completions within workflows
CREATE TABLE IF NOT EXISTS workflow_task_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_assignment_id UUID REFERENCES workflow_assignments(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes TEXT,
    photo_url TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workflow_assignment_id, task_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_workflows_active ON workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_workflows_departments ON workflows USING GIN(departments);
CREATE INDEX IF NOT EXISTS idx_workflows_roles ON workflows USING GIN(roles);
CREATE INDEX IF NOT EXISTS idx_workflows_assigned_users ON workflows USING GIN(assigned_users);

CREATE INDEX IF NOT EXISTS idx_workflow_tasks_workflow_id ON workflow_tasks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_task_id ON workflow_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_order ON workflow_tasks(workflow_id, order_index);

CREATE INDEX IF NOT EXISTS idx_workflow_assignments_workflow_id ON workflow_assignments(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_assignments_assigned_to ON workflow_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_workflow_assignments_status ON workflow_assignments(status);
CREATE INDEX IF NOT EXISTS idx_workflow_assignments_due_date ON workflow_assignments(due_date);

CREATE INDEX IF NOT EXISTS idx_workflow_task_completions_assignment_id ON workflow_task_completions(workflow_assignment_id);
CREATE INDEX IF NOT EXISTS idx_workflow_task_completions_task_id ON workflow_task_completions(task_id);
CREATE INDEX IF NOT EXISTS idx_workflow_task_completions_completed_by ON workflow_task_completions(completed_by);

CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for workflows updated_at
CREATE TRIGGER update_workflows_updated_at 
    BEFORE UPDATE ON workflows 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on new tables
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_task_completions ENABLE ROW LEVEL SECURITY;

-- Workflows policies
CREATE POLICY "Managers can view all workflows" ON workflows
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('manager', 'kitchen_manager', 'ordering_manager', 'assistant_foh_manager')
        )
    );

CREATE POLICY "Managers can create workflows" ON workflows
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('manager', 'kitchen_manager', 'ordering_manager', 'assistant_foh_manager')
        )
    );

CREATE POLICY "Managers can update their workflows" ON workflows
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'manager'
        )
    );

CREATE POLICY "Users can view workflows assigned to them" ON workflows
    FOR SELECT USING (
        auth.uid() = ANY(assigned_users) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND (
                profiles.role = ANY(roles) OR
                'ALL' = ANY(roles)
            )
        )
    );

-- Workflow tasks policies
CREATE POLICY "Users can view workflow tasks" ON workflow_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workflows 
            WHERE workflows.id = workflow_tasks.workflow_id
        )
    );

CREATE POLICY "Managers can manage workflow tasks" ON workflow_tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('manager', 'kitchen_manager', 'ordering_manager', 'assistant_foh_manager')
        )
    );

-- Workflow assignments policies  
CREATE POLICY "Users can view their workflow assignments" ON workflow_assignments
    FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "Managers can view all workflow assignments" ON workflow_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('manager', 'kitchen_manager', 'ordering_manager', 'assistant_foh_manager')
        )
    );

CREATE POLICY "Managers can create workflow assignments" ON workflow_assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('manager', 'kitchen_manager', 'ordering_manager', 'assistant_foh_manager')
        )
    );

CREATE POLICY "Users can update their workflow assignments" ON workflow_assignments
    FOR UPDATE USING (assigned_to = auth.uid());

-- Workflow task completions policies
CREATE POLICY "Users can view their workflow task completions" ON workflow_task_completions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workflow_assignments wa
            WHERE wa.id = workflow_task_completions.workflow_assignment_id
            AND wa.assigned_to = auth.uid()
        )
    );

CREATE POLICY "Managers can view all workflow task completions" ON workflow_task_completions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('manager', 'kitchen_manager', 'ordering_manager', 'assistant_foh_manager')
        )
    );

CREATE POLICY "Users can create their workflow task completions" ON workflow_task_completions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workflow_assignments wa
            WHERE wa.id = workflow_task_completions.workflow_assignment_id
            AND wa.assigned_to = auth.uid()
        )
    );

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON workflows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workflow_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE ON workflow_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON workflow_task_completions TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add helpful comments
COMMENT ON TABLE workflows IS 'Workflows are collections of tasks that can be assigned to users/roles/departments';
COMMENT ON TABLE workflow_tasks IS 'Junction table linking workflows to tasks with ordering information';
COMMENT ON TABLE workflow_assignments IS 'Tracks when workflows are assigned to specific users';
COMMENT ON TABLE workflow_task_completions IS 'Tracks completion of individual tasks within workflow assignments';

COMMENT ON COLUMN workflows.departments IS 'Array of department names this workflow applies to';
COMMENT ON COLUMN workflows.roles IS 'Array of user roles this workflow applies to';  
COMMENT ON COLUMN workflows.assigned_users IS 'Array of specific user UUIDs this workflow is assigned to';
COMMENT ON COLUMN workflow_tasks.order_index IS 'Order of tasks in the workflow (0-based)';
COMMENT ON COLUMN tasks.tags IS 'Array of tags for filtering and organization';
COMMENT ON COLUMN tasks.is_photo_mandatory IS 'Whether photo is required for task completion';
COMMENT ON COLUMN tasks.is_notes_mandatory IS 'Whether notes are required for task completion';