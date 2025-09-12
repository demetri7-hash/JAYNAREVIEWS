# Recurring Workflows Setup Guide

## Overview
The recurring workflows system automatically assigns workflow templates to employees based on scheduled patterns (daily, weekly, monthly).

## Features Implemented

### 1. Recurring Workflows Management (`/recurring-workflows`)
- Create recurring workflow assignments
- Configure daily, weekly, or monthly patterns
- Set specific times for automatic assignment
- Manage active/paused workflows
- View next assignment dates

### 2. Automatic Assignment System
- Cron job endpoint: `/api/cron/recurring-workflows`
- Automatically creates workflow instances
- Calculates next assignment dates
- Tracks assignment history

### 3. Database Schema
- `recurring_workflows` table for pattern storage
- `workflow_instances.recurring_workflow_id` for tracking
- Performance indexes for efficiency

## Setup Instructions

### 1. Database Schema Setup
Run the schema setup endpoint:
```bash
POST /api/setup-recurring-schema
Content-Type: application/json

{
  "confirm": true
}
```

### 2. Cron Job Configuration
For automatic assignment, set up a cron job to call:
```bash
POST /api/cron/recurring-workflows
Authorization: Bearer YOUR_CRON_SECRET
```

Add to your environment variables:
```env
CRON_SECRET=your_secure_cron_secret_here
```

### 3. Cron Schedule Examples

#### Every 15 minutes (recommended for testing):
```bash
*/15 * * * * curl -X POST "https://yourdomain.com/api/cron/recurring-workflows" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### Every hour:
```bash
0 * * * * curl -X POST "https://yourdomain.com/api/cron/recurring-workflows" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### Every day at 8 AM:
```bash
0 8 * * * curl -X POST "https://yourdomain.com/api/cron/recurring-workflows" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Usage Guide

### Creating a Recurring Workflow

1. **Navigate to Recurring Workflows** (managers only)
2. **Click "Create Recurring Workflow"**
3. **Select a workflow template**
4. **Choose recurrence pattern:**
   - **Daily**: Every X days at specific time
   - **Weekly**: Specific days of the week
   - **Monthly**: Specific day of the month
5. **Set assignment time** (24-hour format)
6. **Select employees** to assign to
7. **Click "Create Workflow"**

### Managing Existing Workflows

- **Pause/Resume**: Click the play/pause button
- **Edit**: Click the pencil icon to modify settings
- **Delete**: Click the trash icon to remove permanently

### Monitoring

- **Next Assignment**: Shows when the workflow will be assigned next
- **Last Assigned**: Shows the last assignment date
- **Status**: Active or Paused

## Technical Details

### Recurrence Calculation
The system calculates next assignment dates based on:
- Pattern type (daily/weekly/monthly)
- Frequency (every X periods)
- Specific days (for weekly patterns)
- Assignment time

### Workflow Instance Creation
Each assignment creates:
- A new `workflow_instance` record
- Individual `task_instances` for each template task
- Proper due dates based on pattern frequency

### Error Handling
- Failed assignments are logged but don't stop other workflows
- Invalid employee emails are skipped with warnings
- Database errors are tracked and reported

## Environment Variables Required

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cron Security
CRON_SECRET=your_secure_cron_secret

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## Production Deployment

### 1. Vercel Cron Jobs
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/recurring-workflows",
      "schedule": "0 * * * *"
    }
  ]
}
```

### 2. External Cron Services
Use services like:
- GitHub Actions (scheduled workflows)
- Uptime Robot (monitoring with webhooks)
- Cron-job.org (free cron service)

### 3. Monitoring
Set up monitoring for:
- Cron job execution success/failure
- Assignment counts and errors
- Database performance

## Troubleshooting

### Common Issues

1. **Workflows not being assigned**
   - Check cron job is running
   - Verify CRON_SECRET is correct
   - Check workflow is active and due

2. **Missing employees**
   - Ensure employee emails exist in database
   - Check employee status is active

3. **Incorrect assignment times**
   - Verify timezone settings
   - Check time format (24-hour)

### Debugging

Check cron job logs:
```bash
curl -X POST "http://localhost:3000/api/cron/recurring-workflows" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

This will return:
```json
{
  "success": true,
  "assignedCount": 5,
  "processedWorkflows": 3,
  "results": [...]
}
```
