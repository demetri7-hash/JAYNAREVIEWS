-- Add Wall Posts System for Employee Communication Feed
-- Migration: Add wall_posts and related tables

-- =====================================
-- WALL POSTS SYSTEM
-- =====================================

-- Main wall posts table
CREATE TABLE IF NOT EXISTS wall_posts (
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

-- Wall post acknowledgments (for mandatory posts)
CREATE TABLE IF NOT EXISTS wall_post_acknowledgments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES wall_posts(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    signature TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, employee_id)
);

-- Wall post reactions (likes, etc.)
CREATE TABLE IF NOT EXISTS wall_post_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES wall_posts(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'helpful', 'celebrate')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, employee_id, reaction_type)
);

-- =====================================
-- INDEXES FOR PERFORMANCE
-- =====================================
CREATE INDEX IF NOT EXISTS idx_wall_posts_author_id ON wall_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_wall_posts_created_at ON wall_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wall_posts_post_type ON wall_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_wall_posts_pinned ON wall_posts(pinned, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wall_post_acknowledgments_post_id ON wall_post_acknowledgments(post_id);
CREATE INDEX IF NOT EXISTS idx_wall_post_acknowledgments_employee_id ON wall_post_acknowledgments(employee_id);
CREATE INDEX IF NOT EXISTS idx_wall_post_reactions_post_id ON wall_post_reactions(post_id);

-- =====================================
-- ROW LEVEL SECURITY
-- =====================================
ALTER TABLE wall_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wall_post_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wall_post_reactions ENABLE ROW LEVEL SECURITY;

-- Policies for wall posts
CREATE POLICY "Users can view posts based on visibility" ON wall_posts FOR SELECT USING (
    visibility = 'all' OR 
    (visibility = 'department' AND visibility_rules->>'department' = (
        SELECT COALESCE((users.employee_data->>'department'), 'general') 
        FROM users WHERE users.id = auth.uid()
    )) OR
    (visibility = 'role' AND visibility_rules->>'role' = (
        SELECT COALESCE(users.role::text, 'employee') 
        FROM users WHERE users.id = auth.uid()
    ))
);

CREATE POLICY "Users can create posts" ON wall_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own posts" ON wall_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Managers can update any post" ON wall_posts FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('manager', 'admin')
    )
);

-- Policies for acknowledgments
CREATE POLICY "Users can view acknowledgments for visible posts" ON wall_post_acknowledgments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM wall_posts 
        WHERE wall_posts.id = post_id 
        AND (
            wall_posts.visibility = 'all' OR 
            wall_posts.author_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM users 
                WHERE users.id = auth.uid() 
                AND users.role IN ('manager', 'admin')
            )
        )
    )
);

CREATE POLICY "Users can acknowledge posts" ON wall_post_acknowledgments FOR INSERT WITH CHECK (auth.uid() = employee_id);
CREATE POLICY "Users can update their acknowledgments" ON wall_post_acknowledgments FOR UPDATE USING (auth.uid() = employee_id);

-- Policies for reactions
CREATE POLICY "Users can view reactions on visible posts" ON wall_post_reactions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM wall_posts 
        WHERE wall_posts.id = post_id 
        AND wall_posts.visibility = 'all'
    )
);

CREATE POLICY "Users can add reactions" ON wall_post_reactions FOR INSERT WITH CHECK (auth.uid() = employee_id);
CREATE POLICY "Users can update their reactions" ON wall_post_reactions FOR UPDATE USING (auth.uid() = employee_id);
CREATE POLICY "Users can delete their reactions" ON wall_post_reactions FOR DELETE USING (auth.uid() = employee_id);

-- =====================================
-- TRIGGERS
-- =====================================
CREATE OR REPLACE FUNCTION update_wall_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wall_posts_updated_at 
    BEFORE UPDATE ON wall_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_wall_posts_updated_at();

-- =====================================
-- SAMPLE DATA
-- =====================================

-- Create a welcome post from admin
INSERT INTO wall_posts (
    author_id, 
    content, 
    post_type, 
    visibility,
    pinned
) VALUES (
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
    'Welcome to The Pass! 🎉 This is your team communication hub. Here you can:

• Share updates and achievements
• Receive important announcements from management
• Acknowledge mandatory training or policy updates
• Stay connected with your team

Let''s make every shift count! 💪',
    'announcement',
    'all',
    true
);

-- Create a manager announcement requiring acknowledgment
INSERT INTO wall_posts (
    author_id, 
    content, 
    post_type, 
    visibility,
    requires_acknowledgment,
    acknowledgment_signature_required
) VALUES (
    (SELECT id FROM users WHERE role IN ('manager', 'admin') LIMIT 1),
    '📋 NEW SAFETY PROTOCOL UPDATE

Effective immediately, all team members must:
1. Wear gloves when handling raw ingredients
2. Change gloves between different food items  
3. Wash hands thoroughly before and after each order

This policy is mandatory for food safety compliance. Please acknowledge that you have read and understand these requirements.',
    'announcement',
    'all',
    true,
    true
);

SELECT 'Wall posts system created successfully!' as status;