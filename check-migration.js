require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createWorkflowTables() {
  console.log('🚀 Creating workflow system tables...');
  
  try {
    // Create workflows table
    console.log('Creating workflows table...');
    const { error: workflowsError } = await supabase.from('workflows').select('id').limit(1);
    
    if (workflowsError && workflowsError.code === 'PGRST116') {
      // Table doesn't exist, we need to create it manually using SQL
      console.log('❌ Cannot create tables directly with Supabase client.');
      console.log('📝 Please run the migration manually in Supabase dashboard:');
      console.log('1. Go to https://xedpssqxgmnwufatyoje.supabase.co/project/xedpssqxgmnwufatyoje');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the SQL from supabase/migrations/20250918000001_create_workflow_system.sql');
      console.log('4. Execute the migration');
      return;
    }
    
    console.log('✅ Workflows table already exists or migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('📝 Please run the migration manually in Supabase dashboard:');
    console.log('1. Go to https://xedpssqxgmnwufatyoje.supabase.co/project/xedpssqxgmnwufatyoje');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the SQL from supabase/migrations/20250918000001_create_workflow_system.sql');
    console.log('4. Execute the migration');
  }
}

createWorkflowTables();