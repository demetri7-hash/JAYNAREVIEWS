# 🗄️ DATABASE SCHEMA REFERENCE - THE PASS

**CRITICAL REFERENCE**: Use these exact table and column names for all database operations.

## 📋 CORE TABLES

### 👥 USERS & AUTH
```sql
users
  ├── id (UUID, PK)
  ├── email (VARCHAR, UNIQUE)
  ├── first_name, last_name (VARCHAR)
  ├── role (ENUM: employee, shift_lead, manager, admin)
  ├── employee_id (VARCHAR, UNIQUE)
  ├── hire_date, phone, avatar_url
  └── is_active, created_at, updated_at
```

### 🔔 NOTIFICATIONS SYSTEM
```sql
notifications
  ├── id (UUID, PK)
  ├── title, message (VARCHAR/TEXT)
  ├── type (ENUM: task, review, shift, system, urgent)
  ├── priority (ENUM: low, medium, high, critical)
  ├── data (JSONB)
  ├── created_by (FK → users.id)
  └── expires_at, is_system_wide

user_notifications
  ├── id (UUID, PK)
  ├── notification_id (FK → notifications.id)
  ├── user_id (FK → users.id)
  ├── is_read, is_acknowledged
  └── read_at, acknowledged_at
```

### 📝 WORKFLOW SYSTEM
```sql
workflow_templates
  ├── id (UUID, PK)
  ├── name (VARCHAR)
  ├── category (ENUM: boh_opening, boh_closing, foh_opening, foh_closing, daily_prep, cleaning, inventory)
  ├── description, estimated_duration_minutes
  ├── required_role (ENUM: employee, shift_lead, manager, admin)
  └── is_active, version, created_by

workflow_tasks
  ├── id (UUID, PK)
  ├── template_id (FK → workflow_templates.id)
  ├── title, description
  ├── order_index
  ├── is_required, estimated_minutes
  ├── requires_photo, requires_notes
  └── created_at

workflow_instances
  ├── id (UUID, PK)
  ├── template_id (FK → workflow_templates.id)
  ├── assigned_to, started_by (FK → users.id)
  ├── shift_date, shift_type (ENUM: morning, afternoon, evening, overnight)
  ├── status (VARCHAR)
  ├── started_at, completed_at
  └── total_duration_minutes, notes

task_completions
  ├── id (UUID, PK)
  ├── workflow_instance_id (FK → workflow_instances.id)
  ├── task_id (FK → workflow_tasks.id)
  ├── completed_by (FK → users.id)
  ├── is_completed (BOOLEAN)
  ├── completion_notes (TEXT)
  ├── photo_urls (TEXT[])  ⚠️ ARRAY FIELD
  └── completed_at, created_at
```

### 🧱 WALL POSTS SYSTEM
```sql
wall_posts
  ├── id (UUID, PK)
  ├── author_id (FK → users.id)
  ├── content (TEXT)
  ├── post_type (ENUM: public, manager, announcement, urgent)
  ├── visibility (ENUM: all, department, role, specific)
  ├── visibility_rules (JSONB)
  ├── photos (TEXT[])  ⚠️ ARRAY FIELD
  ├── requires_acknowledgment, acknowledgment_signature_required
  ├── pinned, expires_at
  └── created_at, updated_at

wall_post_acknowledgments
  ├── id (UUID, PK)
  ├── post_id (FK → wall_posts.id)
  ├── employee_id (FK → users.id)
  ├── acknowledged_at, signature, notes
  └── UNIQUE(post_id, employee_id)

wall_post_reactions
  ├── id (UUID, PK)
  ├── post_id (FK → wall_posts.id)
  ├── employee_id (FK → users.id)
  ├── reaction_type (ENUM: like, love, helpful, celebrate)
  └── UNIQUE(post_id, employee_id, reaction_type)
```

### 📊 REVIEW SYSTEM
```sql
review_templates
  ├── id (UUID, PK)
  ├── name, description
  ├── is_active, created_by
  └── created_at, updated_at

review_categories
  ├── id (UUID, PK)
  ├── template_id (FK → review_templates.id)
  ├── name, description
  ├── max_rating, weight, order_index
  └── created_at

review_instances
  ├── id (UUID, PK)
  ├── template_id (FK → review_templates.id)
  ├── employee_id, reviewer_id (FK → users.id)
  ├── date, shift_type
  ├── overall_rating, is_completed
  └── locked_at, created_at, updated_at

review_responses
  ├── id (UUID, PK)
  ├── review_instance_id (FK → review_instances.id)
  ├── category_id (FK → review_categories.id)
  ├── rating, notes
  ├── photos (TEXT[])  ⚠️ ARRAY FIELD
  └── completed_at, created_at
```

### 🔄 TASK TRANSFERS
```sql
task_transfers
  ├── id (UUID, PK)
  ├── from_user_id, to_user_id (FK → users.id)
  ├── shift_date, from_shift, to_shift
  ├── task_title, task_description
  ├── priority, is_completed
  └── completed_at, created_at
```

### 📈 ANALYTICS & METRICS
```sql
analytics_events
  ├── id (UUID, PK)
  ├── event_type, user_id, session_id
  ├── data, metadata (JSONB)
  └── timestamp, created_at

performance_metrics
  ├── id (UUID, PK)
  ├── metric_type, value, unit
  ├── context (JSONB), user_id
  └── timestamp, created_at

shift_metrics
  ├── id (UUID, PK)
  ├── shift_date, shift_type
  ├── total_employees, workflows_completed
  ├── workflows_on_time, average_completion_time
  ├── total_reviews, average_rating
  └── created_at

employee_metrics
  ├── id (UUID, PK)
  ├── user_id, date, shift_type
  ├── workflows_completed, average_task_time
  ├── review_rating, punctuality_score
  └── created_at

audit_logs
  ├── id (UUID, PK)
  ├── user_id, action, table_name, record_id
  ├── old_values, new_values (JSONB)
  ├── ip_address, user_agent
  └── created_at
```

## 🔧 ENUMS (Use Exact Values)

### user_role
- `employee`
- `shift_lead` 
- `manager`
- `admin`

### shift_type
- `morning`
- `afternoon` 
- `evening`
- `overnight`

### notification_type
- `task`
- `review`
- `shift`
- `system`
- `urgent`

### notification_priority
- `low`
- `medium`
- `high`
- `critical`

### workflow_category
- `boh_opening`
- `boh_closing`
- `foh_opening`
- `foh_closing`
- `daily_prep`
- `cleaning`
- `inventory`

### wall_post types
- `public`
- `manager`
- `announcement`
- `urgent`

### wall_post visibility
- `all`
- `department`
- `role`
- `specific`

### reaction_type
- `like`
- `love`
- `helpful`
- `celebrate`

## ⚠️ CRITICAL NOTES

1. **Array Fields**: `photo_urls`, `photos` are `TEXT[]` arrays
2. **UUID Primary Keys**: All tables use UUID for `id` field
3. **Foreign Keys**: Always reference the correct table
4. **JSONB Fields**: `data`, `metadata`, `context`, `visibility_rules`
5. **Timestamps**: Use `TIMESTAMP WITH TIME ZONE`, field names end in `_at`
6. **Boolean Fields**: `is_completed`, `is_active`, `is_read`, `is_acknowledged`

## 🎯 COMPONENT INTEGRATION PATTERNS

### Photo Upload Integration
```typescript
// task_completions.photo_urls (TEXT[])
// review_responses.photos (TEXT[])
// wall_posts.photos (TEXT[])
```

### Workflow Component Props
```typescript
interface WorkflowProps {
  templateId: string  // workflow_templates.id
  instanceId: string  // workflow_instances.id
}
```

### Task Completion Integration
```typescript
interface TaskCompletionData {
  workflow_instance_id: string  // FK
  task_id: string              // FK
  completed_by: string         // FK users.id
  photo_urls: string[]         // Array field
  completion_notes?: string
}
```

---
**📋 Reference Updated**: September 12, 2025
**⚠️ Always use this reference for table/column names**