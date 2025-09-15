const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xedpssqxgmnwufatyoje.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🗄️ Setting up simple task manager database...')
  
  try {
    // Create profiles table
    console.log('📝 Creating profiles table...')
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          role TEXT CHECK (role IN ('manager', 'employee')) DEFAULT 'employee',
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    })
    
    if (profilesError && !profilesError.message.includes('already exists')) {
      throw profilesError
    }
    console.log('✅ Profiles table ready')

    // Create tasks table
    console.log('📝 Creating tasks table...')
    const { error: tasksError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tasks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          requires_photo BOOLEAN DEFAULT FALSE,
          requires_notes BOOLEAN DEFAULT FALSE,
          created_by UUID REFERENCES profiles(id),
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    })
    
    if (tasksError && !tasksError.message.includes('already exists')) {
      throw tasksError
    }
    console.log('✅ Tasks table ready')

    // Create assignments table
    console.log('📝 Creating assignments table...')
    const { error: assignmentsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })
    
    if (assignmentsError && !assignmentsError.message.includes('already exists')) {
      throw assignmentsError
    }
    console.log('✅ Assignments table ready')

    // Create completions table
    console.log('📝 Creating completions table...')
    const { error: completionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS completions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
          completed_by UUID REFERENCES profiles(id),
          notes TEXT,
          photo_url TEXT,
          completed_at TIMESTAMP DEFAULT NOW()
        );
      `
    })
    
    if (completionsError && !completionsError.message.includes('already exists')) {
      throw completionsError
    }
    console.log('✅ Completions table ready')

    console.log('🎉 Database setup complete!')
    console.log('📊 Tables created:')
    console.log('  • profiles (user accounts)')
    console.log('  • tasks (task templates)')
    console.log('  • assignments (who does what)')
    console.log('  • completions (task results)')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

setupDatabase()