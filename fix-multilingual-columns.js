// Add multilingual columns to manager_updates table
const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually
const supabaseUrl = 'https://xedpssqxgmnwufatyoje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMultilingualColumns() {
  try {
    console.log('Adding multilingual columns to manager_updates table...');
    
    // Try adding columns one by one
    const queries = [
      'ALTER TABLE manager_updates ADD COLUMN title_en TEXT',
      'ALTER TABLE manager_updates ADD COLUMN title_es TEXT', 
      'ALTER TABLE manager_updates ADD COLUMN title_tr TEXT',
      'ALTER TABLE manager_updates ADD COLUMN message_en TEXT',
      'ALTER TABLE manager_updates ADD COLUMN message_es TEXT',
      'ALTER TABLE manager_updates ADD COLUMN message_tr TEXT'
    ];
    
    for (const query of queries) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: query });
        if (error) {
          console.log(`Column may already exist: ${query} - ${error.message}`);
        } else {
          console.log(`Successfully executed: ${query}`);
        }
      } catch (err) {
        console.log(`Error with query ${query}:`, err.message);
      }
    }
    
    // Update existing records to populate English columns
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: 'UPDATE manager_updates SET title_en = title, message_en = message WHERE (title_en IS NULL OR message_en IS NULL) AND title IS NOT NULL AND message IS NOT NULL'
      });
      
      if (error) {
        console.error('Error updating existing records:', error);
      } else {
        console.log('Successfully updated existing records');
      }
    } catch (err) {
      console.log('Error updating records:', err.message);
    }
    
    // Verify the changes by doing a simple select
    try {
      const { data: verifyData, error: verifyError } = await supabase
        .from('manager_updates')
        .select('id, title, title_en')
        .limit(1);
      
      if (verifyError) {
        console.error('Error verifying changes:', verifyError);
      } else {
        console.log('Verification successful! Sample record structure looks good.');
        if (verifyData && verifyData.length > 0) {
          console.log('Sample record keys:', Object.keys(verifyData[0]));
        }
      }
    } catch (err) {
      console.log('Verification error:', err.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

addMultilingualColumns();