// Test manager updates API directly
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xedpssqxgmnwufatyoje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testManagerUpdatesAPI() {
  try {
    console.log('Testing manager updates API query...');
    
    // This mimics the exact query from our API
    const { data: updates, error } = await supabase
      .from('manager_updates')
      .select(`
        id,
        title,
        message,
        title_en,
        title_es,
        title_tr,
        message_en,
        message_es,
        message_tr,
        priority,
        type,
        requires_acknowledgment,
        created_at,
        expires_at,
        is_active,
        created_by
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error with API query:', error);
    } else {
      console.log('Success! API query works perfectly.');
      console.log('Number of updates:', updates?.length || 0);
      console.log('Sample update:', updates?.[0] ? {
        id: updates[0].id,
        title: updates[0].title,
        title_en: updates[0].title_en,
        priority: updates[0].priority,
        type: updates[0].type
      } : 'No updates found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testManagerUpdatesAPI();