// Create manager_updates table if it doesn't exist
const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually
const supabaseUrl = 'https://xedpssqxgmnwufatyoje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createManagerUpdatesTable() {
  try {
    console.log('Creating manager_updates table...');
    
    // Create the manager_updates table with all columns including multilingual ones
    const createTableSql = `
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
        is_active BOOLEAN NOT NULL DEFAULT TRUE
      );
    `;
    
    // Use a manual SQL query since exec_sql doesn't exist
    console.log('Creating table with raw query...');
    
    // Try using the sql editor approach
    const response = await fetch('https://xedpssqxgmnwufatyoje.supabase.co/rest/v1/rpc/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        sql: createTableSql
      })
    });
    
    if (!response.ok) {
      console.log('Direct SQL failed, trying table creation through insert...');
      
      // Create a test insert to trigger table creation (this won't work, but let's see the error)
      try {
        const { error } = await supabase
          .from('manager_updates')
          .select('id')
          .limit(1);
        
        if (error) {
          console.log('Table does not exist:', error.message);
          console.log('Table needs to be created manually in Supabase dashboard');
        }
      } catch (err) {
        console.log('Confirmation - table does not exist');
      }
    } else {
      console.log('Table creation successful!');
    }
    
    // Try to verify table exists now
    const { data, error } = await supabase
      .from('manager_updates')
      .select('count(*)')
      .single();
    
    if (error) {
      console.log('Table still does not exist. Need to create manually.');
      console.log('Error:', error.message);
    } else {
      console.log('Table verified - exists and accessible!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createManagerUpdatesTable();