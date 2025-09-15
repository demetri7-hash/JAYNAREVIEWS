import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    console.log('🚀 Creating enhanced Jayna Gyro workflows with comprehensive reference file integration...')

    // Find or create manager employee for workflow assignment
    let { data: manager } = await supabase
      .from('employees')
      .select('*')
      .eq('role', 'manager')
      .single()

    if (!manager) {
      // Try to find the test manager we created
      const { data: testManager } = await supabase
        .from('employees')
        .select('*')
        .eq('email', 'manager@jaynagryo.test')
        .single()
      
      if (testManager) {
        manager = testManager
      } else {
        return NextResponse.json({
          success: false,
          error: 'No manager found. Please create a manager employee first via /api/setup-test-users'
        }, { status: 400 })
      }
    }

    // ENHANCED JAYNA GYRO WORKFLOWS WITH COMPREHENSIVE REFERENCE FILE INTEGRATION
    const enhancedWorkflows = [
      {
        checklist_title: 'FOH Transition Checklist',
        checklist_description: 'Front of house shift change procedures and handoff',
        department: 'FOH',
        estimated_duration: 20,
        tasks: [
          { task_title: 'Review previous shift notes and issues', task_description: 'Check handoff log for important information', sort_order: 1 },
          { task_title: 'Count register and verify starting cash', task_description: 'Document cash drawer amount', sort_order: 2 },
          { task_title: 'Check dining room cleanliness and organization', task_description: 'Assess condition from previous shift', sort_order: 3 },
          { task_title: 'Test POS system and card readers', task_description: 'Ensure payment systems are functional', sort_order: 4 },
          { task_title: 'Review daily specials and menu changes', task_description: 'Update staff on current offerings', sort_order: 5 },
          { task_title: 'Check supply levels (napkins, utensils, cups)', task_description: 'Restock as needed', sort_order: 6 },
          { task_title: 'Communicate any issues to incoming staff', task_description: 'Provide comprehensive handoff', sort_order: 7 }
        ]
      },
      {
        checklist_title: 'Missing Ingredients Report Protocol',
        checklist_description: 'System for reporting low or missing ingredients (TEXT TO 916-513-3192)',
        department: 'BOH',
        estimated_duration: 15,
        tasks: [
          { task_title: 'Identify missing or low ingredient', task_description: 'Check quantity and assess shortage severity', sort_order: 1 },
          { task_title: 'Determine quantity needed for service', task_description: 'Calculate amount needed until next delivery', sort_order: 2 },
          { task_title: 'Assess urgency level (LOW/MED/HIGH)', task_description: 'Determine impact on service capability', sort_order: 3 },
          { task_title: 'Document reason for shortage', task_description: 'Note if due to unexpected demand, spoilage, etc.', sort_order: 4 },
          { task_title: 'Fill out missing ingredients form', task_description: 'Complete all required fields on report', sort_order: 5 },
          { task_title: 'Text photo to Kitchen Manager (916-513-3192)', task_description: 'Send immediate notification for urgent items', sort_order: 6 },
          { task_title: 'Hand physical form to Kitchen Manager', task_description: 'Ensure manager receives detailed report', sort_order: 7 },
          { task_title: 'Follow up on resolution status', task_description: 'Verify issue was addressed and order placed', sort_order: 8 }
        ]
      },
      {
        checklist_title: 'Dry Goods Inventory - Packaging & Supplies',
        checklist_description: 'Twice weekly inventory check (Wednesday & Sunday) for kitchen packaging',
        department: 'BOH',
        estimated_duration: 25,
        tasks: [
          { task_title: 'Count bowls and gyro bowl lids', task_description: 'Record quantity on hand for service containers', sort_order: 1 },
          { task_title: 'Check pita boxes, fry boxes, chicken boxes', task_description: 'Count all food packaging containers', sort_order: 2 },
          { task_title: 'Inventory soup cups (12 oz) and lids', task_description: 'Verify soup service supplies', sort_order: 3 },
          { task_title: 'Count ramekins (1.5 oz) and sauce containers', task_description: 'Check small portion containers', sort_order: 4 },
          { task_title: 'Check disposable utensils and napkins', task_description: 'Count forks, knives, spoons, napkins', sort_order: 5 },
          { task_title: 'Inventory cleaning supplies and chemicals', task_description: 'Check sanitizer, soap, cleaning products', sort_order: 6 },
          { task_title: 'Note damaged or defective items', task_description: 'Document any unusable inventory', sort_order: 7 },
          { task_title: 'Mark items needing reorder (Y/N)', task_description: 'Indicate which items to order', sort_order: 8 },
          { task_title: 'Submit completed form to Kitchen Manager', task_description: 'Ensure manager receives inventory report', sort_order: 9 }
        ]
      },
      {
        checklist_title: 'Line Cook Performance Review',
        checklist_description: 'Daily assessment and feedback for line cook performance',
        department: 'BOH',
        estimated_duration: 15,
        tasks: [
          { task_title: 'Assess food preparation speed and efficiency', task_description: 'Rate performance from 1-5 scale', sort_order: 1 },
          { task_title: 'Review food quality and presentation standards', task_description: 'Check adherence to plating guidelines', sort_order: 2 },
          { task_title: 'Evaluate portion control consistency', task_description: 'Verify correct serving sizes', sort_order: 3 },
          { task_title: 'Check station cleanliness and organization', task_description: 'Assess work area maintenance', sort_order: 4 },
          { task_title: 'Review communication and teamwork', task_description: 'Evaluate collaboration with kitchen staff', sort_order: 5 },
          { task_title: 'Provide constructive feedback', task_description: 'Discuss areas for improvement', sort_order: 6 },
          { task_title: 'Document performance notes', task_description: 'Record observations for tracking', sort_order: 7 },
          { task_title: 'Set goals for next shift if needed', task_description: 'Establish improvement targets', sort_order: 8 }
        ]
      },
      {
        checklist_title: 'Kitchen Manager Daily Oversight',
        checklist_description: 'Comprehensive daily management tasks for kitchen operations',
        department: 'BOH',
        estimated_duration: 45,
        tasks: [
          { task_title: 'Review and approve daily prep assignments', task_description: 'Ensure proper task distribution', sort_order: 1 },
          { task_title: 'Check food safety temperatures and logs', task_description: 'Verify compliance with health standards', sort_order: 2 },
          { task_title: 'Inspect walk-in refrigerator organization', task_description: 'Check labeling, dates, and storage', sort_order: 3 },
          { task_title: 'Review inventory reports and place orders', task_description: 'Process missing ingredients and supplies', sort_order: 4 },
          { task_title: 'Conduct line cook performance reviews', task_description: 'Provide feedback and coaching', sort_order: 5 },
          { task_title: 'Check equipment functionality and maintenance', task_description: 'Ensure all kitchen equipment working', sort_order: 6 },
          { task_title: 'Review labor scheduling and coverage', task_description: 'Verify adequate staffing levels', sort_order: 7 },
          { task_title: 'Document daily operational notes', task_description: 'Record important information for next shift', sort_order: 8 },
          { task_title: 'Communicate with FOH manager on specials', task_description: 'Coordinate front and back of house', sort_order: 9 }
        ]
      },
      {
        checklist_title: 'Deep Cleaning Protocol - Weekly',
        checklist_description: 'Comprehensive weekly cleaning tasks beyond daily maintenance',
        department: 'BOH',
        estimated_duration: 90,
        tasks: [
          { task_title: 'Deep clean walk-in refrigerator', task_description: 'Remove all items, sanitize shelves and walls', sort_order: 1 },
          { task_title: 'Clean behind and under all equipment', task_description: 'Move equipment to access hidden areas', sort_order: 2 },
          { task_title: 'Sanitize all cutting boards and prep surfaces', task_description: 'Deep clean all food contact surfaces', sort_order: 3 },
          { task_title: 'Clean exhaust hood and filters', task_description: 'Remove grease buildup and sanitize', sort_order: 4 },
          { task_title: 'Deep clean fryer and change oil', task_description: 'Complete fryer maintenance and oil replacement', sort_order: 5 },
          { task_title: 'Sanitize all storage containers and lids', task_description: 'Clean and organize food storage', sort_order: 6 },
          { task_title: 'Clean floor drains and mats', task_description: 'Remove buildup and sanitize drainage', sort_order: 7 },
          { task_title: 'Organize and clean dry storage areas', task_description: 'Check dates and reorganize inventory', sort_order: 8 },
          { task_title: 'Document cleaning completion', task_description: 'Record tasks completed and any issues found', sort_order: 9 }
        ]
      }
    ]

    const results = []
    let totalTasks = 0

    for (const workflow of enhancedWorkflows) {
      try {
        // Create the checklist
        const { data: checklist, error: checklistError } = await supabase
          .from('checklists')
          .insert({
            name: workflow.checklist_title,
            description: workflow.checklist_description,
            department: workflow.department,
            category: 'enhanced',
            estimated_duration: workflow.estimated_duration,
            is_active: true
          })
          .select()
          .single()

        if (checklistError) {
          results.push({
            success: false,
            workflow: workflow.checklist_title,
            error: `Error creating checklist: ${checklistError.message}`
          })
          continue
        }

        // Create workflow instance
        const { data: workflowInstance, error: workflowError } = await supabase
          .from('workflows')
          .insert({
            name: `${workflow.checklist_title} - ${new Date().toLocaleDateString()}`,
            checklist_id: checklist.id,
            assigned_to: manager.id,
            assigned_by: manager.id,
            status: 'assigned'
          })
          .select()
          .single()

        if (workflowError) {
          results.push({
            success: false,
            workflow: workflow.checklist_title,
            error: `Error creating workflow: ${workflowError.message}`
          })
          continue
        }

        // Create task instances
        const taskInserts = workflow.tasks.map(task => ({
          workflow_id: workflowInstance.id,
          title: task.task_title,
          description: task.task_description,
          status: 'pending',
          assigned_to: manager.id,
          sort_order: task.sort_order
        }))

        const { error: tasksError } = await supabase
          .from('task_instances')
          .insert(taskInserts)

        if (tasksError) {
          results.push({
            success: false,
            workflow: workflow.checklist_title,
            error: `Error creating tasks: ${tasksError.message}`
          })
          continue
        }

        results.push({
          success: true,
          workflow: workflow.checklist_title,
          tasks: workflow.tasks.length
        })

        totalTasks += workflow.tasks.length

      } catch (error: any) {
        results.push({
          success: false,
          workflow: workflow.checklist_title,
          error: error.message
        })
      }
    }

    const successfulWorkflows = results.filter(r => r.success).length

    return NextResponse.json({
      success: true,
      message: `Successfully created ${successfulWorkflows} enhanced Jayna Gyro workflows with ${totalTasks} total tasks`,
      results,
      summary: {
        workflows_created: successfulWorkflows,
        total_tasks: totalTasks,
        departments: ['FOH', 'BOH'],
        ready_for_use: true,
        enhanced_features: [
          'Missing ingredients reporting protocol',
          'Dry goods inventory management',
          'Line cook performance reviews',
          'Kitchen manager oversight tasks',
          'Deep cleaning protocols'
        ]
      }
    })

  } catch (error: any) {
    console.error('Enhanced workflow creation error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}