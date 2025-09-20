// Test the pending-transfers API query to see what's failing
const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const supabaseUrl = 'https://xedpssqxgmnwufatyoje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPendingTransfersQuery() {
  try {
    console.log('Testing task_transfers basic query...');
    
    // Basic query first
    const { data: basicData, error: basicError } = await supabase
      .from('task_transfers')
      .select('*')
      .limit(5);
    
    if (basicError) {
      console.log('❌ Basic query error:', basicError);
    } else {
      console.log('✅ Basic query success:', basicData?.length, 'transfers');
      console.log('Sample data:', basicData?.[0]);
    }
    
    // Test the complex query from the API
    console.log('Testing complex API query...');
    const { data: complexData, error: complexError } = await supabase
      .from('task_transfers')
      .select(`
        id,
        assignment_id,
        from_user_id,
        to_user_id,
        status,
        transfer_reason,
        requested_at,
        transferee_responded_at,
        manager_responded_at,
        from_user:from_user_id (
          id,
          name,
          email
        ),
        to_user:to_user_id (
          id,
          name,
          email
        )
      `)
      .limit(5);
    
    if (complexError) {
      console.log('❌ Complex query error:', complexError);
      console.log('Error details:', JSON.stringify(complexError, null, 2));
    } else {
      console.log('✅ Complex query success:', complexData?.length, 'transfers');
    }
    
  } catch (error) {
    console.error('Error testing transfers:', error);
  }
}

testPendingTransfersQuery().catch(console.error);