import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Allow workflow creation without authentication during setup
    console.log('Creating Jayna Gyro workflows (no auth required for setup)...');

    // First, check if tables exist and proceed with workflow creation
    console.log('Checking database tables...');
    
    // Skip table creation for now and proceed with workflow creation
    // Tables should be created through Supabase dashboard or migrations

    // Define Jayna Gyro workflows based on the reference files
    const jaynaWorkflows = [
      {
        checklist_title: 'FOH Opening Checklist',
        checklist_description: 'Front of House morning opening procedures',
        department: 'Front of House',
        estimated_duration: 45,
        language: 'en',
        tasks: [
          { task_title: 'Remove chairs and re-wipe all tables', task_description: 'Clean and arrange dining area', sort_order: 1 },
          { task_title: 'Wipe table sides, legs, chairs, and banquette sofas', task_description: 'Deep clean seating areas', sort_order: 2 },
          { task_title: 'Place lamps on tables, hide charging cables', task_description: 'Set up table decorations and power', sort_order: 3 },
          { task_title: '"Salt to the Street" - position condiments', task_description: 'Salt shakers toward parking lot, pepper toward kitchen', sort_order: 4 },
          { task_title: 'Wipe and dry menus - remove stickiness', task_description: 'Clean all menus thoroughly', sort_order: 5 },
          { task_title: 'Turn on all dining room lights', task_description: 'Illuminate the dining area', sort_order: 6 },
          { task_title: 'Unlock doors and flip signs to OPEN', task_description: 'Open restaurant for business', sort_order: 7 },
          { task_title: 'Check and refill all rollups (napkin + silverware)', task_description: 'Restock table settings', sort_order: 8 },
          { task_title: 'Wipe patio tables and barstools', task_description: 'Clean outdoor seating', sort_order: 9 },
          { task_title: 'Raise blinds', task_description: 'Open window coverings', sort_order: 10 },
          { task_title: 'Windex front doors', task_description: 'Clean entrance glass', sort_order: 11 },
          { task_title: 'Wipe down front of registers', task_description: 'Clean POS area', sort_order: 12 },
          { task_title: 'Verify bathroom cleanliness', task_description: 'Check restrooms are clean and stocked', sort_order: 13 }
        ],
        roles: ['Server', 'Host', 'Cashier']
      },
      {
        checklist_title: 'FOH Closing Checklist',
        checklist_description: 'Front of House end-of-day procedures',
        department: 'Front of House',
        estimated_duration: 60,
        language: 'en',
        tasks: [
          { task_title: 'Clean all dining tables and chairs', task_description: 'Sanitize all seating surfaces', sort_order: 1 },
          { task_title: 'Sweep and mop dining room floor', task_description: 'Complete floor cleaning', sort_order: 2 },
          { task_title: 'Clean and sanitize condiment stations', task_description: 'Wipe down all condiment areas', sort_order: 3 },
          { task_title: 'Count and secure register', task_description: 'Balance cash and lock up money', sort_order: 4 },
          { task_title: 'Turn off all lights except security', task_description: 'Shut down lighting systems', sort_order: 5 },
          { task_title: 'Lock all doors and set alarm', task_description: 'Secure the building', sort_order: 6 },
          { task_title: 'Take out trash and recycling', task_description: 'Empty all waste containers', sort_order: 7 },
          { task_title: 'Stack chairs and clean under tables', task_description: 'Prepare for overnight cleaning', sort_order: 8 }
        ],
        roles: ['Server', 'Host', 'Manager']
      },
      {
        checklist_title: 'Kitchen Opening Prep',
        checklist_description: 'Back of house morning preparation',
        department: 'Back of House',
        estimated_duration: 90,
        language: 'en',
        tasks: [
          { task_title: 'Check walk-in refrigerator temperature', task_description: 'Verify all coolers are at proper temp', sort_order: 1 },
          { task_title: 'Review labels and dates on all items', task_description: 'Check food safety dates and labeling', sort_order: 2 },
          { task_title: 'Inspect prep areas for cleanliness', task_description: 'Ensure work stations are clean', sort_order: 3 },
          { task_title: 'Check prep list from previous night', task_description: 'Review outstanding prep tasks', sort_order: 4 },
          { task_title: 'Prep vegetables and garnishes', task_description: 'Cut and prepare fresh ingredients', sort_order: 5 },
          { task_title: 'Prepare sauces and dressings', task_description: 'Make fresh condiments', sort_order: 6 },
          { task_title: 'Set up grill and cooking stations', task_description: 'Prepare all cooking equipment', sort_order: 7 },
          { task_title: 'Check inventory levels', task_description: 'Verify ingredient stock', sort_order: 8 },
          { task_title: 'Prepare protein portions', task_description: 'Portion and prep meat and proteins', sort_order: 9 }
        ],
        roles: ['Prep Cook', 'Line Cook', 'Kitchen Manager']
      },
      {
        checklist_title: 'Bar Closing Duties',
        checklist_description: 'Bar equipment and area closing procedures',
        department: 'Bar',
        estimated_duration: 45,
        language: 'en',
        tasks: [
          { task_title: 'Send floor mat to dishwasher', task_description: 'Remove and clean bar mats', sort_order: 1 },
          { task_title: 'Sanitize and clean all bar mats and burn well', task_description: 'Deep clean bar tools area', sort_order: 2 },
          { task_title: 'Wipe down soft serve machine and send tray to dish', task_description: 'Clean ice cream equipment', sort_order: 3 },
          { task_title: 'Empty rimmer weekly and send to dish', task_description: 'Clean glass rimming station', sort_order: 4 },
          { task_title: 'Pull drain plug and switch off glass washer', task_description: 'Shut down glass washing equipment', sort_order: 5 },
          { task_title: 'Clean glass washer catch tray', task_description: 'Remove and clean drain tray', sort_order: 6 },
          { task_title: 'Wipe down all bar surfaces', task_description: 'Clean and sanitize bar top', sort_order: 7 },
          { task_title: 'Stock and organize bar supplies', task_description: 'Restock for next service', sort_order: 8 }
        ],
        roles: ['Bartender', 'Server']
      },
      {
        checklist_title: 'Daily Inventory Check',
        checklist_description: 'Daily stock and supply verification',
        department: 'Management',
        estimated_duration: 30,
        language: 'en',
        tasks: [
          { task_title: 'Check dry goods storage', task_description: 'Verify dry ingredient levels', sort_order: 1 },
          { task_title: 'Count protein inventory', task_description: 'Check meat and protein stock', sort_order: 2 },
          { task_title: 'Verify produce freshness', task_description: 'Inspect vegetables and fruits', sort_order: 3 },
          { task_title: 'Check beverage stock', task_description: 'Count drinks and bar supplies', sort_order: 4 },
          { task_title: 'Note missing ingredients', task_description: 'Document items needing reorder', sort_order: 5 },
          { task_title: 'Update inventory tracking', task_description: 'Record counts in system', sort_order: 6 }
        ],
        roles: ['Kitchen Manager', 'Manager']
      },
      {
        checklist_title: 'Cleaning Opening Protocol',
        checklist_description: 'Morning sanitation and cleaning tasks',
        department: 'All',
        estimated_duration: 60,
        language: 'en',
        tasks: [
          { task_title: 'Sanitize all food contact surfaces', task_description: 'Clean prep areas and cutting boards', sort_order: 1 },
          { task_title: 'Wipe down equipment exteriors', task_description: 'Clean all appliance surfaces', sort_order: 2 },
          { task_title: 'Check and refill sanitizer buckets', task_description: 'Prepare cleaning solutions', sort_order: 3 },
          { task_title: 'Clean and stock restrooms', task_description: 'Sanitize bathrooms and restock supplies', sort_order: 4 },
          { task_title: 'Sweep and mop kitchen floors', task_description: 'Clean all floor areas', sort_order: 5 },
          { task_title: 'Empty trash and replace liners', task_description: 'Clean waste management areas', sort_order: 6 },
          { task_title: 'Wipe down dining area surfaces', task_description: 'Clean customer areas', sort_order: 7 }
        ],
        roles: ['Cleaner', 'Prep Cook', 'All Staff']
      }
    ];

    const results = [];

    for (const workflow of jaynaWorkflows) {
      try {
        // Insert workflow template
        const { data: workflowTemplate, error: workflowError } = await supabase
          .from('workflow_templates')
          .insert({
            checklist_title: workflow.checklist_title,
            checklist_description: workflow.checklist_description,
            department: workflow.department,
            estimated_duration: workflow.estimated_duration,
            is_active: true,
            language: workflow.language
          })
          .select()
          .single();

        if (workflowError) {
          throw new Error(`Error creating workflow: ${workflowError.message}`);
        }

        // Insert tasks
        const tasksToInsert = workflow.tasks.map(task => ({
          ...task,
          workflow_template_id: workflowTemplate.id,
          estimated_duration: Math.ceil(workflow.estimated_duration / workflow.tasks.length)
        }));

        const { error: tasksError } = await supabase
          .from('workflow_tasks')
          .insert(tasksToInsert);

        if (tasksError) {
          throw new Error(`Error creating tasks: ${tasksError.message}`);
        }

        // Create role assignments
        for (const role of workflow.roles) {
          await supabase
            .from('workflow_role_assignments')
            .insert({
              workflow_template_id: workflowTemplate.id,
              role_name: role
            });
        }

        results.push({
          success: true,
          workflow: workflow.checklist_title,
          tasks: workflow.tasks.length,
          roles: workflow.roles
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
        departments: ['Front of House', 'Back of House', 'Bar', 'Management', 'All'],
        ready_for_use: true
      }
    });

  } catch (error) {
    console.error('Jayna workflow creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create Jayna workflows', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}