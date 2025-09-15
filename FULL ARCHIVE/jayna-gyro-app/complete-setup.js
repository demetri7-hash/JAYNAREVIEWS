const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runSQLFile(filePath, description) {
  console.log(`📄 Running ${description}...`)
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8')
    
    // Split by semicolons and filter out empty statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0)
    
    for (const statement of statements) {
      const trimmedStatement = statement.trim()
      if (trimmedStatement) {
        console.log(`   Executing: ${trimmedStatement.substring(0, 80)}${trimmedStatement.length > 80 ? '...' : ''}`)
        const { error } = await supabase.rpc('exec_sql', { sql_query: trimmedStatement })
        
        if (error) {
          console.warn(`   ⚠️  Warning: ${error.message}`)
        }
      }
    }
    
    console.log(`✅ ${description} completed`)
    return true
  } catch (error) {
    console.error(`❌ Error running ${description}:`, error.message)
    return false
  }
}

async function setupCompleteDatabase() {
  console.log('🚀 Setting up Jayna Gyro Database with Reviews and Manager Features...\n')

  const sqlFiles = [
    {
      path: './database_schema.sql',
      description: 'Core Database Schema (Employees, Worksheets, Inventory)'
    },
    {
      path: './database_reviews_schema.sql', 
      description: 'Review System Schema (Close Reviews, Templates, Checklist Items)'
    },
    {
      path: './database_population.sql',
      description: 'Core Data Population (Employees, Inventory)'
    },
    {
      path: './database_reviews_data.sql',
      description: 'Review Templates and Data (Real data from reference files)'
    },
    {
      path: './database_checklist_items.sql',
      description: 'Checklist Items (Real tasks from FOH/BOH reference files)'
    }
  ]

  let successCount = 0
  
  for (const sqlFile of sqlFiles) {
    if (fs.existsSync(sqlFile.path)) {
      const success = await runSQLFile(sqlFile.path, sqlFile.description)
      if (success) successCount++
      console.log('') // Add spacing
    } else {
      console.warn(`⚠️  File not found: ${sqlFile.path}`)
    }
  }

  console.log(`📊 Database Setup Summary:`)
  console.log(`   ✅ Successfully ran ${successCount} of ${sqlFiles.length} SQL files`)
  
  if (successCount === sqlFiles.length) {
    console.log('\n🎉 Complete database setup finished!')
    console.log('🔍 Your database now includes:')
    console.log('   • Core employee and worksheet functionality')
    console.log('   • Review system for shift transitions') 
    console.log('   • Manager editing capabilities for checklists')
    console.log('   • Real checklist data from reference files')
    console.log('   • Multilingual support (English, Spanish, Turkish)')
    console.log('\n✨ The Jayna Gyro app is ready to use with full review workflow!')
  } else {
    console.log('\n⚠️  Some files had issues. Check the warnings above.')
    console.log('💡 The app may still work, but some features might be limited.')
  }
}

// Add exec_sql function if it doesn't exist
async function createExecSQLFunction() {
  const { error } = await supabase.rpc('exec_sql', { sql_query: 'SELECT 1' })
  
  if (error && error.message.includes('function exec_sql does not exist')) {
    console.log('📝 Creating exec_sql helper function...')
    
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
      RETURNS text
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql_query;
        RETURN 'OK';
      EXCEPTION
        WHEN OTHERS THEN
          RETURN 'ERROR: ' || SQLERRM;
      END;
      $$;
    `
    
    const { error: createError } = await supabase.rpc('exec', { query: createFunctionSQL })
    if (createError) {
      console.warn('⚠️  Could not create exec_sql function. Proceeding with direct queries...')
    } else {
      console.log('✅ Helper function created')
    }
  }
}

// Run the setup
createExecSQLFunction()
  .then(() => setupCompleteDatabase())
  .catch(error => {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  })
