-- REVIEW SYSTEM SCHEMA
-- Comprehensive review validation with audit trails and notification integration

-- Review Templates table - defines the structure of each review type
CREATE TABLE IF NOT EXISTS review_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  department VARCHAR(50) NOT NULL, -- FOH, BOH
  shift_type VARCHAR(50) NOT NULL, -- opening, closing, transition, prep
  trigger_condition VARCHAR(100), -- 'embedded_in_workflow', 'manual_only', 'clock_in_required'
  password_required BOOLEAN DEFAULT false,
  time_limit_hours INTEGER DEFAULT 6, -- hours to allow updates after completion
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review Categories - the actual review sections (e.g., "Walk-in Refrigerator")
CREATE TABLE IF NOT EXISTS review_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES review_templates(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  max_rating INTEGER DEFAULT 5,
  order_index INTEGER DEFAULT 0,
  required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review Instances - actual review submissions
CREATE TABLE IF NOT EXISTS review_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES review_templates(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift_type VARCHAR(50) NOT NULL,
  completion_method VARCHAR(50) NOT NULL, -- 'embedded', 'manual'
  total_score INTEGER DEFAULT 0,
  max_possible_score INTEGER DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'requires_manager_review'
  requires_manager_followup BOOLEAN DEFAULT false,
  manager_reviewed_by UUID REFERENCES employees(id),
  manager_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  locked_at TIMESTAMP WITH TIME ZONE, -- when 6-hour update window expires
  UNIQUE(template_id, employee_id, date, shift_type)
);

-- Review Responses - individual category ratings and notes
CREATE TABLE IF NOT EXISTS review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_instance_id UUID REFERENCES review_instances(id) ON DELETE CASCADE,
  category_id UUID REFERENCES review_categories(id) ON DELETE CASCADE,
  rating INTEGER,
  notes TEXT,
  photos TEXT[], -- array of photo URLs
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_by UUID REFERENCES employees(id) ON DELETE CASCADE,
  workflow_task_id UUID, -- link to workflow task if completed via embedded flow
  UNIQUE(review_instance_id, category_id)
);

-- Review Updates - audit trail for post-completion updates
CREATE TABLE IF NOT EXISTS review_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_response_id UUID REFERENCES review_responses(id) ON DELETE CASCADE,
  updated_by UUID REFERENCES employees(id) ON DELETE CASCADE,
  update_type VARCHAR(50) NOT NULL, -- 'note_added', 'photo_added', 'rating_changed'
  previous_value JSONB,
  new_value JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  manager_override BOOLEAN DEFAULT false -- if manager overrode time limit
);

-- Workflow Review Mappings - links workflow tasks to review categories
CREATE TABLE IF NOT EXISTS workflow_review_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID, -- from existing workflows table
  task_id VARCHAR(255), -- task identifier within workflow
  review_template_id UUID REFERENCES review_templates(id) ON DELETE CASCADE,
  review_category_id UUID REFERENCES review_categories(id) ON DELETE CASCADE,
  auto_complete_review BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table enhancement for review system
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL, -- 'review_update', 'manager_announcement', 'wall_post', 'task_transfer'
  recipient_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(255),
  metadata JSONB, -- additional data like review_instance_id, etc.
  read_at TIMESTAMP WITH TIME ZONE,
  requires_acknowledgment BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledgment_signature TEXT, -- full name signature if required
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wall Posts for public feed and manager updates
CREATE TABLE IF NOT EXISTS wall_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type VARCHAR(50) NOT NULL, -- 'public', 'manager_update', 'achievement', 'announcement'
  visibility VARCHAR(50) DEFAULT 'all', -- 'all', 'department', 'role', 'specific_users'
  visibility_rules JSONB, -- stores department, role, or user IDs for specific visibility
  requires_acknowledgment BOOLEAN DEFAULT false,
  acknowledgment_signature_required BOOLEAN DEFAULT false,
  photos TEXT[],
  reactions JSONB DEFAULT '{}', -- stores emoji reactions
  priority VARCHAR(20) DEFAULT 'normal',
  pinned BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wall Post Acknowledgments
CREATE TABLE IF NOT EXISTS wall_post_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES wall_posts(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  signature TEXT, -- full name if signature required
  UNIQUE(post_id, employee_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_instances_employee_date ON review_instances(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_review_instances_template_date ON review_instances(template_id, date);
CREATE INDEX IF NOT EXISTS idx_review_responses_instance ON review_responses(review_instance_id);
CREATE INDEX IF NOT EXISTS idx_review_updates_response ON review_updates(review_response_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read ON notifications(recipient_id, read_at);
CREATE INDEX IF NOT EXISTS idx_wall_posts_type_created ON wall_posts(post_type, created_at);
CREATE INDEX IF NOT EXISTS idx_wall_post_acks_post_employee ON wall_post_acknowledgments(post_id, employee_id);

-- RLS Policies
ALTER TABLE review_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_review_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wall_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wall_post_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Example policies (basic access control)
CREATE POLICY "Users can view their own reviews" ON review_instances
  FOR SELECT USING (employee_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'manager'));

CREATE POLICY "Users can update their own reviews within time limit" ON review_responses
  FOR UPDATE USING (completed_by = auth.uid() AND 
    EXISTS (SELECT 1 FROM review_instances ri WHERE ri.id = review_instance_id 
      AND (ri.locked_at IS NULL OR ri.locked_at > NOW())));

CREATE POLICY "Managers can override time limits" ON review_updates
  FOR INSERT WITH CHECK (
    updated_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'manager')
  );