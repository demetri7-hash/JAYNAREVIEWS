// Test creating a manager update via API
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xedpssqxgmnwufatyoje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCreateUpdate() {
  try {
    console.log('Testing manager update creation...');
    
    // First, get a manager profile ID
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, email')
      .eq('role', 'manager')
      .limit(1);
    
    if (profileError || !profiles?.length) {
      console.error('No manager found:', profileError);
      return;
    }
    
    const managerProfile = profiles[0];
    console.log('Found manager:', { id: managerProfile.id, email: managerProfile.email });
    
    // Create a test update
    const testUpdate = {
      title: 'Test Update - Database Fix Verification',
      message: 'This is a test update to verify that the manager updates system is working correctly after fixing the database schema.',
      priority: 'low',
      type: 'announcement',
      requires_acknowledgment: false,
      created_by: managerProfile.id,
      title_en: 'Test Update - Database Fix Verification',
      message_en: 'This is a test update to verify that the manager updates system is working correctly after fixing the database schema.'
    };
    
    const { data: newUpdate, error: createError } = await supabase
      .from('manager_updates')
      .insert([testUpdate])
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating update:', createError);
    } else {
      console.log('Success! Created update:', {
        id: newUpdate.id,
        title: newUpdate.title,
        priority: newUpdate.priority,
        created_at: newUpdate.created_at
      });
      
      // Test fetching all updates
      const { data: allUpdates, error: fetchError } = await supabase
        .from('manager_updates')
        .select('id, title, priority, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error('Error fetching updates:', fetchError);
      } else {
        console.log(`\nAll active updates (${allUpdates.length}):`);
        allUpdates.forEach((update, index) => {
          console.log(`  ${index + 1}. ${update.title} (${update.priority}) - ${update.created_at}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testCreateUpdate();