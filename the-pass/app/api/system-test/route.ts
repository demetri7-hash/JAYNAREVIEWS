import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    console.log('🔍 Running comprehensive system test...')
    
    // Test 1: Database Tables
    const { data: workflows, error: workflowsError } = await supabase
      .from('workflows')
      .select('*')
    
    const { data: checklists, error: checklistsError } = await supabase
      .from('checklists')
      .select('*')
    
    const { data: taskInstances, error: tasksError } = await supabase
      .from('task_instances')
      .select('*')
    
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')

    // Test 2: Count statistics
    const workflowCount = workflows?.length || 0
    const checklistCount = checklists?.length || 0
    const taskCount = taskInstances?.length || 0
    const employeeCount = employees?.length || 0

    // Test 3: Active/Pending workflows
    const activeWorkflows = workflows?.filter(w => w.status === 'in-progress')?.length || 0
    const pendingTasks = taskInstances?.filter(t => t.status === 'pending')?.length || 0
    const completedTasks = taskInstances?.filter(t => t.status === 'completed')?.length || 0

    // Test 4: Department breakdown
    const fohWorkflows = workflows?.filter(w => 
      checklists?.find(c => c.id === w.checklist_id)?.department === 'FOH'
    )?.length || 0
    
    const bohWorkflows = workflows?.filter(w => 
      checklists?.find(c => c.id === w.checklist_id)?.department === 'BOH'
    )?.length || 0

    // Test 5: Manager assignments
    const manager = employees?.find(e => e.role === 'manager')
    const managerWorkflows = workflows?.filter(w => w.assigned_to === manager?.id)?.length || 0

    // Test 6: Sample checklist details
    const sampleChecklists = checklists?.slice(0, 3).map(c => ({
      name: c.name,
      department: c.department,
      category: c.category,
      task_count: taskInstances?.filter(t => 
        workflows?.find(w => w.id === t.workflow_id)?.checklist_id === c.id
      )?.length || 0
    }))

    const testResults = {
      success: true,
      timestamp: new Date().toISOString(),
      database_status: {
        workflows_accessible: !workflowsError,
        checklists_accessible: !checklistsError,
        tasks_accessible: !tasksError,
        employees_accessible: !employeesError
      },
      system_counts: {
        total_workflows: workflowCount,
        total_checklists: checklistCount,
        total_tasks: taskCount,
        total_employees: employeeCount
      },
      workflow_status: {
        active_workflows: activeWorkflows,
        pending_tasks: pendingTasks,
        completed_tasks: completedTasks
      },
      department_breakdown: {
        foh_workflows: fohWorkflows,
        boh_workflows: bohWorkflows
      },
      management: {
        manager_exists: !!manager,
        manager_email: manager?.email,
        manager_workflows: managerWorkflows
      },
      sample_checklists: sampleChecklists,
      errors: [
        workflowsError?.message,
        checklistsError?.message,
        tasksError?.message,
        employeesError?.message
      ].filter(Boolean)
    }

    console.log('✅ System test completed:', testResults)
    
    return Response.json(testResults)
    
  } catch (error) {
    console.error('❌ System test failed:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}