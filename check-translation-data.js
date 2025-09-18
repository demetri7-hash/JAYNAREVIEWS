// Check recent manager updates to see if translations are being saved
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xedpssqxgmnwufatyoje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRecentUpdates() {
  try {
    console.log('Checking recent manager updates for translation data...');
    
    // Get updates from the last hour that contain "test" in the title
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
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
        created_at,
        priority,
        type
      `)
      .gte('created_at', oneHourAgo)
      .ilike('title', '%test%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching updates:', error);
      return;
    }

    console.log(`\nFound ${updates.length} recent updates with "test" in the title:\n`);

    if (updates.length === 0) {
      console.log('❌ No recent test updates found. Let me check all recent updates...');
      
      // Check all recent updates regardless of title
      const { data: allRecent, error: allError } = await supabase
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
          created_at
        `)
        .gte('created_at', oneHourAgo)
        .order('created_at', { ascending: false })
        .limit(10);

      if (allError) {
        console.error('Error fetching all recent updates:', allError);
        return;
      }

      console.log(`\nFound ${allRecent.length} total recent updates:\n`);
      
      allRecent.forEach((update, index) => {
        console.log(`--- Update ${index + 1} ---`);
        console.log(`ID: ${update.id}`);
        console.log(`Title: "${update.title}"`);
        console.log(`Created: ${update.created_at}`);
        console.log(`Has EN translation: ${update.title_en ? 'YES' : 'NO'}`);
        console.log(`Has ES translation: ${update.title_es ? 'YES' : 'NO'}`);
        console.log(`Has TR translation: ${update.title_tr ? 'YES' : 'NO'}`);
        console.log('');
      });
      
      return;
    }

    updates.forEach((update, index) => {
      console.log(`--- Test Update ${index + 1} ---`);
      console.log(`ID: ${update.id}`);
      console.log(`Created: ${update.created_at}`);
      console.log(`Priority: ${update.priority}`);
      console.log(`Type: ${update.type}`);
      console.log('');
      
      console.log('TITLES:');
      console.log(`  Original: "${update.title}"`);
      console.log(`  English:  "${update.title_en || 'NULL'}"`);
      console.log(`  Spanish:  "${update.title_es || 'NULL'}"`);
      console.log(`  Turkish:  "${update.title_tr || 'NULL'}"`);
      console.log('');
      
      console.log('MESSAGES:');
      console.log(`  Original: "${update.message}"`);
      console.log(`  English:  "${update.message_en ? update.message_en.substring(0, 50) + '...' : 'NULL'}"`);
      console.log(`  Spanish:  "${update.message_es ? update.message_es.substring(0, 50) + '...' : 'NULL'}"`);
      console.log(`  Turkish:  "${update.message_tr ? update.message_tr.substring(0, 50) + '...' : 'NULL'}"`);
      console.log('');
      
      // Check if translations exist
      const hasTranslations = update.title_en && update.title_es && update.title_tr;
      if (hasTranslations) {
        console.log('✅ TRANSLATION STATUS: All three languages saved!');
      } else {
        console.log('❌ TRANSLATION STATUS: Missing translations - only original language saved');
      }
      console.log('==========================================\n');
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkRecentUpdates();