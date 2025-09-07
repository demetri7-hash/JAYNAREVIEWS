import { supabaseAdmin } from './src/lib/supabase'

async function setupDatabase() {
  console.log('🚀 Setting up Jayna Gyro database...')

  try {
    // Read and execute schema file
    const fs = require('fs')
    const path = require('path')
    
    // Execute schema
    console.log('📋 Creating database schema...')
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'database_schema.sql'), 'utf8')
    
    // Split and execute each statement
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await supabaseAdmin.rpc('exec_sql', { sql: statement })
        } catch (error) {
          // Handle CREATE TABLE IF NOT EXISTS gracefully
          if (!error.message?.includes('already exists')) {
            console.error('Statement failed:', statement.substring(0, 100) + '...')
            throw error
          }
        }
      }
    }

    // Execute population data
    console.log('📦 Populating database with initial data...')
    const populationSQL = fs.readFileSync(path.join(__dirname, 'database_population.sql'), 'utf8')
    
    const populationStatements = populationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (const statement of populationStatements) {
      if (statement.trim()) {
        try {
          await supabaseAdmin.rpc('exec_sql', { sql: statement })
        } catch (error) {
          if (!error.message?.includes('duplicate key')) {
            console.error('Population statement failed:', statement.substring(0, 100) + '...')
            throw error
          }
        }
      }
    }

    // Verify setup
    console.log('🔍 Verifying database setup...')
    
    const { data: employees, error: empError } = await supabaseAdmin
      .from('employees')
      .select('count', { count: 'exact' })
    
    if (empError) throw empError
    
    const { data: inventory, error: invError } = await supabaseAdmin
      .from('inventory_items')
      .select('count', { count: 'exact' })
    
    if (invError) throw invError
    
    const { data: recipes, error: recError } = await supabaseAdmin
      .from('recipes')
      .select('count', { count: 'exact' })
    
    if (recError) throw recError

    console.log('✅ Database setup complete!')
    console.log(`👥 Employees: ${employees?.[0]?.count || 0}`)
    console.log(`📦 Inventory Items: ${inventory?.[0]?.count || 0}`)
    console.log(`🍳 Recipes: ${recipes?.[0]?.count || 0}`)
    
    console.log('\n🎉 Jayna Gyro Employee Worksheet App is ready!')
    console.log('🌐 Visit: http://localhost:3000')

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

// Alternative approach if RPC doesn't work - direct table creation
async function directSetup() {
  console.log('🔄 Using direct table creation approach...')
  
  try {
    // Create employees table
    const { error: employeeError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS employees (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          department TEXT CHECK (department IN ('FOH', 'BOH')) NOT NULL,
          languages_spoken TEXT[] DEFAULT ARRAY['en'],
          roles TEXT[] NOT NULL,
          shifts TEXT[] NOT NULL,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
    })
    
    if (employeeError && !employeeError.message?.includes('already exists')) {
      throw employeeError
    }

    console.log('✅ Tables created successfully')
    
    // Insert sample data using regular insert
    const sampleEmployees = [
      {
        name: 'Maria Garcia',
        department: 'FOH',
        languages_spoken: ['es', 'en'],
        roles: ['Server', 'Cashier'],
        shifts: ['AM', 'Transition', 'PM']
      },
      {
        name: 'Ahmed Yilmaz',
        department: 'BOH',
        languages_spoken: ['tr', 'en'],
        roles: ['Line Cook', 'Prep Cook'],
        shifts: ['Opening Line', 'Morning Prep']
      }
    ]

    const { data, error } = await supabaseAdmin
      .from('employees')
      .upsert(sampleEmployees)
      .select()

    if (error) {
      console.error('Insert error:', error)
    } else {
      console.log('✅ Sample employees added:', data?.length)
    }

  } catch (error) {
    console.error('❌ Direct setup failed:', error)
  }
}

if (require.main === module) {
  setupDatabase().catch(error => {
    console.error('Setup failed, trying direct approach...')
    directSetup()
  })
}

export { setupDatabase, directSetup }
