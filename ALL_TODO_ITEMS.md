# 📋 ALL TODO ITEMS - COMPREHENSIVE TRACKING

**Last Updated**: September 18, 2025

## 🎯 CURRENT SESSION TODOS (NEW WORKFLOW SYSTEM)

### ✅ **COMPLETED ITEMS (Current Session)**
- [x] Reorder page layout - Move Manager Updates section to appear first on team activity page
- [x] Debug translation system - OpenAI API key configured, translations working in manager updates API
- [x] Fix manager updates display issue - Fixed API call with `showRead=true&limit=50` parameters
- [x] Add photo upload to manager dashboard - Copied Supabase Storage pattern from task completions
- [x] Implement comprehensive read/unread system - Complete with pagination, history page, auto-read, manual unread, signature priority, red styling

### 🔄 **IN PROGRESS ITEMS**
- [ ] **MAJOR WORKFLOW SYSTEM REDESIGN** (Current Priority)
  - Remove task creator from home screen
  - Move all admin functionality to manager dashboard
  - Create "My Workflow" cards for non-manager users
  - Build workflow creation system with custom task groupings
  - Move repeating/due date features from individual tasks to workflow level

### 📅 **PENDING ITEMS**
- [ ] Fix mobile spacing issues - iPhone layout problems with squished margins
- [ ] Fix toast user linking persistence - Database persistence bug requiring re-selection

---

## 🏗️ NEW WORKFLOW SYSTEM ARCHITECTURE

### **Database Schema Changes Needed:**

#### **New Tables to Create:**
```sql
-- Workflows table
workflows (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  is_repeatable BOOLEAN DEFAULT false,
  recurrence_type VARCHAR CHECK (recurrence_type IN ('once', 'daily', 'weekly', 'monthly')),
  due_date DATE,
  due_time TIME,
  departments TEXT[], -- Array of departments this workflow applies to
  roles TEXT[], -- Array of roles this workflow applies to
  assigned_users UUID[], -- Array of specific user IDs
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflow Tasks junction table
workflow_tasks (
  id UUID PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update existing tasks table
ALTER TABLE tasks 
ADD COLUMN tags TEXT[],
ADD COLUMN is_photo_mandatory BOOLEAN DEFAULT false,
ADD COLUMN is_notes_mandatory BOOLEAN DEFAULT false;

-- Remove from tasks table (move to workflows)
ALTER TABLE tasks 
DROP COLUMN IF EXISTS recurrence,
DROP COLUMN IF EXISTS due_date;
```

#### **API Endpoints to Create:**
- `/api/workflows` (GET, POST, PATCH, DELETE)
- `/api/workflows/[id]` (GET individual workflow)
- `/api/workflows/[id]/tasks` (GET tasks in workflow)
- `/api/workflows/assign` (POST to assign workflow to users)
- `/api/my-workflows` (GET workflows assigned to current user)
- `/api/tasks/search` (GET with autocomplete functionality)

#### **Pages to Create:**
- `/manager-dashboard` (enhanced with workflow creation)
- `/create-workflow` (new workflow creation page)
- `/my-workflows` (replaces current task view for non-managers)

### **Component Architecture:**

#### **Manager Dashboard Enhancements:**
- Add "Create New Workflow" button
- Workflow management tab
- Enhanced task creation within workflows

#### **New Components Needed:**
- `WorkflowCreator.tsx` - Main workflow creation interface
- `TaskSelector.tsx` - Task selection with filtering and autocomplete
- `WorkflowCard.tsx` - Display workflow for users
- `MyWorkflows.tsx` - User's assigned workflows view

#### **Key Features to Implement:**

1. **Workflow Creation Flow:**
   - Name and description input
   - Department/role/user assignment
   - Repeatability settings (moved from individual tasks)
   - Due date/time settings (moved from individual tasks)
   - Task selection with autocomplete
   - New task creation within workflow
   - Drag-and-drop task ordering

2. **Task Management Updates:**
   - Add tags system for filtering
   - Photo mandatory toggle
   - Notes mandatory toggle
   - Remove individual recurrence/due date fields
   - Autocomplete functionality for task titles

3. **User Experience Changes:**
   - Non-managers see "My Workflow" cards instead of individual tasks
   - Managers get enhanced dashboard with all admin functions
   - Clean separation of user vs admin functionality

---

## 📚 EXISTING SYSTEM DOCUMENTATION

### **Current Database Schema:**
```sql
-- Core Tables (DO NOT MODIFY)
profiles (id, name, email, role, created_at)
tasks (id, title, description, requires_notes, requires_photo, created_at)
assignments (id, task_id, assigned_to, status, due_date, created_at)
completions (id, assignment_id, completed_by, notes, photo_url, completed_at)

-- Manager System (WORKING - DO NOT BREAK)
manager_updates (id, title, message, priority, type, requires_acknowledgment, is_active, expires_at, created_by, created_at, photo_url)
update_acknowledgments (id, update_id, user_id, full_name_entered, ip_address, user_agent, acknowledged_at)
manager_update_reads (id, update_id, user_id, read_at)

-- Archive System (WORKING)
archived_assignments, user_weekly_stats, weekly_reports
role_permissions, user_permission_overrides
```

### **Working API Endpoints (DO NOT BREAK):**
- `/api/me` - User profile (✅ Live DB)
- `/api/tasks` - Create tasks (✅ Live DB) 
- `/api/my-tasks` - User's assigned tasks (✅ Live DB)
- `/api/assignments/[id]` - Task details (✅ Live DB)
- `/api/assignments/[id]/complete` - Complete tasks (✅ Live DB)
- `/api/team-activity` - Team performance data (✅ Live DB)
- `/api/manager/updates` - Manager announcements (✅ Live DB with read/unread filtering)
- `/api/manager/updates/read-status` - Mark updates as read/unread (✅ Live DB)
- `/api/manager/acknowledgments` - Forced signature confirmations (✅ Live DB)

### **Working Features (DO NOT BREAK):**
- Manager Updates System with read/unread tracking
- Photo uploads using Supabase Storage (`task-photos` bucket)
- Role-based access control
- Translation system with OpenAI API
- Team activity performance tracking
- Task completion with photos/notes

---

## 🚨 CRITICAL NOTES FOR CONTINUATION

### **Environment Variables (CONFIGURED):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- All NextAuth and Google OAuth credentials

### **File Locations:**
- Main Supabase client: `/src/lib/supabase.ts`
- Task completions pattern: `/src/app/complete-task/[id]/page.tsx`
- Manager dashboard: `/src/app/manager-dashboard/page.tsx`
- Team activity: `/src/app/team-activity/page.tsx`
- Read/unread system: `/src/app/update-history/page.tsx`

### **Code Quality Rules:**
- NEVER use `any` type in TypeScript
- Always use real database queries (no mock data)
- Fix all ESLint warnings before deployment
- Use existing photo upload pattern from task completions
- Commit and push frequently for live testing

---

## 📈 FUTURE ENHANCEMENTS (AFTER WORKFLOW SYSTEM)

### **Phase 1: Polish & UX**
- [ ] Fix mobile spacing issues (iPhone layout)
- [ ] Fix Toast user linking persistence bug
- [ ] Add loading spinners for all async operations
- [ ] Implement proper error boundaries

### **Phase 2: Advanced Features** 
- [ ] Real-time notifications system
- [ ] Team chat/messaging within tasks
- [ ] Advanced analytics dashboard
- [ ] Performance trends and insights

### **Phase 3: Integration & Intelligence**
- [ ] Toast POS integration (credentials already configured)
- [ ] Smart task assignment based on performance
- [ ] Predictive analytics for task completion
- [ ] Automated workflow optimization

---

## 🔄 WORKFLOW TRANSITION PLAN

### **Step 1: Database Migration**
1. Create new workflow tables
2. Add tags/mandatory fields to tasks table
3. Migrate existing assignments to workflow format
4. Test data integrity

### **Step 2: API Development**
1. Build workflow CRUD endpoints
2. Enhance task search with autocomplete
3. Create workflow assignment system
4. Test all endpoints

### **Step 3: Frontend Development**
1. Build workflow creation page
2. Update manager dashboard
3. Create "My Workflows" user view
4. Update task creation flow

### **Step 4: Migration & Testing**
1. Migrate existing users to workflow system
2. Test all user flows
3. Performance testing
4. Mobile responsiveness testing

---

**REMEMBER**: Always test on live deployment, commit frequently, and maintain backward compatibility during transition.