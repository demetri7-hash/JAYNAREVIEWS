import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Workflow categories and their corresponding roles
const WORKFLOW_CATEGORIES = {
  'FOH_OPENING': { 
    roles: ['Server', 'Host', 'Cashier'], 
    department: 'Front of House',
    estimated_duration: 45 
  },
  'FOH_CLOSING': { 
    roles: ['Server', 'Host', 'Cashier'], 
    department: 'Front of House',
    estimated_duration: 60 
  },
  'FOH_TRANSITION': { 
    roles: ['Server', 'Host', 'Cashier'], 
    department: 'Front of House',
    estimated_duration: 30 
  },
  'BOH_OPENING': { 
    roles: ['Prep Cook', 'Line Cook', 'Kitchen Manager'], 
    department: 'Back of House',
    estimated_duration: 60 
  },
  'BOH_CLOSING': { 
    roles: ['Prep Cook', 'Line Cook', 'Kitchen Manager'], 
    department: 'Back of House',
    estimated_duration: 45 
  },
  'PREP_DAILY': { 
    roles: ['Prep Cook', 'Lead Prep Cook'], 
    department: 'Back of House',
    estimated_duration: 180 
  },
  'INVENTORY': { 
    roles: ['Kitchen Manager', 'Lead Prep Cook'], 
    department: 'Management',
    estimated_duration: 30 
  },
  'BAR': { 
    roles: ['Bartender', 'Server'], 
    department: 'Bar',
    estimated_duration: 30 
  },
  'CLEANING': { 
    roles: ['Cleaner', 'Prep Cook', 'Dishwasher'], 
    department: 'All',
    estimated_duration: 90 
  }
};

// File mapping to workflow categories
const FILE_MAPPINGS: Record<string, keyof typeof WORKFLOW_CATEGORIES> = {
  'FOH OPENING CHECKLIST.md': 'FOH_OPENING',
  'FOH CLOSING LIST.md': 'FOH_CLOSING', 
  'FOH TRANSITION CHECKLIST.md': 'FOH_TRANSITION',
  'CLEANING OPENING LIST.md': 'BOH_OPENING',
  'BAR CLOSING.md': 'BAR',
  'AM_Prep_Daily_Inventory.md': 'PREP_DAILY',
  'DRY GOODS INVENTORY PACKAGING.md': 'INVENTORY',
  'LEAD PREP WORKSHEET.md': 'PREP_DAILY',
  'MISSING INGREDIENTS.md': 'INVENTORY',
  'TO GO INVENTORY SHEET FOR KITCHEN.md': 'INVENTORY'
};

function parseMarkdownToTasks(markdownContent: string, filename: string) {
  const lines = markdownContent.split('\n');
  const tasks = [];
  let currentSection = '';
  let sortOrder = 1;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and titles
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      if (trimmedLine.startsWith('#')) {
        currentSection = trimmedLine.replace(/#+\s*/, '');
      }
      continue;
    }
    
    // Parse task items (lines that start with -, *, or numbers)
    if (trimmedLine.match(/^[-*]\s+/) || trimmedLine.match(/^\d+\.\s+/)) {
      let taskText = trimmedLine.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
      
      // Remove any checkbox syntax
      taskText = taskText.replace(/^\[[ x]\]\s*/, '');
      
      if (taskText.length > 0) {
        tasks.push({
          task_title: taskText.substring(0, 100), // Limit title length
          task_description: currentSection ? `${currentSection}: ${taskText}` : taskText,
          sort_order: sortOrder++,
          section: currentSection
        });
      }
    }
    
    // Also capture lines that might be tasks without bullet points
    else if (trimmedLine.length > 10 && !trimmedLine.includes(':') && currentSection) {
      tasks.push({
        task_title: trimmedLine.substring(0, 100),
        task_description: `${currentSection}: ${trimmedLine}`,
        sort_order: sortOrder++,
        section: currentSection
      });
    }
  }
  
  return tasks;
}

async function importWorkflow(filename: string, filePath: string, language = 'en') {
  console.log(`Processing: ${filename}`);
  
  // Read the markdown file
  const markdownContent = fs.readFileSync(filePath, 'utf-8');
  
  // Determine workflow category
  const category = FILE_MAPPINGS[filename] || 'CLEANING';
  const categoryInfo = WORKFLOW_CATEGORIES[category];
  
  // Parse tasks from markdown
  const tasks = parseMarkdownToTasks(markdownContent, filename);
  
  if (tasks.length === 0) {
    console.log(`No tasks found in ${filename}`);
    return { success: false, message: `No tasks found in ${filename}` };
  }
  
  // Create workflow title
  let workflowTitle = filename.replace('.md', '');
  if (language !== 'en') {
    workflowTitle += ` (${language.toUpperCase()})`;
  }
  
  // Insert workflow template
  const { data: workflow, error: workflowError } = await supabase
    .from('workflow_templates')
    .insert({
      checklist_title: workflowTitle,
      checklist_description: `Imported from ${filename} - ${categoryInfo.department}`,
      department: categoryInfo.department,
      estimated_duration: categoryInfo.estimated_duration,
      is_active: true,
      language: language
    })
    .select()
    .single();
  
  if (workflowError) {
    throw new Error(`Error creating workflow: ${workflowError.message}`);
  }
  
  // Insert tasks
  const tasksToInsert = tasks.map(task => ({
    ...task,
    workflow_template_id: workflow.id,
    estimated_duration: Math.ceil(categoryInfo.estimated_duration / tasks.length)
  }));
  
  const { error: tasksError } = await supabase
    .from('workflow_tasks')
    .insert(tasksToInsert);
  
  if (tasksError) {
    throw new Error(`Error creating tasks: ${tasksError.message}`);
  }
  
  // Create role assignments
  for (const role of categoryInfo.roles) {
    await supabase
      .from('workflow_role_assignments')
      .insert({
        workflow_template_id: workflow.id,
        role_name: role
      });
  }
  
  return {
    success: true,
    workflow: workflowTitle,
    tasks: tasks.length,
    roles: categoryInfo.roles
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin/manager
    const { data: employee } = await supabase
      .from('employees')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (!employee || !['Manager', 'Admin'].includes(employee.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const results = [];
    const referenceDir = path.join(process.cwd(), '..', '..', 'REFERENCE FILES');
    
    // Check if reference files exist
    if (!fs.existsSync(referenceDir)) {
      return NextResponse.json({ 
        error: 'Reference files directory not found',
        message: 'Please ensure the REFERENCE FILES directory is available'
      }, { status: 404 });
    }

    // Main reference files
    const mainFiles = [
      'FOH OPENING CHECKLIST.md',
      'FOH CLOSING LIST.md', 
      'FOH TRANSITION CHECKLIST.md',
      'CLEANING OPENING LIST.md',
      'BAR CLOSING.md',
      'AM_Prep_Daily_Inventory.md',
      'DRY GOODS INVENTORY PACKAGING.md',
      'LEAD PREP WORKSHEET.md',
      'MISSING INGREDIENTS.md'
    ];
    
    // Process main files
    for (const filename of mainFiles) {
      const filePath = path.join(referenceDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          const result = await importWorkflow(filename, filePath, 'en');
          results.push(result);
        } catch (error) {
          results.push({
            success: false,
            workflow: filename,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }
    
    // Process BOH files
    const bohDir = path.join(referenceDir, 'BOH');
    if (fs.existsSync(bohDir)) {
      const bohFiles = fs.readdirSync(bohDir).filter(f => f.endsWith('.md'));
      
      for (const filename of bohFiles) {
        const filePath = path.join(bohDir, filename);
        const language = filename.includes('SPANISH') ? 'es' : 'en';
        try {
          const result = await importWorkflow(filename, filePath, language);
          results.push(result);
        } catch (error) {
          results.push({
            success: false,
            workflow: filename,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }
    
    // Process FOH files
    const fohDir = path.join(referenceDir, 'FOH');
    if (fs.existsSync(fohDir)) {
      const fohFiles = fs.readdirSync(fohDir).filter(f => f.endsWith('.md'));
      
      for (const filename of fohFiles) {
        const filePath = path.join(fohDir, filename);
        const language = filename.includes('_TR') ? 'tr' : 'en';
        try {
          const result = await importWorkflow(filename, filePath, language);
          results.push(result);
        } catch (error) {
          results.push({
            success: false,
            workflow: filename,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalTasks = results.reduce((sum, r) => sum + ('tasks' in r ? r.tasks || 0 : 0), 0);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${successCount} Jayna Gyro workflows with ${totalTasks} total tasks`,
      results,
      summary: {
        workflows_imported: successCount,
        total_tasks: totalTasks,
        languages: ['English', 'Spanish', 'Turkish'],
        departments: ['Front of House', 'Back of House', 'Bar', 'Management']
      }
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import workflows', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}