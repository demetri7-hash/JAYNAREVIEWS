-- Complete Fresh Database Setup for The Pass
-- Run this after resetting your database

-- =====================================
-- EXTENSIONS
-- =====================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTEN-- =====================================
-- AUDIT LOGGING
-- =====================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- WALL POSTS SYSTEM
-- =====================================
CREATE TABLE wall_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    post_type VARCHAR(20) DEFAULT 'public' CHECK (post_type IN ('public', 'manager', 'announcement', 'urgent')),
    visibility VARCHAR(20) DEFAULT 'all' CHECK (visibility IN ('all', 'department', 'role', 'specific')),
    visibility_rules JSONB DEFAULT '{}',
    photos TEXT[],
    requires_acknowledgment BOOLEAN DEFAULT false,
    acknowledgment_signature_required BOOLEAN DEFAULT false,
    pinned BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE wall_post_acknowledgments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES wall_posts(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    signature TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, employee_id)
);

CREATE TABLE wall_post_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES wall_posts(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'helpful', 'celebrate')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, employee_id, reaction_type)
);STS "pgcrypto";

-- =====================================
-- ENUMS
-- =====================================
CREATE TYPE user_role AS ENUM ('employee', 'shift_lead', 'manager', 'admin');
CREATE TYPE shift_type AS ENUM ('morning', 'afternoon', 'evening', 'overnight');
CREATE TYPE notification_type AS ENUM ('task', 'review', 'shift', 'system', 'urgent');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE workflow_category AS ENUM ('boh_opening', 'boh_closing', 'foh_opening', 'foh_closing', 'daily_prep', 'cleaning', 'inventory');

-- =====================================
-- USERS TABLE (MAIN)
-- =====================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    encrypted_password VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role user_role DEFAULT 'employee',
    employee_id VARCHAR(50) UNIQUE,
    hire_date DATE,
    preferred_language VARCHAR(5) DEFAULT 'en',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- NOTIFICATIONS SYSTEM
-- =====================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'system',
    priority notification_priority DEFAULT 'medium',
    data JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_system_wide BOOLEAN DEFAULT false
);

CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    is_acknowledged BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(notification_id, user_id)
);

-- =====================================
-- WORKFLOW SYSTEM
-- =====================================
CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category workflow_category NOT NULL,
    description TEXT,
    estimated_duration_minutes INTEGER,
    required_role user_role DEFAULT 'employee',
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE workflow_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    estimated_minutes INTEGER DEFAULT 5,
    requires_photo BOOLEAN DEFAULT false,
    requires_notes BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE workflow_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES workflow_templates(id),
    assigned_to UUID REFERENCES users(id),
    started_by UUID REFERENCES users(id),
    shift_date DATE NOT NULL,
    shift_type shift_type NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE task_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
    task_id UUID REFERENCES workflow_tasks(id),
    completed_by UUID REFERENCES users(id),
    is_completed BOOLEAN DEFAULT false,
    completion_notes TEXT,
    photo_urls TEXT[],
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- REVIEW SYSTEM
-- =====================================
CREATE TABLE review_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE review_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES review_templates(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    max_rating INTEGER DEFAULT 5,
    weight DECIMAL(3,2) DEFAULT 1.0,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE review_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES review_templates(id),
    employee_id UUID REFERENCES users(id),
    reviewer_id UUID REFERENCES users(id),
    date DATE NOT NULL,
    shift_type shift_type NOT NULL,
    overall_rating DECIMAL(3,2),
    is_completed BOOLEAN DEFAULT false,
    locked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE review_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_instance_id UUID REFERENCES review_instances(id) ON DELETE CASCADE,
    category_id UUID REFERENCES review_categories(id),
    rating INTEGER NOT NULL,
    notes TEXT,
    photos TEXT[],
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- TASK TRANSFER SYSTEM
-- =====================================
CREATE TABLE task_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id),
    shift_date DATE NOT NULL,
    from_shift shift_type NOT NULL,
    to_shift shift_type NOT NULL,
    task_title VARCHAR(255) NOT NULL,
    task_description TEXT,
    priority notification_priority DEFAULT 'medium',
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- ANALYTICS SYSTEM
-- =====================================
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255) NOT NULL,
    data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(50) NOT NULL,
    value NUMERIC NOT NULL,
    unit VARCHAR(20) NOT NULL,
    context JSONB DEFAULT '{}',
    user_id UUID REFERENCES users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE shift_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_date DATE NOT NULL,
    shift_type shift_type NOT NULL,
    total_employees INTEGER,
    workflows_completed INTEGER,
    workflows_on_time INTEGER,
    average_completion_time INTEGER,
    total_reviews INTEGER,
    average_rating DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE employee_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    date DATE NOT NULL,
    shift_type shift_type NOT NULL,
    workflows_completed INTEGER DEFAULT 0,
    average_task_time INTEGER DEFAULT 0,
    review_rating DECIMAL(3,2),
    punctuality_score INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- AUDIT LOGGING
-- =====================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- INDEXES
-- =====================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_notifications_type_priority ON notifications(type, priority);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_user_notifications_user_read ON user_notifications(user_id, is_read);

CREATE INDEX idx_workflow_instances_date_shift ON workflow_instances(shift_date, shift_type);
CREATE INDEX idx_workflow_instances_assigned_to ON workflow_instances(assigned_to);
CREATE INDEX idx_task_completions_workflow_id ON task_completions(workflow_instance_id);

CREATE INDEX idx_review_instances_employee_date ON review_instances(employee_id, date);
CREATE INDEX idx_review_responses_instance_id ON review_responses(review_instance_id);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);

CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);

CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

CREATE INDEX idx_wall_posts_author_id ON wall_posts(author_id);
CREATE INDEX idx_wall_posts_created_at ON wall_posts(created_at DESC);
CREATE INDEX idx_wall_posts_post_type ON wall_posts(post_type);
CREATE INDEX idx_wall_posts_pinned ON wall_posts(pinned, created_at DESC);
CREATE INDEX idx_wall_post_acknowledgments_post_id ON wall_post_acknowledgments(post_id);
CREATE INDEX idx_wall_post_acknowledgments_employee_id ON wall_post_acknowledgments(employee_id);
CREATE INDEX idx_wall_post_reactions_post_id ON wall_post_reactions(post_id);

-- =====================================
-- ROW LEVEL SECURITY
-- =====================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wall_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wall_post_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wall_post_reactions ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Users can see their own data" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can see their notifications" ON user_notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their analytics" ON analytics_events FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can access their metrics" ON performance_metrics FOR ALL USING (auth.uid()::text = user_id::text);

-- Wall posts policies
CREATE POLICY "Users can view public posts" ON wall_posts FOR SELECT USING (visibility = 'all');
CREATE POLICY "Users can create posts" ON wall_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own posts" ON wall_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can acknowledge posts" ON wall_post_acknowledgments FOR INSERT WITH CHECK (auth.uid() = employee_id);
CREATE POLICY "Users can view acknowledgments" ON wall_post_acknowledgments FOR SELECT USING (true);
CREATE POLICY "Users can add reactions" ON wall_post_reactions FOR ALL USING (auth.uid() = employee_id);

-- =====================================
-- TRIGGERS
-- =====================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_review_templates_updated_at BEFORE UPDATE ON review_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_review_instances_updated_at BEFORE UPDATE ON review_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- INITIAL DATA
-- =====================================
INSERT INTO workflow_templates (name, category, description, estimated_duration_minutes, required_role) VALUES
('BOH Opening Checklist', 'boh_opening', 'Back of house morning opening procedures', 45, 'employee'),
('BOH Closing Checklist', 'boh_closing', 'Back of house evening closing procedures', 60, 'employee'),
('FOH Opening Checklist', 'foh_opening', 'Front of house opening procedures', 30, 'employee'),
('FOH Closing Checklist', 'foh_closing', 'Front of house closing procedures', 45, 'employee'),
('Daily Prep Checklist', 'daily_prep', 'Daily food preparation tasks', 90, 'employee'),
('Deep Cleaning Checklist', 'cleaning', 'Weekly deep cleaning procedures', 120, 'shift_lead');

INSERT INTO review_templates (name, description) VALUES
('Standard Employee Review', 'Comprehensive employee performance evaluation');

-- Get review template ID and add categories
DO $$
DECLARE
    template_id UUID;
BEGIN
    SELECT id INTO template_id FROM review_templates WHERE name = 'Standard Employee Review';
    
    INSERT INTO review_categories (template_id, name, description, max_rating, order_index) VALUES
    (template_id, 'Food Quality', 'Preparation, presentation, and taste of food items', 5, 1),
    (template_id, 'Customer Service', 'Interaction with customers, friendliness, helpfulness', 5, 2),
    (template_id, 'Cleanliness', 'Personal hygiene and workspace cleanliness', 5, 3),
    (template_id, 'Punctuality', 'Arrival time and adherence to schedule', 5, 4),
    (template_id, 'Teamwork', 'Collaboration and communication with team members', 5, 5),
    (template_id, 'Initiative', 'Proactiveness and problem-solving abilities', 5, 6);
END $$;

-- Create admin user
INSERT INTO users (email, first_name, last_name, role, employee_id, hire_date, is_active) VALUES
('demetri7@gmail.com', 'System', 'Administrator', 'admin', 'ADMIN001', CURRENT_DATE, true);

-- Success notification
INSERT INTO notifications (title, message, type, priority, is_system_wide) 
VALUES (
    'Database Setup Complete', 
    'Your production database has been successfully created with all enterprise features enabled!',
    'system',
    'high',
    true
);

-- Sample wall posts
INSERT INTO wall_posts (author_id, content, post_type, visibility, pinned) VALUES
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 
 'Welcome to The Pass! 🎉 This is your team communication hub where you can share updates, receive announcements, and stay connected with your team. Let''s make every shift count! 💪',
 'announcement', 'all', true);

INSERT INTO wall_posts (author_id, content, post_type, requires_acknowledgment, acknowledgment_signature_required) VALUES
((SELECT id FROM users WHERE role = 'admin' LIMIT 1),
 '📋 NEW SAFETY PROTOCOL UPDATE

Effective immediately, all team members must:
1. Wear gloves when handling raw ingredients  
2. Change gloves between different food items
3. Wash hands thoroughly before and after each order

This policy is mandatory for food safety compliance. Please acknowledge that you have read and understand these requirements.',
 'announcement', true, true);

SELECT 'COMPLETE DATABASE SETUP SUCCESSFUL!' as status;