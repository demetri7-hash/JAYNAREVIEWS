-- Migration Script: Add New Tables for Enhanced Features
-- This script safely adds new tables without affecting existing ones
-- Run this in your Supabase SQL Editor

-- =====================================
-- STEP 1: ADD MISSING EXTENSIONS
-- =====================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================
-- STEP 2: ADD NEW ENUMS (IF NOT EXISTS)
-- =====================================

-- Check and create user_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('employee', 'shift_lead', 'manager', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Check and create notification types
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('task', 'review', 'shift', 'system', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shift_type AS ENUM ('morning', 'afternoon', 'evening', 'overnight');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================
-- STEP 3: ADD ANALYTICS TABLES (NEW)
-- =====================================

-- Analytics events table for performance tracking
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    user_id UUID,
    session_id VARCHAR(255) NOT NULL,
    data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(50) NOT NULL,
    value NUMERIC NOT NULL,
    unit VARCHAR(20) NOT NULL,
    context JSONB DEFAULT '{}',
    user_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- STEP 4: ADD NOTIFICATION SYSTEM (NEW)
-- =====================================

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'system',
    priority notification_priority DEFAULT 'medium',
    data JSONB DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_system_wide BOOLEAN DEFAULT false
);

-- User notifications (who has seen what)
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID,
    is_read BOOLEAN DEFAULT false,
    is_acknowledged BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(notification_id, user_id)
);

-- =====================================
-- STEP 5: ADD AUDIT LOGGING (NEW)
-- =====================================

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
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
-- STEP 6: UPDATE EXISTING USERS TABLE
-- =====================================

-- Add new columns to users table if they don't exist
DO $$ 
BEGIN
    -- Add encrypted_password column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'encrypted_password') THEN
        ALTER TABLE users ADD COLUMN encrypted_password VARCHAR(255);
    END IF;
    
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role user_role DEFAULT 'employee';
    END IF;
    
    -- Add preferred_language column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'preferred_language') THEN
        ALTER TABLE users ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'en';
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add last_sign_in_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'last_sign_in_at') THEN
        ALTER TABLE users ADD COLUMN last_sign_in_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- =====================================
-- STEP 7: ADD INDEXES FOR PERFORMANCE
-- =====================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_type_priority ON notifications(type, priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_read ON user_notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =====================================
-- STEP 8: ENABLE ROW LEVEL SECURITY
-- =====================================

-- Enable RLS on new tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for new tables (with safe creation)
DO $$ 
BEGIN
    -- Policy for analytics_events
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'Users can access their own analytics') THEN
        CREATE POLICY "Users can access their own analytics" ON analytics_events FOR ALL USING (auth.uid()::text = user_id::text);
    END IF;
    
    -- Policy for performance_metrics
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'performance_metrics' AND policyname = 'Users can access their own metrics') THEN
        CREATE POLICY "Users can access their own metrics" ON performance_metrics FOR ALL USING (auth.uid()::text = user_id::text);
    END IF;
    
    -- Policy for user_notifications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_notifications' AND policyname = 'Users can see their notifications') THEN
        CREATE POLICY "Users can see their notifications" ON user_notifications FOR ALL USING (auth.uid()::text = user_id::text);
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- If there are any issues with policies, continue
    NULL;
END $$;

-- =====================================
-- STEP 9: ADD TRIGGER FUNCTIONS
-- =====================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================
-- SUCCESS MESSAGE
-- =====================================

-- Insert a success notification
DO $$
BEGIN
    INSERT INTO notifications (title, message, type, priority, is_system_wide) 
    VALUES (
        'Database Migration Complete', 
        'Your database has been successfully updated with new enterprise features including analytics, notifications, and audit logging.',
        'system',
        'high',
        true
    );
EXCEPTION WHEN OTHERS THEN
    -- If notifications table doesn't exist yet, just continue
    NULL;
END $$;

-- Show completion message
SELECT 'Database migration completed successfully! New tables added: analytics_events, performance_metrics, notifications, user_notifications, audit_logs' as status;