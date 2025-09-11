import { NextRequest, NextResponse } from 'next/server'
import { supabase, db } from '@/lib/supabase'

// Sample workflow templates
const WORKFLOW_TEMPLATES = {
  'foh-morning': {
    name: 'FOH Morning Opening',
    tasks: [
      { id: 1, name: 'Unlock doors and disarm security', completed: false },
      { id: 2, name: 'Turn on lights and equipment', completed: false },
      { id: 3, name: 'Check cleanliness of dining area', completed: false },
      { id: 4, name: 'Set up POS system', completed: false },
      { id: 5, name: 'Stock napkins and utensils', completed: false },
      { id: 6, name: 'Check restroom supplies', completed: false },
      { id: 7, name: 'Review daily specials', completed: false },
      { id: 8, name: 'Count register till', completed: false }
    ]
  },
  'boh-prep': {
    name: 'BOH Morning Prep',
    tasks: [
      { id: 1, name: 'Check refrigeration temperatures', completed: false },
      { id: 2, name: 'Sanitize prep surfaces', completed: false },
      { id: 3, name: 'Check inventory levels', completed: false },
      { id: 4, name: 'Prepare daily proteins', completed: false },
      { id: 5, name: 'Cut vegetables and garnishes', completed: false },
      { id: 6, name: 'Make sauces and dressings', completed: false },
      { id: 7, name: 'Set up grill station', completed: false },
      { id: 8, name: 'Stock line with ingredients', completed: false }
    ]
  },
  'foh-closing': {
    name: 'FOH Evening Closing',
    tasks: [
      { id: 1, name: 'Clean and sanitize tables', completed: false },
      { id: 2, name: 'Sweep and mop floors', completed: false },
      { id: 3, name: 'Clean restrooms', completed: false },
      { id: 4, name: 'Count register and prepare deposit', completed: false },
      { id: 5, name: 'Turn off equipment', completed: false },
      { id: 6, name: 'Take out trash', completed: false },
      { id: 7, name: 'Set security alarm', completed: false },
      { id: 8, name: 'Lock all doors', completed: false }
    ]
  },
  'boh-closing': {
    name: 'BOH Evening Closing',
    tasks: [
      { id: 1, name: 'Clean and sanitize prep areas', completed: false },
      { id: 2, name: 'Store food items properly', completed: false },
      { id: 3, name: 'Clean cooking equipment', completed: false },
      { id: 4, name: 'Wash and sanitize dishes', completed: false },
      { id: 5, name: 'Take inventory of remaining items', completed: false },
      { id: 6, name: 'Clean floors and drains', completed: false },
      { id: 7, name: 'Turn off equipment', completed: false },
      { id: 8, name: 'Dispose of waste properly', completed: false }
    ]
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      employee_name, // We'll use this to lookup employee_id
      department,
      shift_type,
      workflow_type = 'foh-morning' // default
    } = body

    // Validate required fields
    if (!employee_name || !department || !shift_type) {
      return NextResponse.json(
        { error: 'Missing required fields: employee_name, department, shift_type' },
        { status: 400 }
      )
    }

    // Get employee_id from employee_name
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('name', employee_name)
      .single()

    if (employeeError || !employee) {
      return NextResponse.json(
        { error: 'Employee not found', details: employeeError?.message },
        { status: 404 }
      )
    }

    const employee_id = employee.id

    // If no employee_id provided, get one from employees table
    let actualEmployeeId = employee_id
    if (!actualEmployeeId && employee_name) {
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('name', employee_name)
        .single()
      
      if (employee) {
        actualEmployeeId = employee.id
      }
    }
    
    // If still no employee_id, get any employee from the right department
    if (!actualEmployeeId) {
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('department', department)
        .limit(1)
        .single()
      
      if (employee) {
        actualEmployeeId = employee.id
      }
    }

    if (!actualEmployeeId) {
      return NextResponse.json(
        { error: 'No valid employee found' },
        { status: 400 }
      )
    }

    // Get the workflow template
    const template = WORKFLOW_TEMPLATES[workflow_type as keyof typeof WORKFLOW_TEMPLATES] || WORKFLOW_TEMPLATES['foh-morning']

    // Create initial checklist data (array, not object)
    const checklistData = template.tasks.map(task => ({
      id: task.id,
      name: task.name,
      completed: false,
      required: true,
      notes: null,
      photo_url: null
    }))

    // Create the worksheet in database
    const { data: worksheet, error: worksheetError } = await supabase
      .from('worksheets')
      .insert({
        employee_id,
        department,
        shift_type,
        checklist_data: checklistData, // This is an array now
        completion_percentage: 0,
        status: 'in_progress',
        priority: 'medium'
      })
      .select()
      .single()

    if (worksheetError) {
      console.error('Worksheet creation error:', worksheetError)
      return NextResponse.json(
        { error: 'Failed to create worksheet', details: worksheetError.message },
        { status: 500 }
      )
    }

    // Create a workflow message using the database service
    let workflowMessage = null
    try {
      // Pass the complete worksheet object as returned from database
      workflowMessage = await db.createWorkflowMessage(worksheet)
    } catch (messageError) {
      console.log('Could not create workflow message:', messageError)
      // Continue anyway - the worksheet was created successfully
    }

    return NextResponse.json({ 
      success: true, 
      worksheet,
      workflow_message: workflowMessage,
      template: template.name,
      task_count: template.tasks.length,
      message: `${template.name} workflow started successfully!` 
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true,
      workflows: Object.keys(WORKFLOW_TEMPLATES),
      templates: WORKFLOW_TEMPLATES
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
