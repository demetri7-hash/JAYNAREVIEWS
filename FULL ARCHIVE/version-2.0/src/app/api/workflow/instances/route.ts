import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { 
      template_id, 
      employee_id, 
      department, 
      shift_type, 
      language = 'en',
      template_data 
    } = await request.json()
    
    if (!template_id || !employee_id || !department) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: template_id, employee_id, department'
      }, { status: 400 })
    }

    // Verify employee exists
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id, name, department, language')
      .eq('id', employee_id)
      .single()

    if (employeeError || !employee) {
      return NextResponse.json({
        success: false,
        error: 'Employee not found'
      }, { status: 404 })
    }

    // Create initial checklist data from template
    const checklist_data = template_data?.sections?.flatMap((section: any) => 
      section.tasks?.map((task: any) => ({
        id: task.id,
        section_id: section.id,
        section_name: section.name,
        name: task[`name_${language}`] || task.name,
        task_description: task[`description_${language}`] || task.task_description || '',
        required: task.required || false,
        critical: task.critical || false,
        photo_required: task.photo_required || false,
        min_rating: task.min_rating || null,
        completed: false,
        rating: null,
        notes: null,
        completed_at: null,
        photo_urls: []
      }))
    ) || []

    // Create worksheet in database
    const { data: worksheet, error: worksheetError } = await supabase
      .from('worksheets')
      .insert({
        employee_id,
        department,
        shift_type: shift_type || template_data?.shift_type || 'General',
        checklist_data,
        status: 'in_progress',
        completion_percentage: 0,
        started_at: new Date().toISOString(),
        notes: `Started ${template_data?.name || template_id} workflow`
      })
      .select()
      .single()

    if (worksheetError) {
      console.error('Database error creating worksheet:', worksheetError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create worksheet',
        details: worksheetError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      worksheet,
      employee_name: employee.name,
      template_name: template_data?.name || template_id,
      total_tasks: checklist_data.length,
      message: 'Workflow started successfully'
    })

  } catch (error: any) {
    console.error('Error starting workflow:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to start workflow',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employee_id = searchParams.get('employee_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
      .from('worksheets')
      .select(`
        *,
        employees!inner(id, name, department)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (employee_id) {
      query = query.eq('employee_id', employee_id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: worksheets, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch workflow instances',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      workflows: worksheets || [],
      count: worksheets?.length || 0
    })

  } catch (error: any) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch workflow instances',
      details: error.message
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { 
      worksheet_id, 
      task_id, 
      completed, 
      rating, 
      notes, 
      photo_urls 
    } = await request.json()
    
    if (!worksheet_id || task_id === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: worksheet_id and task_id'
      }, { status: 400 })
    }

    // Get current worksheet
    const { data: worksheet, error: fetchError } = await supabase
      .from('worksheets')
      .select('*')
      .eq('id', worksheet_id)
      .single()

    if (fetchError || !worksheet) {
      return NextResponse.json({
        success: false,
        error: 'Worksheet not found'
      }, { status: 404 })
    }

    // Update specific task in checklist_data array
    const updatedChecklistData = worksheet.checklist_data.map((task: any) => {
      if (task.id === task_id) {
        return {
          ...task,
          completed: completed !== undefined ? completed : task.completed,
          rating: rating !== undefined ? rating : task.rating,
          notes: notes !== undefined ? notes : task.notes,
          photo_urls: photo_urls !== undefined ? photo_urls : task.photo_urls,
          completed_at: completed ? new Date().toISOString() : task.completed_at
        }
      }
      return task
    })

    // Calculate completion percentage
    const completedTasks = updatedChecklistData.filter((task: any) => task.completed).length
    const totalTasks = updatedChecklistData.length
    const completion_percentage = Math.round((completedTasks / totalTasks) * 100)

    // Determine if worksheet is fully completed
    const allCompleted = completedTasks === totalTasks
    const newStatus = allCompleted ? 'completed' : 'in_progress'
    const completed_at = allCompleted ? new Date().toISOString() : null

    // Update worksheet
    const { data: updatedWorksheet, error: updateError } = await supabase
      .from('worksheets')
      .update({
        checklist_data: updatedChecklistData,
        completion_percentage,
        status: newStatus,
        completed_at,
        updated_at: new Date().toISOString()
      })
      .eq('id', worksheet_id)
      .select()
      .single()

    if (updateError) {
      console.error('Database error updating worksheet:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update worksheet',
        details: updateError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      worksheet: updatedWorksheet,
      completion_percentage,
      completed_tasks: completedTasks,
      total_tasks: totalTasks,
      fully_completed: allCompleted,
      message: 'Task updated successfully'
    })

  } catch (error: any) {
    console.error('Error updating workflow task:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update workflow task',
      details: error.message
    }, { status: 500 })
  }
}
