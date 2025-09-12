import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request (in production, add proper auth)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    console.log(`Running recurring workflow cron job at ${now.toISOString()}`);

    // Find workflows that should be assigned now
    const { data: workflowsToAssign, error: fetchError } = await supabase
      .from('recurring_workflows')
      .select(`
        *,
        workflow_templates (
          id,
          name,
          description,
          estimated_duration
        )
      `)
      .eq('is_active', true)
      .lte('next_assignment', now.toISOString());

    if (fetchError) {
      console.error('Error fetching workflows to assign:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
    }

    let assignedCount = 0;
    const results = [];

    for (const workflow of workflowsToAssign || []) {
      try {
        // Create workflow instances for each assigned employee
        for (const employeeEmail of workflow.assigned_to) {
          // Get employee details
          const { data: employee } = await supabase
            .from('employees')
            .select('id, name')
            .eq('email', employeeEmail)
            .single();

          if (!employee) {
            console.warn(`Employee not found: ${employeeEmail}`);
            continue;
          }

          // Create workflow instance
          const { data: instance, error: instanceError } = await supabase
            .from('workflow_instances')
            .insert({
              checklist_title: `${workflow.workflow_templates.name} - ${new Date().toLocaleDateString()}`,
              assigned_to: employee.id,
              assigned_to_name: employee.name,
              assigned_by: workflow.assigned_by,
              assigned_by_name: workflow.assigned_by_name,
              status: 'pending',
              due_date: calculateDueDate(workflow.recurrence_pattern, workflow.recurrence_config),
              created_at: now.toISOString(),
              recurring_workflow_id: workflow.id
            })
            .select()
            .single();

          if (instanceError) {
            console.error('Error creating workflow instance:', instanceError);
            continue;
          }

          // Get template tasks and create task instances
          const { data: templateTasks } = await supabase
            .from('workflow_template_tasks')
            .select('*')
            .eq('template_id', workflow.template_id)
            .order('sort_order');

          if (templateTasks) {
            const taskInserts = templateTasks.map(task => ({
              workflow_instance_id: instance.id,
              task_title: task.task_title,
              task_description: task.task_description,
              sort_order: task.sort_order,
              status: 'pending',
              estimated_duration: task.estimated_duration,
              created_at: now.toISOString()
            }));

            await supabase
              .from('task_instances')
              .insert(taskInserts);
          }

          assignedCount++;
        }

        // Update the next assignment date
        const nextAssignment = calculateNextAssignment(
          workflow.recurrence_pattern, 
          workflow.recurrence_config
        );

        await supabase
          .from('recurring_workflows')
          .update({
            next_assignment: nextAssignment.toISOString(),
            last_assigned: now.toISOString()
          })
          .eq('id', workflow.id);

        results.push({
          workflowId: workflow.id,
          workflowName: workflow.workflow_templates.name,
          assignedTo: workflow.assigned_to.length,
          nextAssignment: nextAssignment.toISOString()
        });

      } catch (error) {
        console.error(`Error processing workflow ${workflow.id}:`, error);
        results.push({
          workflowId: workflow.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`Cron job completed. Assigned ${assignedCount} workflows.`);

    return NextResponse.json({
      success: true,
      assignedCount,
      processedWorkflows: workflowsToAssign?.length || 0,
      results
    });

  } catch (error) {
    console.error('Recurring workflow cron job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateNextAssignment(pattern: string, config: any): Date {
  const now = new Date();
  const next = new Date();
  const frequency = config.frequency || 1;
  const time = config.time || '09:00';
  
  // Set the time
  const [hours, minutes] = time.split(':');
  next.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  switch (pattern) {
    case 'daily':
      next.setDate(now.getDate() + frequency);
      break;
      
    case 'weekly':
      const daysOfWeek: number[] = config.daysOfWeek || [now.getDay()];
      const currentDay = now.getDay();
      
      // Find the next occurrence
      let nextDay = daysOfWeek.find((day: number) => day > currentDay);
      if (!nextDay) {
        nextDay = daysOfWeek[0];
        next.setDate(now.getDate() + (7 * frequency) - currentDay + nextDay);
      } else {
        next.setDate(now.getDate() + (nextDay - currentDay));
      }
      break;
      
    case 'monthly':
      const dayOfMonth = config.dayOfMonth || 1;
      next.setMonth(now.getMonth() + frequency);
      next.setDate(dayOfMonth);
      
      // If the date doesn't exist (e.g., Feb 31), move to last day of month
      if (next.getDate() !== dayOfMonth) {
        next.setDate(0); // Go to last day of previous month
      }
      break;
  }

  // If the calculated time is in the past, add one period
  if (next <= now) {
    return calculateNextAssignment(pattern, { ...config, frequency: frequency + 1 });
  }

  return next;
}

function calculateDueDate(pattern: string, config: any): string {
  const assignmentDate = new Date();
  const dueDate = new Date();
  
  // Set due date based on pattern - give reasonable time to complete
  switch (pattern) {
    case 'daily':
      dueDate.setDate(assignmentDate.getDate() + 1);
      dueDate.setHours(23, 59, 0, 0); // End of day
      break;
      
    case 'weekly':
      dueDate.setDate(assignmentDate.getDate() + 7);
      dueDate.setHours(23, 59, 0, 0);
      break;
      
    case 'monthly':
      dueDate.setMonth(assignmentDate.getMonth() + 1);
      dueDate.setHours(23, 59, 0, 0);
      break;
  }
  
  return dueDate.toISOString();
}
