const { createClient } = require('@supabase/supabase-js');

const supabaseService = createClient(
  'https://xedpssqxgmnwufatyoje.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testConnection() {
  try {
    console.log('Testing database connection with service role...');
    
    // Test employees table
    const employeesResult = await supabaseService.from('employees').select('*').limit(1);
    console.log('Employees table:', employeesResult.error ? 'ERROR: ' + employeesResult.error.message : 'SUCCESS - ' + employeesResult.data.length + ' records');
    
    if (!employeesResult.error && employeesResult.data.length > 0) {
      console.log('Sample employee:', employeesResult.data[0].name, '-', employeesResult.data[0].department);
    }
    
    // Test checklist_items table
    const checklistResult = await supabaseService.from('checklist_items').select('*').limit(1);
    console.log('Checklist items table:', checklistResult.error ? 'ERROR: ' + checklistResult.error.message : 'SUCCESS - ' + checklistResult.data.length + ' records');
    
    // Test review_templates table
    const reviewResult = await supabaseService.from('review_templates').select('*').limit(1);
    console.log('Review templates table:', reviewResult.error ? 'ERROR: ' + reviewResult.error.message : 'SUCCESS - ' + reviewResult.data.length + ' records');
    
    console.log('\n✅ Database connectivity verified!');
    
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
  }
}

testConnection();
