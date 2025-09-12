import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const results: any = {
      tables: {},
      errors: [],
      ready_for_workflows: false
    }

    // Check each required table and its columns
    const requiredTables = [
      {
        name: 'employees',
        required_columns: ['id', 'name', 'email', 'department', 'role']
      },
      {
        name: 'checklists', 
        required_columns: ['id', 'name', 'description', 'department', 'category']
      },
      {
        name: 'workflows',
        required_columns: ['id', 'name', 'checklist_id', 'assigned_to', 'status']
      },
      {
        name: 'task_instances',
        required_columns: ['id', 'workflow_id', 'title', 'status']
      }
    ]

    for (const table of requiredTables) {
      try {
        // Try to query the table structure
        const { data, error } = await supabase
          .from(table.name)
          .select('*')
          .limit(0) // Don't actually fetch data, just test structure

        if (error) {
          results.tables[table.name] = {
            exists: false,
            error: error.message,
            code: error.code
          }
          results.errors.push(`Table ${table.name}: ${error.message}`)
        } else {
          results.tables[table.name] = {
            exists: true,
            accessible: true
          }

          // Test specific columns by trying to select them
          for (const column of table.required_columns) {
            try {
              const { error: colError } = await supabase
                .from(table.name)
                .select(column)
                .limit(0)

              if (colError) {
                results.tables[table.name][`column_${column}`] = {
                  exists: false,
                  error: colError.message
                }
                results.errors.push(`${table.name}.${column}: ${colError.message}`)
              } else {
                results.tables[table.name][`column_${column}`] = { exists: true }
              }
            } catch (err: any) {
              results.tables[table.name][`column_${column}`] = {
                exists: false,
                error: err.message
              }
            }
          }
        }
      } catch (err: any) {
        results.tables[table.name] = {
          exists: false,
          error: err.message
        }
        results.errors.push(`Table ${table.name}: ${err.message}`)
      }
    }

    // Check if we have any sample data
    try {
      const { data: employees } = await supabase
        .from('employees')
        .select('count')
        .limit(1)

      results.sample_data = {
        employees_exist: employees && employees.length > 0
      }
    } catch (err) {
      // Ignore sample data errors
    }

    // Determine if ready for workflows
    results.ready_for_workflows = results.errors.length === 0

    return NextResponse.json({
      success: true,
      schema_status: results.ready_for_workflows ? 'ready' : 'needs_setup',
      ...results
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      schema_status: 'error'
    }, { status: 500 })
  }
}