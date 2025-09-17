// Test manager_updates table access
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xedpssqxgmnwufatyoje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTable() {
  try {
    console.log('Testing manager_updates table access...');
    
    // Try to select from the table
    const { data, error } = await supabase
      .from('manager_updates')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error accessing table:', error);
    } else {
      console.log('Success! Table exists and is accessible.');
      console.log('Data:', data);
      console.log('Number of records:', data?.length || 0);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testTable();