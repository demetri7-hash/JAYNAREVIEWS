-- Add close_reviews table to database_schema.sql
-- This table stores reviews of previous shifts' work

-- Create close_reviews table
CREATE TABLE IF NOT EXISTS close_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID REFERENCES employees(id),
    reviewer_name TEXT NOT NULL,
    department TEXT CHECK (department IN ('FOH', 'BOH')) NOT NULL,
    shift_reviewed TEXT NOT NULL, -- 'PM Closing', 'Opening Line', 'Morning Prep', etc.
    review_date DATE NOT NULL,
    review_data JSONB NOT NULL, -- Structured review responses
    overall_score INTEGER CHECK (overall_score >= 1 AND overall_score <= 5),
    pass_fail_status TEXT CHECK (pass_fail_status IN ('Pass', 'Fail', 'Needs Follow-up')),
    issues_flagged TEXT[] DEFAULT ARRAY[]::TEXT[],
    manager_notified BOOLEAN DEFAULT false,
    photo_evidence TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create checklist_items table for manager editing
CREATE TABLE IF NOT EXISTS checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name TEXT NOT NULL, -- 'FOH_AM_Opening', 'BOH_Opening_Line', etc.
    department TEXT CHECK (department IN ('FOH', 'BOH')) NOT NULL,
    item_order INTEGER NOT NULL,
    task_description TEXT NOT NULL,
    task_description_es TEXT,
    task_description_tr TEXT,
    category TEXT NOT NULL,
    is_required BOOLEAN DEFAULT true,
    requires_photo BOOLEAN DEFAULT false,
    requires_note BOOLEAN DEFAULT false,
    time_estimate_minutes INTEGER,
    food_safety_critical BOOLEAN DEFAULT false,
    manager_editable BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create review_templates table for manager editing
CREATE TABLE IF NOT EXISTS review_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name TEXT NOT NULL, -- 'FOH_PM_Close_Review', 'BOH_Line_Close_Review', etc.
    department TEXT CHECK (department IN ('FOH', 'BOH')) NOT NULL,
    review_categories JSONB NOT NULL, -- Categories with scoring criteria
    scoring_system TEXT DEFAULT '1-5 Scale',
    pass_threshold INTEGER DEFAULT 85, -- Percentage for passing
    requires_manager_photo BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE close_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all operations for authenticated users" ON close_reviews FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON checklist_items FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON review_templates FOR ALL USING (true);
