// Test what tables exist in the production database
const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const supabaseUrl = 'https://xedpssqxgmnwufatyoje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTables() {
  try {
    console.log('Testing manager_updates table...');
    const { data: updatesData, error: updatesError } = await supabase
      .from('manager_updates')
      .select('count', { count: 'exact', head: true });
    
    if (updatesError) {
      console.log('❌ manager_updates table error:', updatesError.message);
    } else {
      console.log('✅ manager_updates table exists, count:', updatesData);
    }
    
    console.log('Testing manager_update_reads table...');
    const { data: readsData, error: readsError } = await supabase
      .from('manager_update_reads')
      .select('count', { count: 'exact', head: true });
    
    if (readsError) {
      console.log('❌ manager_update_reads table error:', readsError.message);
    } else {
      console.log('✅ manager_update_reads table exists, count:', readsData);
    }
    
  } catch (error) {
    console.error('Error testing tables:', error);
  }
}

testTables().catch(console.error);