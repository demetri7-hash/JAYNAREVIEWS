# Task Completion with Photos and Notes Feature

## Overview

This feature allows managers to require photos and/or notes when employees complete tasks within workflows. It provides a comprehensive system for task documentation and verification.

## Components

### 1. TaskCreationTab.tsx
**Enhanced task creation with completion requirements**

- **Photo Requirement Toggle**: Managers can require photo upload when completing tasks
- **Notes Requirement Toggle**: Managers can require completion notes
- **Visual Indicators**: Clear UI showing which requirements are enabled
- **Template Support**: Task templates can include default requirement settings

```tsx
// Task interface includes requirement flags
interface NewTask {
  title: string
  description: string
  location: string
  priority: 'low' | 'medium' | 'high'
  estimated_duration: number
  instructions: string
  requires_photo: boolean  // NEW: Photo requirement
  requires_notes: boolean  // NEW: Notes requirement
}
```

### 2. TaskCompletionModal.tsx
**Modal for completing tasks with photos and notes**

- **Conditional Requirements**: Only shows required fields based on task settings
- **Photo Upload**: Drag & drop or click to upload multiple photos
- **Photo Preview**: Shows thumbnails of uploaded photos with removal option
- **Notes Input**: Rich textarea for completion notes
- **Validation**: Prevents completion if requirements aren't met
- **Requirements Summary**: Visual checklist showing completion status

**Key Features:**
- Multi-photo upload support
- Photo preview with filename display
- Automatic validation of requirements
- Progress indicators for required vs optional fields
- Error handling and user feedback

### 3. CompletedTaskView.tsx
**Display completed tasks with their documentation**

- **Expandable Cards**: Click to view/hide completion details
- **Photo Gallery**: Grid layout for completion photos
- **Notes Display**: Formatted text display for completion notes
- **Metadata**: Shows who completed the task and when
- **Visual Indicators**: Badges showing whether notes/photos were included

**Features:**
- Photo lightbox (click to open full size)
- Responsive grid layout for photos
- Timestamp and user attribution
- Collapsible interface to save space

### 4. WorkflowTaskCard.tsx
**Individual task component within workflows**

- **Requirement Warnings**: Shows what will be required before completion
- **Status Indicators**: Visual status with icons and colors
- **Completion Integration**: Opens TaskCompletionModal when completing
- **Completed Task Display**: Shows completion details for finished tasks

## Usage Examples

### Creating a Task with Requirements

```tsx
// Manager creates task requiring both photo and notes
const newTask = {
  title: "Clean and sanitize prep station",
  description: "Complete deep cleaning of all prep surfaces",
  requires_photo: true,  // Photo required
  requires_notes: true,  // Notes required
  priority: "high"
}
```

### Completing a Task

```tsx
// User completes task through WorkflowTaskCard
const handleTaskComplete = async (taskId: string, completionData: {
  notes?: string
  photos?: File[]
}) => {
  const formData = new FormData()
  formData.append('notes', completionData.notes || '')
  
  completionData.photos?.forEach((photo, index) => {
    formData.append('photos', photo)
  })

  await fetch(`/api/tasks/${taskId}/complete`, {
    method: 'POST',
    body: formData
  })
}
```

### Viewing Completed Tasks

```tsx
// Display completed tasks with documentation
<CompletedTaskView 
  completions={completedTasks}
  loading={isLoading}
/>
```

## Database Schema Updates

### Tasks Table
```sql
ALTER TABLE tasks ADD COLUMN requires_photo BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN requires_notes BOOLEAN DEFAULT FALSE;
```

### Task Completions Table
```sql
CREATE TABLE task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id),
  completed_by UUID REFERENCES users(id),
  completed_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Task Photos Table
```sql
CREATE TABLE task_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  completion_id UUID REFERENCES task_completions(id),
  filename VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### POST /api/tasks/[id]/complete
**Complete a task with optional photos and notes**

**Request:** FormData with:
- `notes`: string (optional unless required)
- `photos`: File[] (optional unless required)

**Response:**
```json
{
  "success": true,
  "completion": {
    "id": "completion-uuid",
    "task_id": "task-uuid",
    "completed_by": "user-uuid",
    "notes": "Task completed successfully",
    "photos": [
      {
        "id": "photo-uuid",
        "filename": "photo.jpg",
        "url": "/uploads/task-photos/stored-filename.jpg"
      }
    ]
  }
}
```

### GET /api/tasks/completions
**Get completed tasks with documentation**

**Response:**
```json
{
  "completions": [
    {
      "id": "completion-uuid",
      "task_title": "Clean prep station",
      "completed_by": {
        "name": "John Doe",
        "role": "Prep Cook"
      },
      "completed_at": "2025-09-21T10:30:00Z",
      "notes": "All surfaces cleaned and sanitized",
      "photos": [...]
    }
  ]
}
```

## File Upload Handling

### Storage Location
- Photos stored in: `/public/uploads/task-photos/`
- Filename format: `task-{taskId}-{nanoid()}.{extension}`
- Max file size: 10MB per photo
- Supported formats: JPG, PNG, WebP

### Security Considerations
- Validate file types on upload
- Scan for malicious content
- Limit file sizes
- Use unique filenames to prevent conflicts
- Store files outside web root in production

## UI/UX Features

### Visual Requirements Indication
- **Photo Required**: Blue camera icon badge
- **Notes Required**: Purple text icon badge
- **Both Required**: Both badges displayed

### Completion Flow
1. User clicks "Complete Task" button
2. TaskCompletionModal opens with requirements
3. User adds required photos/notes
4. Validation checks requirements
5. Task marked complete with documentation
6. Success feedback shown

### Responsive Design
- Mobile-friendly photo upload
- Touch-friendly interface
- Responsive photo grids
- Optimized for restaurant floor use

## Benefits

### For Managers
- **Quality Control**: Visual verification of task completion
- **Documentation**: Complete record of work performed
- **Accountability**: Clear attribution of task completion
- **Compliance**: Meet documentation requirements for health inspections

### For Employees
- **Clear Expectations**: Know exactly what's required
- **Easy Documentation**: Simple photo and note capture
- **Progress Tracking**: Visual feedback on completion requirements
- **Mobile Optimized**: Works well on phones and tablets

### For Operations
- **Audit Trail**: Complete history of task completion
- **Training Tool**: Examples of properly completed tasks
- **Issue Tracking**: Documentation when problems occur
- **Performance Metrics**: Data on task completion quality

This feature transforms simple task completion into a comprehensive documentation system that improves accountability, quality control, and operational visibility.