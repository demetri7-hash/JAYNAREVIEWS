require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

async function testConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('Testing Supabase connection...')
  console.log('URL:', supabaseUrl)
  console.log('Key exists:', !!supabaseKey)
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('_test').select('*').limit(1)
    console.log('Connection test result:', { error: error?.message || 'none' })
    
    // Try to create a simple table
    console.log('Creating employees table...')
    const createResult = await supabase.rpc('exec', { 
      sql: `CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )` 
    })
    
    console.log('Create table result:', createResult)
    
  } catch (error) {
    console.error('Connection failed:', error.message)
  }
}

testConnection()
