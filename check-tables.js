require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTables() {
  console.log('🔍 Checking existing tables...');
  
  const tablesToCheck = [
    'workflows',
    'workflow_tasks', 
    'workflow_assignments',
    'workflow_task_completions',
    'tasks'
  ];
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`❌ Table '${table}' does not exist`);
        } else {
          console.log(`⚠️  Table '${table}' exists but error accessing: ${error.message}`);
        }
      } else {
        console.log(`✅ Table '${table}' exists and accessible`);
      }
    } catch (e) {
      console.log(`❌ Error checking table '${table}': ${e.message}`);
    }
  }
  
  // Also check if tasks table has our new fields
  try {
    console.log('\n🔍 Checking tasks table structure...');
    const { data, error } = await supabase
      .from('tasks')
      .select('id, tags, is_photo_mandatory, is_notes_mandatory')
      .limit(1);
      
    if (error) {
      console.log('❌ Tasks table might not have new workflow fields yet');
    } else {
      console.log('✅ Tasks table has workflow fields (tags, is_photo_mandatory, is_notes_mandatory)');
    }
  } catch (e) {
    console.log('❌ Error checking tasks table structure:', e.message);
  }
}

checkTables();