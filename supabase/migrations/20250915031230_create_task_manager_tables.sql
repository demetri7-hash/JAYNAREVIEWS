-- Simple Task Manager Database Schema
-- 4 tables total - keeping it simple!

-- 1. Profiles (user info from Google OAuth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('manager', 'employee')) DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tasks (template tasks created by managers)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  requires_photo BOOLEAN DEFAULT FALSE,
  requires_notes BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Assignments (who needs to do what and when)
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id),
  assigned_by UUID REFERENCES profiles(id),
  due_date TIMESTAMP NOT NULL,
  recurrence TEXT CHECK (recurrence IN ('once', 'daily', 'weekly', 'monthly', 'yearly')) DEFAULT 'once',
  status TEXT CHECK (status IN ('pending', 'completed', 'transferred')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Completions (when someone finishes a task)
CREATE TABLE IF NOT EXISTS completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  completed_by UUID REFERENCES profiles(id),
  notes TEXT,
  photo_url TEXT,
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Simple and secure

-- Profiles: Users can see all profiles, but only update their own
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Tasks: Everyone can see tasks, only managers can create/edit
CREATE POLICY "Anyone can view tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Managers can create tasks" ON tasks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id::text = auth.uid()::text AND role = 'manager')
);
CREATE POLICY "Managers can update tasks" ON tasks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id::text = auth.uid()::text AND role = 'manager')
);

-- Assignments: Users can see their own assignments, managers can see all
CREATE POLICY "Users can view their assignments" ON assignments FOR SELECT USING (
  assigned_to::text = auth.uid()::text OR 
  EXISTS (SELECT 1 FROM profiles WHERE id::text = auth.uid()::text AND role = 'manager')
);
CREATE POLICY "Managers can create assignments" ON assignments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id::text = auth.uid()::text AND role = 'manager')
);
CREATE POLICY "Managers can update assignments" ON assignments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id::text = auth.uid()::text AND role = 'manager')
);

-- Completions: Users can see their own completions, managers can see all
CREATE POLICY "Users can view relevant completions" ON completions FOR SELECT USING (
  completed_by::text = auth.uid()::text OR 
  EXISTS (SELECT 1 FROM profiles WHERE id::text = auth.uid()::text AND role = 'manager')
);
CREATE POLICY "Users can create completions" ON completions FOR INSERT WITH CHECK (
  completed_by::text = auth.uid()::text
);

-- Useful indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_to ON assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_completions_completed_at ON completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);