// Ensure all manager update tables exist in production database
const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const supabaseUrl = 'https://xedpssqxgmnwufatyoje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function ensureManagerTables() {
  try {
    console.log('Ensuring manager update tables exist...');
    
    // First, create manager_updates table if it doesn't exist
    console.log('Creating manager_updates table...');
    const { error: managerUpdatesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS manager_updates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          title_en TEXT,
          title_es TEXT,
          title_tr TEXT,
          message_en TEXT,
          message_es TEXT,
          message_tr TEXT,
          priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
          type TEXT NOT NULL CHECK (type IN ('announcement', 'alert', 'policy', 'emergency')),
          requires_acknowledgment BOOLEAN NOT NULL DEFAULT FALSE,
          created_by UUID NOT NULL REFERENCES profiles(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          photo_url TEXT
        );
      `
    });
    
    if (managerUpdatesError) {
      console.error('Error creating manager_updates table:', managerUpdatesError);
    } else {
      console.log('✅ manager_updates table created/verified');
    }
    
    // Create manager_update_reads table if it doesn't exist
    console.log('Creating manager_update_reads table...');
    const { error: readsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS manager_update_reads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          update_id UUID NOT NULL REFERENCES manager_updates(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(update_id, user_id)
        );
      `
    });
    
    if (readsError) {
      console.error('Error creating manager_update_reads table:', readsError);
    } else {
      console.log('✅ manager_update_reads table created/verified');
    }
    
    // Create indexes
    console.log('Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_manager_update_reads_update_id ON manager_update_reads(update_id);
        CREATE INDEX IF NOT EXISTS idx_manager_update_reads_user_id ON manager_update_reads(user_id);
        CREATE INDEX IF NOT EXISTS idx_manager_update_reads_composite ON manager_update_reads(update_id, user_id);
      `
    });
    
    if (indexError) {
      console.error('Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created/verified');
    }
    
    console.log('✅ All manager update tables ensured!');
    
  } catch (error) {
    console.error('Error ensuring tables:', error);
    throw error;
  }
}

ensureManagerTables().catch(console.error);