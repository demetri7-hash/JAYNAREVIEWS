require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

async function createTables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  console.log('🚀 Creating database tables for Jayna Gyro App...')
  
  try {
    // Create employees table using raw SQL
    console.log('Creating employees table...')
    const { data: createEmployees, error: employeeError } = await supabase.rpc('create_employees_table')
    
    if (employeeError) {
      console.log('Expected error (table creation via RPC not available):', employeeError.message)
    }
    
    // Let's try direct insertions to test if tables exist
    console.log('Testing table access...')
    
    // Try to insert a sample employee
    const sampleEmployee = {
      name: 'Test Employee',
      department: 'FOH',
      languages_spoken: ['en'],
      roles: ['Server'],
      shifts: ['AM']
    }
    
    const { data, error } = await supabase
      .from('employees')
      .insert([sampleEmployee])
      .select()
    
    if (error) {
      console.log('❌ Error inserting employee (table may not exist):', error.message)
      console.log('\n📝 Manual setup required:')
      console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard')
      console.log('2. Navigate to SQL Editor')
      console.log('3. Copy and paste the SQL from database_schema.sql')
      console.log('4. Then copy and paste the data from database_population.sql')
      console.log('\n🌐 Your app is running at: http://localhost:3000')
    } else {
      console.log('✅ Employee table exists and working!')
      console.log('Sample employee created:', data)
    }
    
  } catch (error) {
    console.error('❌ Database setup error:', error.message)
  }
}

// Let's also create a simple data insertion function
async function insertSampleData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const sampleEmployees = [
    {
      name: 'Maria Garcia',
      department: 'FOH',
      languages_spoken: ['es', 'en'],
      roles: ['Server', 'Cashier'],
      shifts: ['AM', 'Transition', 'PM'],
      active: true
    },
    {
      name: 'Ahmed Yilmaz',
      department: 'BOH',
      languages_spoken: ['tr', 'en'],
      roles: ['Line Cook', 'Prep Cook'],
      shifts: ['Opening Line', 'Morning Prep', 'Transition Line'],
      active: true
    },
    {
      name: 'John Smith',
      department: 'FOH',
      languages_spoken: ['en'],
      roles: ['Server', 'Bar Staff'],
      shifts: ['AM', 'PM', 'Bar'],
      active: true
    },
    {
      name: 'Carlos Martinez',
      department: 'BOH',
      languages_spoken: ['es', 'en'],
      roles: ['Lead Prep Cook'],
      shifts: ['Morning Prep', 'Closing Prep/Dishwasher'],
      active: true
    }
  ]
  
  try {
    const { data, error } = await supabase
      .from('employees')
      .upsert(sampleEmployees, { onConflict: 'name' })
      .select()
    
    if (error) {
      console.log('❌ Could not insert sample data:', error.message)
    } else {
      console.log('✅ Sample employees inserted:', data.length)
    }
  } catch (error) {
    console.error('❌ Sample data insertion failed:', error.message)
  }
}

createTables().then(() => {
  console.log('\n🎉 Setup complete! Check the app at http://localhost:3000')
})
