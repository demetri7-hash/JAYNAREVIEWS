// Check if manager updates are being created and can be fetched
const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const supabaseUrl = 'https://xedpssqxgmnwufatyoje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkManagerUpdates() {
  try {
    console.log('Checking manager_updates table...');
    
    // Check total count
    const { count, error: countError } = await supabase
      .from('manager_updates')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('❌ Count error:', countError);
    } else {
      console.log('✅ Total manager updates:', count);
    }
    
    // Get recent updates
    const { data: updates, error: fetchError } = await supabase
      .from('manager_updates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (fetchError) {
      console.log('❌ Fetch error:', fetchError);
    } else {
      console.log('✅ Recent updates:', updates?.length);
      updates?.forEach((update, index) => {
        console.log(`${index + 1}. ${update.title} (${update.created_at}) - Active: ${update.is_active}`);
      });
    }
    
    // Test the exact query the API uses
    console.log('Testing API-style query...');
    const { data: apiUpdates, error: apiError } = await supabase
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
        created_by,
        manager_update_reads!left(
          id,
          read_at,
          user_id
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (apiError) {
      console.log('❌ API-style query error:', apiError);
    } else {
      console.log('✅ API-style query success:', apiUpdates?.length, 'updates');
    }
    
  } catch (error) {
    console.error('Error checking updates:', error);
  }
}

checkManagerUpdates().catch(console.error);