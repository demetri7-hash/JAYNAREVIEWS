import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Setting up complete workflow system...');

    // 1. Create workflow_templates table
    const { error: templatesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS workflow_templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          checklist_title VARCHAR(255) NOT NULL,
          checklist_description TEXT,
          department VARCHAR(100),
          estimated_duration INTEGER DEFAULT 30,
          is_active BOOLEAN DEFAULT true,
          language VARCHAR(5) DEFAULT 'en',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS workflow_tasks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          workflow_template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
          task_title VARCHAR(255) NOT NULL,
          task_description TEXT,
          sort_order INTEGER DEFAULT 1,
          estimated_duration INTEGER DEFAULT 5,
          section VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS workflow_role_assignments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          workflow_template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
          role_name VARCHAR(100) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS workflow_instances (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          workflow_template_id UUID REFERENCES workflow_templates(id),
          checklist_title VARCHAR(255) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          due_date TIMESTAMP WITH TIME ZONE,
          assigned_to_email VARCHAR(255),
          assigned_by_email VARCHAR(255),
          assigned_by_name VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS workflow_task_instances (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
          task_title VARCHAR(255) NOT NULL,
          task_description TEXT,
          sort_order INTEGER DEFAULT 1,
          status VARCHAR(50) DEFAULT 'pending',
          completed_at TIMESTAMP WITH TIME ZONE,
          completed_by VARCHAR(255),
          notes TEXT,
          photo_url TEXT,
          estimated_duration INTEGER DEFAULT 5,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_workflow_instances_assigned_to ON workflow_instances(assigned_to_email);
        CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON workflow_instances(status);
        CREATE INDEX IF NOT EXISTS idx_workflow_task_instances_workflow ON workflow_task_instances(workflow_instance_id);
        CREATE INDEX IF NOT EXISTS idx_workflow_task_instances_status ON workflow_task_instances(status);
      `
    });

    if (templatesError) {
      console.error('Templates table error:', templatesError);
    }

    // 2. Create some sample workflow templates
    const sampleTemplates = [
      {
        checklist_title: 'Restaurant Opening Checklist',
        checklist_description: 'Complete morning opening procedures',
        department: 'Front of House',
        estimated_duration: 45,
        tasks: [
          { task_title: 'Unlock front doors', task_description: 'Open restaurant for business', sort_order: 1 },
          { task_title: 'Turn on lights', task_description: 'Illuminate dining area', sort_order: 2 },
          { task_title: 'Set up tables', task_description: 'Arrange tables and chairs', sort_order: 3 },
          { task_title: 'Check restrooms', task_description: 'Verify cleanliness and supplies', sort_order: 4 },
          { task_title: 'Start POS system', task_description: 'Boot up point of sale terminals', sort_order: 5 }
        ],
        roles: ['Server', 'Host', 'Manager']
      },
      {
        checklist_title: 'Kitchen Prep Checklist',
        checklist_description: 'Daily kitchen preparation tasks',
        department: 'Back of House', 
        estimated_duration: 90,
        tasks: [
          { task_title: 'Check ingredient inventory', task_description: 'Verify all ingredients are stocked', sort_order: 1 },
          { task_title: 'Prep vegetables', task_description: 'Cut and prepare fresh vegetables', sort_order: 2 },
          { task_title: 'Check equipment', task_description: 'Ensure all kitchen equipment is working', sort_order: 3 },
          { task_title: 'Prepare sauces', task_description: 'Make fresh sauces and dressings', sort_order: 4 },
          { task_title: 'Set up grill', task_description: 'Heat and clean cooking surfaces', sort_order: 5 }
        ],
        roles: ['Prep Cook', 'Line Cook', 'Kitchen Manager']
      },
      {
        checklist_title: 'Closing Checklist',
        checklist_description: 'End of day closing procedures', 
        department: 'All',
        estimated_duration: 60,
        tasks: [
          { task_title: 'Clean all surfaces', task_description: 'Sanitize work areas and dining tables', sort_order: 1 },
          { task_title: 'Count register', task_description: 'Balance cash register and record sales', sort_order: 2 },
          { task_title: 'Lock doors', task_description: 'Secure all entrances', sort_order: 3 },
          { task_title: 'Turn off equipment', task_description: 'Shut down all appliances and systems', sort_order: 4 },
          { task_title: 'Set alarm', task_description: 'Activate security system', sort_order: 5 }
        ],
        roles: ['Manager', 'Server', 'Prep Cook']
      }
    ];

    for (const template of sampleTemplates) {
      // Insert template
      const { data: workflowTemplate, error: templateError } = await supabase
        .from('workflow_templates')
        .insert({
          checklist_title: template.checklist_title,
          checklist_description: template.checklist_description,
          department: template.department,
          estimated_duration: template.estimated_duration
        })
        .select()
        .single();

      if (templateError) {
        console.error('Template insert error:', templateError);
        continue;
      }

      // Insert tasks
      const tasksToInsert = template.tasks.map(task => ({
        ...task,
        workflow_template_id: workflowTemplate.id,
        estimated_duration: Math.ceil(template.estimated_duration / template.tasks.length)
      }));

      const { error: tasksError } = await supabase
        .from('workflow_tasks')
        .insert(tasksToInsert);

      if (tasksError) {
        console.error('Tasks insert error:', tasksError);
      }

      // Insert role assignments
      for (const role of template.roles) {
        const { error: roleError } = await supabase
          .from('workflow_role_assignments')
          .insert({
            workflow_template_id: workflowTemplate.id,
            role_name: role
          });

        if (roleError) {
          console.error('Role assignment error:', roleError);
        }
      }
    }

    // 3. Create a sample workflow instance for the current user
    const { data: employee } = await supabase
      .from('employees')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (employee) {
      // Get a template to create an instance from
      const { data: template } = await supabase
        .from('workflow_templates')
        .select('*, workflow_tasks(*)')
        .eq('checklist_title', 'Restaurant Opening Checklist')
        .single();

      if (template) {
        // Create workflow instance
        const { data: instance, error: instanceError } = await supabase
          .from('workflow_instances')
          .insert({
            workflow_template_id: template.id,
            checklist_title: template.checklist_title,
            status: 'in_progress',
            assigned_to_email: session.user.email,
            assigned_by_email: session.user.email,
            assigned_by_name: session.user.name || 'System',
            due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Due tomorrow
          })
          .select()
          .single();

        if (instance && !instanceError) {
          // Create task instances
          const taskInstances = template.workflow_tasks.map((task: any) => ({
            workflow_instance_id: instance.id,
            task_title: task.task_title,
            task_description: task.task_description,
            sort_order: task.sort_order,
            estimated_duration: task.estimated_duration,
            status: 'pending'
          }));

          const { error: taskInstancesError } = await supabase
            .from('workflow_task_instances')
            .insert(taskInstances);

          if (taskInstancesError) {
            console.error('Task instances error:', taskInstancesError);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Workflow system setup complete!',
      details: {
        templates_created: sampleTemplates.length,
        sample_instance_created: true,
        tables_created: [
          'workflow_templates',
          'workflow_tasks', 
          'workflow_role_assignments',
          'workflow_instances',
          'workflow_task_instances'
        ]
      }
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup workflow system', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}