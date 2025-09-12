import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Updated comprehensive workflow templates based on actual Jayna Gyro forms
const WORKFLOW_TEMPLATES = {
  'foh-opening': {
    name: 'FOH Opening Checklist',
    department: 'FOH',
    shift_type: 'Opening',
    estimated_duration: 90,
    tasks: [
      // Dining Room & Patio Setup
      { id: 1, name: 'Remove chairs and re-wipe all tables', section: 'Dining Room Setup', required: true, critical: true, completed: false },
      { id: 2, name: 'Wipe table sides, legs, chairs, and banquette sofas', section: 'Dining Room Setup', required: true, completed: false },
      { id: 3, name: 'Check top wood ledge of sofas (especially outside)', section: 'Dining Room Setup', required: true, completed: false },
      { id: 4, name: 'Ensure chairs tucked in, tables aligned and evenly spaced', section: 'Dining Room Setup', required: true, critical: true, completed: false },
      { id: 5, name: 'Place lamps on tables, hide charging cables', section: 'Dining Room Setup', required: true, completed: false },
      { id: 6, name: '"Salt to the Street" - salt toward parking, pepper toward kitchen', section: 'Dining Room Setup', required: true, completed: false },
      { id: 7, name: 'Wipe and dry menus - remove stickiness', section: 'Dining Room Setup', required: true, critical: true, completed: false },
      { id: 8, name: 'Turn on all dining room lights', section: 'Dining Room Setup', required: true, critical: true, completed: false },
      { id: 9, name: 'Unlock doors and flip both signs to "OPEN"', section: 'Dining Room Setup', required: true, critical: true, photo_required: true, completed: false },
      { id: 10, name: 'Check and refill all rollups (napkin + silverware)', section: 'Dining Room Setup', required: true, critical: true, completed: false },
      { id: 11, name: 'Wipe patio tables and barstools with fresh towel', section: 'Dining Room Setup', required: true, completed: false },
      { id: 12, name: 'Raise blinds', section: 'Dining Room Setup', required: true, completed: false },
      { id: 13, name: 'Windex front doors', section: 'Dining Room Setup', required: true, critical: true, completed: false },
      { id: 14, name: 'Wipe down front of registers', section: 'Dining Room Setup', required: true, critical: true, completed: false },
      
      // Cleanliness & Walkthrough
      { id: 15, name: 'Sweep perimeter and remove cobwebs from all areas', section: 'Cleanliness', required: true, critical: true, completed: false },
      { id: 16, name: 'Review previous night\'s closing checklist for notes', section: 'Cleanliness', required: true, critical: true, completed: false },
      
      // Bathroom Checks - CRITICAL SECTION
      { id: 17, name: 'Clean toilets thoroughly: bowl, lid, seat, under seat, floor around', section: 'Bathrooms', required: true, critical: true, photo_required: true, completed: false },
      { id: 18, name: 'Windex mirrors', section: 'Bathrooms', required: true, critical: true, completed: false },
      { id: 19, name: 'Dust hand dryer, soap dispenser, wall perimeter', section: 'Bathrooms', required: true, completed: false },
      { id: 20, name: 'Scrub and clean sink + remove mold from drain', section: 'Bathrooms', required: true, critical: true, completed: false },
      { id: 21, name: 'Dry and polish all surfaces', section: 'Bathrooms', required: true, critical: true, completed: false },
      { id: 22, name: 'Restock toilet paper', section: 'Bathrooms', required: true, critical: true, completed: false },
      { id: 23, name: 'Restock paper towels', section: 'Bathrooms', required: true, critical: true, completed: false },
      { id: 24, name: 'Restock toilet seat covers', section: 'Bathrooms', required: true, critical: true, completed: false },
      { id: 25, name: 'VERIFY BOH cleaner work - if not OK, clean and notify Demetri', section: 'Bathrooms', required: true, critical: true, photo_required: true, escalation: true, completed: false },
      
      // Expo Station & Sauce Prep
      { id: 26, name: 'Fill sanitation tub: ¾ sanitizer, 2 microfiber towels, one hanging half out', section: 'Expo Station', required: true, critical: true, completed: false },
      { id: 27, name: 'Set expo towels: 1 damp for plates, 1 dry for surfaces', section: 'Expo Station', required: true, critical: true, completed: false },
      { id: 28, name: 'Sauce backups: Tzatziki 1-2 (2oz), Spicy Aioli 1-2 (2oz), Lemon 1-2 (3oz)', section: 'Expo Station', required: true, critical: true, completed: false },
      { id: 29, name: 'Squeeze bottles: 1 full each Tzatziki, Spicy Aioli, Lemon', section: 'Expo Station', required: true, critical: true, completed: false },
      
      // Additional critical tasks
      { id: 30, name: 'Stock kitchen with plates/bowls - replenish throughout shift', section: 'Kitchen Support', required: true, critical: true, completed: false },
      { id: 31, name: 'Fill water dispensers with ice, fruit, water - luxurious look', section: 'Water Station', required: true, critical: true, completed: false },
      { id: 32, name: 'Fill ice well to overflowing', section: 'Bar Setup', required: true, critical: true, completed: false },
      { id: 33, name: 'Switch froyo machine to ON and verify KEEP FRESH overnight', section: 'Froyo', required: true, critical: true, completed: false }
    ]
  },
  
  'missing-ingredients': {
    name: 'Missing Ingredients Report',
    department: 'BOTH',
    shift_type: 'Any',
    estimated_duration: 5,
    real_time: true,
    urgent: true,
    tasks: [
      { id: 1, name: 'Report missing or low stock item immediately', section: 'Reporting', required: true, critical: true, completed: false }
    ]
  },

  'foh-closing': {
    name: 'FOH Closing List',
    department: 'FOH',
    shift_type: 'Closing',
    estimated_duration: 75,
    start_restriction: '21:45', // 9:45 PM
    tasks: [
      // Dining Room & Floor Cleaning
      { id: 1, name: 'Wipe all dining tables, bar counters, stools, banquette sofas', section: 'Dining Room', required: true, critical: true, completed: false },
      { id: 2, name: 'Inspect booths - vacuum or wipe if crumbs/smudges visible', section: 'Dining Room', required: true, completed: false },
      { id: 3, name: 'Ensure all chairs tucked in and aligned neatly', section: 'Dining Room', required: true, critical: true, completed: false },
      { id: 4, name: 'Sweep under all tables, bar area, expo counter', section: 'Dining Room', required: true, critical: true, completed: false },
      { id: 5, name: 'Collect trash from bar, expo, bathrooms, office', section: 'Dining Room', required: true, critical: true, completed: false },
      { id: 6, name: 'Replace all trash bags with clean liners', section: 'Dining Room', required: true, critical: true, completed: false },
      { id: 7, name: 'Roll napkin sets using all available forks & knives', section: 'Dining Room', required: true, completed: false },
      
      // Expo & Water Station  
      { id: 8, name: 'Break down water station, clean dispensers, leave open to air dry', section: 'Expo Station', required: true, critical: true, completed: false },
      { id: 9, name: 'Purge stabbed tickets, wipe printer, screen, surrounding area', section: 'Expo Station', required: true, completed: false },
      { id: 10, name: 'Refill to-go ramekins with sauces (Tzatziki, Spicy Aioli, Lemon)', section: 'Expo Station', required: true, critical: true, completed: false },
      { id: 11, name: 'Label/date all perishable sauces, move to walk-in fridge', section: 'Expo Station', required: true, critical: true, completed: false },
      { id: 12, name: 'Stock to-go containers, lids, ramekins, bags, cups to 100%', section: 'Expo Station', required: true, critical: true, completed: false },
      { id: 13, name: 'Restock all beverages in the Coke fridge', section: 'Expo Station', required: true, critical: true, completed: false }
    ]
  },

  'boh-prep': {
    name: 'BOH Prep Workflow',
    department: 'BOH',
    shift_type: 'Prep',
    estimated_duration: 120,
    tasks: [
      { id: 1, name: 'Rate walk-in refrigerator organization (1-5)', section: 'Walk-through', required: true, rating_required: true, completed: false },
      { id: 2, name: 'Rate cleanliness of prep areas (1-5)', section: 'Walk-through', required: true, rating_required: true, completed: false },
      { id: 3, name: 'Check tzatziki levels - mark status', section: 'Inventory', required: true, critical: true, completed: false },
      { id: 4, name: 'Check gyro meat levels (beef and chicken)', section: 'Inventory', required: true, critical: true, completed: false },
      { id: 5, name: 'Assign urgent prep tasks (★)', section: 'Task Assignment', required: true, critical: true, completed: false },
      { id: 6, name: 'Coordinate with prep cook on responsibilities', section: 'Task Assignment', required: true, critical: true, completed: false }
    ]
  }
}

export async function POST(request: NextRequest) {
  try {
    const { workflow_type, employee_name, employee_id, department } = await request.json()
    
    if (!workflow_type || !employee_name) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: workflow_type and employee_name'
      }, { status: 400 })
    }

    // Look up employee by name to get ID
    let finalEmployeeId = employee_id
    
    if (!finalEmployeeId) {
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('name', employee_name)
        .single()

      if (employeeError || !employee) {
        return NextResponse.json({
          success: false,
          error: 'Employee not found in database'
        }, { status: 404 })
      }
      
      finalEmployeeId = employee.id
    }

    const template = WORKFLOW_TEMPLATES[workflow_type as keyof typeof WORKFLOW_TEMPLATES] || WORKFLOW_TEMPLATES['foh-opening']
    
    // Convert template tasks to checklist format
    const checklistData = template.tasks.map(task => ({
      id: task.id,
      name: task.name,
      task_description: task.section || '',
      required: task.required || false,
      photo_urls: [],
      critical: task.critical || false,
      min_rating: (task as any).rating_required ? 1 : null,
      completed: task.completed || false,
      rating: null,
      notes: null
    }))

    // Create worksheet in database
    const { data: worksheet, error: worksheetError } = await supabase
      .from('worksheets')
      .insert({
        employee_id: finalEmployeeId,
        department: department || template.department || 'FOH',
        shift_type: template.shift_type || 'General',
        checklist_data: checklistData,
        status: 'in_progress',
        completion_percentage: 0,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (worksheetError) {
      console.error('Database error:', worksheetError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create worksheet',
        details: worksheetError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      worksheet,
      employee_name,
      template_name: template.name,
      task_count: template.tasks.length,
      estimated_duration: template.estimated_duration,
      message: `Started ${template.name} workflow for ${employee_name}`
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
