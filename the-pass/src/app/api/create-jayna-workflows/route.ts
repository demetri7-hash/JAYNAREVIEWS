import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    console.log('Creating Jayna Gyro workflows...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Define workflows using the table structure the existing system expects
    const jaynaWorkflows = [
      {
        checklist_title: 'FOH Opening Checklist',
        checklist_description: 'Front of House morning opening procedures',
        department: 'FOH',
        estimated_duration: 45,
        tasks: [
          { task_title: 'Wipe table sides, legs, chairs, and banquette sofas', task_description: 'Deep clean seating areas', sort_order: 1 },
          { task_title: 'Place lamps on tables, hide charging cables', task_description: 'Set up table decorations', sort_order: 2 },
          { task_title: '"Salt to the Street" - position condiments', task_description: 'Salt toward parking lot, pepper toward kitchen', sort_order: 3 },
          { task_title: 'Wipe and dry menus - remove stickiness', task_description: 'Clean all menus thoroughly', sort_order: 4 },
          { task_title: 'Turn on all dining room lights', task_description: 'Illuminate the dining area', sort_order: 5 },
          { task_title: 'Unlock doors and flip signs to OPEN', task_description: 'Open restaurant for business', sort_order: 6 },
          { task_title: 'Check and refill all rollups (napkin + silverware)', task_description: 'Restock table settings', sort_order: 7 },
          { task_title: 'Wipe patio tables and barstools', task_description: 'Clean outdoor seating', sort_order: 8 },
          { task_title: 'Raise blinds', task_description: 'Open window coverings', sort_order: 9 }
        ]
      },
      {
        checklist_title: 'FOH Closing Checklist',
        checklist_description: 'Front of House end-of-day procedures',
        department: 'FOH',
        estimated_duration: 60,
        tasks: [
          { task_title: 'Clean all dining tables and chairs', task_description: 'Sanitize all seating surfaces', sort_order: 1 },
          { task_title: 'Sweep and mop dining room floor', task_description: 'Complete floor cleaning', sort_order: 2 },
          { task_title: 'Clean and sanitize condiment stations', task_description: 'Wipe down condiment areas', sort_order: 3 },
          { task_title: 'Count and secure register', task_description: 'Balance cash and lock up money', sort_order: 4 },
          { task_title: 'Turn off all lights except security', task_description: 'Shut down lighting systems', sort_order: 5 },
          { task_title: 'Lock all doors and set alarm', task_description: 'Secure the building', sort_order: 6 },
          { task_title: 'Take out trash and recycling', task_description: 'Empty all waste containers', sort_order: 7 },
          { task_title: 'Stack chairs and clean under tables', task_description: 'Prepare for overnight cleaning', sort_order: 8 }
        ]
      },
      {
        checklist_title: 'Kitchen Opening Prep',
        checklist_description: 'Back of house morning preparation',
        department: 'BOH',
        estimated_duration: 90,
        tasks: [
          { task_title: 'Check walk-in refrigerator temperature', task_description: 'Verify coolers at proper temp', sort_order: 1 },
          { task_title: 'Review labels and dates on all items', task_description: 'Check food safety dates', sort_order: 2 },
          { task_title: 'Inspect prep areas for cleanliness', task_description: 'Ensure work stations are clean', sort_order: 3 },
          { task_title: 'Check prep list from previous night', task_description: 'Review outstanding prep tasks', sort_order: 4 },
          { task_title: 'Prep vegetables and garnishes', task_description: 'Cut and prepare fresh ingredients', sort_order: 5 },
          { task_title: 'Prepare sauces and dressings', task_description: 'Make fresh condiments', sort_order: 6 },
          { task_title: 'Set up grill and cooking stations', task_description: 'Prepare cooking equipment', sort_order: 7 },
          { task_title: 'Check inventory levels', task_description: 'Verify ingredient stock', sort_order: 8 },
          { task_title: 'Prepare protein portions', task_description: 'Portion meat and proteins', sort_order: 9 },
          { task_title: 'Test equipment temperatures', task_description: 'Verify equipment working', sort_order: 10 }
        ]
      },
      {
        checklist_title: 'Bar Closing Duties',
        checklist_description: 'Bar equipment and area closing procedures',
        department: 'BOH',
        estimated_duration: 45,
        tasks: [
          { task_title: 'Send floor mat to dishwasher', task_description: 'Remove and clean bar mats', sort_order: 1 },
          { task_title: 'Sanitize bar mats and burn well', task_description: 'Deep clean bar tools area', sort_order: 2 },
          { task_title: 'Clean soft serve machine', task_description: 'Clean ice cream equipment', sort_order: 3 },
          { task_title: 'Empty rimmer and send to dish', task_description: 'Clean glass rimming station', sort_order: 4 },
          { task_title: 'Switch off glass washer', task_description: 'Shut down glass washing equipment', sort_order: 5 },
          { task_title: 'Clean glass washer catch tray', task_description: 'Remove and clean drain tray', sort_order: 6 },
          { task_title: 'Wipe down all bar surfaces', task_description: 'Clean and sanitize bar top', sort_order: 7 },
          { task_title: 'Stock and organize bar supplies', task_description: 'Restock for next service', sort_order: 8 }
        ]
      },
      {
        checklist_title: 'Daily Inventory Check',
        checklist_description: 'Daily stock and supply verification',
        department: 'BOH',
        estimated_duration: 30,
        tasks: [
          { task_title: 'Check dry goods storage', task_description: 'Verify dry ingredient levels', sort_order: 1 },
          { task_title: 'Count protein inventory', task_description: 'Check meat and protein stock', sort_order: 2 },
          { task_title: 'Verify produce freshness', task_description: 'Inspect vegetables and fruits', sort_order: 3 },
          { task_title: 'Check beverage stock', task_description: 'Count drinks and bar supplies', sort_order: 4 },
          { task_title: 'Note missing ingredients', task_description: 'Document items needing reorder', sort_order: 5 },
          { task_title: 'Update inventory tracking', task_description: 'Record counts in system', sort_order: 6 },
          { task_title: 'Check cleaning supplies', task_description: 'Verify sanitizer stock', sort_order: 7 },
          { task_title: 'Review waste and usage', task_description: 'Track food waste', sort_order: 8 }
        ]
      },
      {
        checklist_title: 'Cleaning Opening Protocol',
        checklist_description: 'Morning sanitation and cleaning tasks',
        department: 'BOH',
        estimated_duration: 60,
        tasks: [
          { task_title: 'Sanitize food contact surfaces', task_description: 'Clean prep areas and cutting boards', sort_order: 1 },
          { task_title: 'Wipe down equipment exteriors', task_description: 'Clean all appliance surfaces', sort_order: 2 },
          { task_title: 'Check and refill sanitizer buckets', task_description: 'Prepare cleaning solutions', sort_order: 3 },
          { task_title: 'Clean and stock restrooms', task_description: 'Sanitize bathrooms and restock', sort_order: 4 },
          { task_title: 'Sweep and mop kitchen floors', task_description: 'Clean all floor areas', sort_order: 5 },
          { task_title: 'Empty trash and replace liners', task_description: 'Clean waste areas', sort_order: 6 },
          { task_title: 'Wipe down dining area surfaces', task_description: 'Clean customer areas', sort_order: 7 },
          { task_title: 'Check and restock paper products', task_description: 'Refill dispensers', sort_order: 8 }
        ]
      }
    ];

    // Get manager employee for assignments
    const { data: managerEmployee } = await supabase
      .from('employees')
      .select('id')
      .eq('email', 'manager@jaynagyro.com')
      .single();

    if (!managerEmployee) {
      return NextResponse.json({
        error: 'Manager employee not found. Please run database setup first.',
        hint: 'Make sure to run the setup-database.sql script in Supabase'
      }, { status: 400 });
    }

    const results = [];

    for (const workflow of jaynaWorkflows) {
      try {
        // Create checklist
        const { data: checklist, error: checklistError } = await supabase
          .from('checklists')
          .insert({
            name: workflow.checklist_title,
            description: workflow.checklist_description,
            category: workflow.department,
            department: workflow.department,
            estimated_duration: workflow.estimated_duration,
            is_active: true
          })
          .select()
          .single();

        if (checklistError) {
          throw new Error(`Error creating checklist: ${checklistError.message}`);
        }

        // Create workflow instance
        const { data: workflowInstance, error: workflowError } = await supabase
          .from('workflows')
          .insert({
            name: workflow.checklist_title,
            checklist_id: checklist.id,
            assigned_to: managerEmployee.id,
            assigned_by: managerEmployee.id,
            status: 'assigned',
            due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();

        if (workflowError) {
          throw new Error(`Error creating workflow: ${workflowError.message}`);
        }

        // Create task instances
        const tasksToInsert = workflow.tasks.map(task => ({
          workflow_id: workflowInstance.id,
          title: task.task_title,
          description: task.task_description,
          status: 'pending',
          assigned_to: managerEmployee.id,
          sort_order: task.sort_order,
          estimated_duration: Math.ceil(workflow.estimated_duration / workflow.tasks.length)
        }));

        const { error: tasksError } = await supabase
          .from('task_instances')
          .insert(tasksToInsert);

        if (tasksError) {
          throw new Error(`Error creating tasks: ${tasksError.message}`);
        }

        results.push({
          success: true,
          workflow: workflow.checklist_title,
          tasks: workflow.tasks.length
        });

      } catch (error) {
        results.push({
          success: false,
          workflow: workflow.checklist_title,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalTasks = results.reduce((sum, r) => sum + ('tasks' in r ? r.tasks || 0 : 0), 0);

    return NextResponse.json({
      success: true,
      message: `Successfully created ${successCount} Jayna Gyro workflows with ${totalTasks} total tasks`,
      results,
      summary: {
        workflows_created: successCount,
        total_tasks: totalTasks,
        departments: ['FOH', 'BOH'],
        ready_for_use: true
      }
    });

  } catch (error) {
    console.error('Workflow creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create workflows', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}