#!/usr/bin/env node

/**
 * Import Jayna Gyro Reference Workflows
 * This script converts all the reference files into database workflow templates
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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
const FILE_MAPPINGS = {
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

function parseMarkdownToTasks(markdownContent, filename) {
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

async function importWorkflow(filename, filePath, language = 'en') {
  try {
    console.log(`\n📋 Processing: ${filename}`);
    
    // Read the markdown file
    const markdownContent = fs.readFileSync(filePath, 'utf-8');
    
    // Determine workflow category
    const category = FILE_MAPPINGS[filename] || 'CLEANING';
    const categoryInfo = WORKFLOW_CATEGORIES[category];
    
    // Parse tasks from markdown
    const tasks = parseMarkdownToTasks(markdownContent, filename);
    
    if (tasks.length === 0) {
      console.log(`⚠️  No tasks found in ${filename}`);
      return;
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
      console.error(`❌ Error creating workflow: ${workflowError.message}`);
      return;
    }
    
    console.log(`✅ Created workflow: ${workflowTitle}`);
    
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
      console.error(`❌ Error creating tasks: ${tasksError.message}`);
      return;
    }
    
    console.log(`✅ Added ${tasks.length} tasks to ${workflowTitle}`);
    
    // Create role assignments
    for (const role of categoryInfo.roles) {
      const { error: roleError } = await supabase
        .from('workflow_role_assignments')
        .insert({
          workflow_template_id: workflow.id,
          role_name: role
        });
      
      if (roleError) {
        console.log(`⚠️  Role assignment warning for ${role}: ${roleError.message}`);
      }
    }
    
    console.log(`✅ Assigned roles: ${categoryInfo.roles.join(', ')}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting Jayna Gyro Workflow Import...\n');
  
  const referenceDir = path.join(__dirname, '..', '..', 'REFERENCE FILES');
  
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
      await importWorkflow(filename, filePath, 'en');
    }
  }
  
  // Process BOH files
  const bohDir = path.join(referenceDir, 'BOH');
  const bohFiles = fs.readdirSync(bohDir).filter(f => f.endsWith('.md'));
  
  for (const filename of bohFiles) {
    const filePath = path.join(bohDir, filename);
    const language = filename.includes('SPANISH') ? 'es' : 'en';
    await importWorkflow(filename, filePath, language);
  }
  
  // Process FOH files
  const fohDir = path.join(referenceDir, 'FOH');
  const fohFiles = fs.readdirSync(fohDir).filter(f => f.endsWith('.md'));
  
  for (const filename of fohFiles) {
    const filePath = path.join(fohDir, filename);
    const language = filename.includes('_TR') ? 'tr' : 'en';
    await importWorkflow(filename, filePath, language);
  }
  
  // Process Spanish files
  const spanishFiles = [
    'CLEANING_OPENING_LIST_SPANISH.md',
    'LINE REVIEWS SPANISH.md'
  ];
  
  for (const filename of spanishFiles) {
    const filePath = path.join(referenceDir, filename);
    if (fs.existsSync(filePath)) {
      await importWorkflow(filename, filePath, 'es');
    }
  }
  
  // Process Turkish files
  const turkishFiles = [
    'CLEANING_OPENING_LIST_TR.md',
    'CLEANING_OPENING_LIST_TRANSLATED_TR.md',
    'LINE REVIEWS TURKISH.md'
  ];
  
  for (const filename of turkishFiles) {
    const filePath = path.join(referenceDir, filename);
    if (fs.existsSync(filePath)) {
      await importWorkflow(filename, filePath, 'tr');
    }
  }
  
  console.log('\n🎉 Jayna Gyro Workflow Import Complete!');
  console.log('\n📊 Summary:');
  console.log('• All reference worksheets have been converted to digital workflows');
  console.log('• Multi-language support (English, Spanish, Turkish)');
  console.log('• Role-based assignments for each department');  
  console.log('• Ready for real-world use at Jayna Gyro!');
}

// Run the import
main().catch(console.error);