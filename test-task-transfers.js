// Test if task_transfers table exists in production database
const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const supabaseUrl = 'https://xedpssqxgmnwufatyoje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTaskTransfersTable() {
  try {
    console.log('Testing task_transfers table...');
    const { data: transfersData, error: transfersError } = await supabase
      .from('task_transfers')
      .select('count', { count: 'exact', head: true });
    
    if (transfersError) {
      console.log('❌ task_transfers table error:', transfersError.message);
      console.log('Error details:', transfersError);
    } else {
      console.log('✅ task_transfers table exists, count:', transfersData);
    }
    
    // Also test the profiles table structure used in the join
    console.log('Testing profiles table structure...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .limit(1);
    
    if (profileError) {
      console.log('❌ profiles table error:', profileError.message);
      console.log('Error details:', profileError);
    } else {
      console.log('✅ profiles table structure OK, sample:', profileData);
    }
    
  } catch (error) {
    console.error('Error testing tables:', error);
  }
}

testTaskTransfersTable().catch(console.error);