import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST() {
  try {
    // Create demo workflow template using correct table name
    const { data: template, error: templateError } = await supabase
      .from('workflow_templates')
      .upsert({
        id: 'opening-checklist-foh',
        name: 'FOH Opening Checklist',
        description: 'Complete all front-of-house opening procedures',
        category: 'foh_opening',
        estimated_duration_minutes: 45,
        is_active: true
      })
      .select()
      .single()

    if (templateError) throw templateError

    // Create demo tasks with photo and note requirements using correct field names
    const demoTasks = [
      {
        id: 'task-unlock-doors',
        template_id: 'opening-checklist-foh',
        title: 'Unlock entrance doors',
        description: 'Unlock main entrance and emergency exits. Take photo to verify all doors are properly unlocked.',
        order_index: 1,
        is_required: true,
        requires_photo: true,
        requires_notes: false,
        estimated_minutes: 5
      },
      {
        id: 'task-pos-setup',
        template_id: 'opening-checklist-foh',
        title: 'Set up POS system',
        description: 'Boot up point-of-sale terminals and verify connectivity. Photo and notes required for verification.',
        order_index: 2,
        is_required: true,
        requires_photo: true,
        requires_notes: true,
        estimated_minutes: 8
      },
      {
        id: 'task-table-setup',
        template_id: 'opening-checklist-foh',
        title: 'Arrange tables and chairs',
        description: 'Set up dining area with proper table spacing and chair alignment. Photo required to document setup.',
        order_index: 3,
        is_required: true,
        requires_photo: true,
        requires_notes: false,
        estimated_minutes: 15
      },
      {
        id: 'task-condiment-station',
        template_id: 'opening-checklist-foh',
        title: 'Stock condiment station',
        description: 'Refill napkins, utensils, sauces, and condiments. Photo and notes required.',
        order_index: 4,
        is_required: false,
        requires_photo: true,
        requires_notes: true,
        estimated_minutes: 10
      }
    ]

    const { data: tasks, error: tasksError } = await supabase
      .from('workflow_tasks')
      .upsert(demoTasks)

    if (tasksError) throw tasksError

    return Response.json({
      success: true,
      message: 'Demo workflow template and tasks created successfully',
      template,
      tasks: demoTasks.length
    })

  } catch (error) {
    console.error('Error creating demo workflow:', error)
    return Response.json(
      { 
        error: 'Failed to create demo workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}