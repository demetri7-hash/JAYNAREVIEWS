const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

console.log('Environment check:');
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Found' : 'Missing');
console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runEmployeeSchema() {
  try {
    const schema = fs.readFileSync('./employee-management-schema.sql', 'utf8');
    console.log('\n🔄 Running employee management schema...');
    
    // Split into individual statements and run them
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        console.log(`Running statement ${i + 1}/${statements.length}...`);
        const { error } = await supabase.rpc('exec_sql', { query: statement + ';' });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
        } else {
          console.log(`✅ Statement ${i + 1} completed`);
        }
      }
    }
    
    console.log('\n🎉 Employee management schema setup complete!');
  } catch (err) {
    console.error('❌ Setup error:', err.message);
  }
}

runEmployeeSchema();