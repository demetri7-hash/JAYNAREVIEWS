// Create some sample users for testing the user management functionality
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set')
console.log('Service Key:', supabaseServiceKey ? 'Set' : 'Not set')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createSampleUsers() {
  const sampleUsers = [
    { email: 'john.doe@example.com', name: 'John Doe', role: 'staff' },
    { email: 'jane.smith@example.com', name: 'Jane Smith', role: 'kitchen_manager' },
    { email: 'mike.wilson@example.com', name: 'Mike Wilson', role: 'staff' },
    { email: 'sarah.johnson@example.com', name: 'Sarah Johnson', role: 'ordering_manager' },
    { email: 'tom.brown@example.com', name: 'Tom Brown', role: 'staff' },
  ]

  console.log('Creating sample users...')

  for (const user of sampleUsers) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(user, { onConflict: 'email' })

      if (error) {
        console.error(`Error creating user ${user.email}:`, error)
      } else {
        console.log(`✅ Created user: ${user.name} (${user.email}) - ${user.role}`)
      }
    } catch (err) {
      console.error(`Error with user ${user.email}:`, err)
    }
  }

  console.log('Sample users created successfully!')
}

createSampleUsers()