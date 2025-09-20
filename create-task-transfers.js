// Create task_transfers table in production database
const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const supabaseUrl = 'https://xedpssqxgmnwufatyoje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTaskTransfersTable() {
  try {
    console.log('Creating task_transfers table...');
    
    // Create the task_transfers table using raw SQL
    const createTableSQL = `
      -- Task Transfer System Database Addition
      CREATE TABLE IF NOT EXISTS task_transfers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
        from_user_id UUID REFERENCES profiles(id) NOT NULL,
        to_user_id UUID REFERENCES profiles(id) NOT NULL,
        requested_by UUID REFERENCES profiles(id) NOT NULL,
        status TEXT CHECK (status IN ('pending_transferee', 'pending_manager', 'approved', 'rejected')) DEFAULT 'pending_transferee',
        transfer_reason TEXT,
        transferee_response TEXT,
        manager_response TEXT,
        
        -- Timestamps for tracking approval workflow
        requested_at TIMESTAMP DEFAULT NOW(),
        transferee_responded_at TIMESTAMP,
        manager_responded_at TIMESTAMP,
        
        -- Constraint: from_user and to_user must be different
        CHECK (from_user_id != to_user_id)
      );
    `;
    
    // Since we can't use exec_sql, let's use a different approach
    // Try using the REST API directly with a POST request
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/eval`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        sql: createTableSQL
      })
    });
    
    if (response.ok) {
      console.log('✅ Table creation request sent successfully');
    } else {
      console.log('❌ Table creation failed:', response.status, await response.text());
      
      // Alternative: Try creating via Supabase client with individual queries
      console.log('Trying alternative approach...');
      
      // Check if assignments table exists first
      const { data: assignmentsTest, error: assignmentsError } = await supabase
        .from('assignments')
        .select('count', { count: 'exact', head: true });
      
      if (assignmentsError) {
        console.log('❌ assignments table missing:', assignmentsError.message);
        console.log('The task_transfers table requires assignments table to exist first');
      } else {
        console.log('✅ assignments table exists');
        console.log('Note: task_transfers table creation requires SQL DDL commands');
        console.log('This table may need to be created through Supabase dashboard SQL editor');
      }
    }
    
  } catch (error) {
    console.error('Error creating task_transfers table:', error);
  }
}

createTaskTransfersTable().catch(console.error);