// Test if manager_update_reads records are being created
const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const supabaseUrl = 'https://xedpssqxgmnwufatyoje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkReadStatus() {
  try {
    console.log('Checking manager_update_reads table...');
    
    // Check if the table exists and has data
    const { data: reads, error: readsError } = await supabase
      .from('manager_update_reads')
      .select('*')
      .order('read_at', { ascending: false })
      .limit(10);
    
    if (readsError) {
      console.log('❌ manager_update_reads table error:', readsError.message);
      console.log('Error details:', readsError);
    } else {
      console.log('✅ manager_update_reads table exists');
      console.log('Total read records found:', reads?.length || 0);
      
      if (reads && reads.length > 0) {
        console.log('Recent read records:');
        reads.forEach((read, index) => {
          console.log(`${index + 1}. Update: ${read.update_id}, User: ${read.user_id}, Read at: ${read.read_at}`);
        });
      } else {
        console.log('No read records found - this explains why read status isn\'t persisting');
      }
    }
    
    // Also check if the user profile exists
    console.log('\nChecking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .eq('email', 'demetri7@gmail.com')
      .single();
    
    if (profileError) {
      console.log('❌ Profile error:', profileError.message);
    } else {
      console.log('✅ User profile found:', profile);
    }
    
  } catch (error) {
    console.error('Error checking read status:', error);
  }
}

checkReadStatus().catch(console.error);