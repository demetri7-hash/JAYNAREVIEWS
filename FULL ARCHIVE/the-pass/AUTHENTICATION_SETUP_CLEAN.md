# Authentication System Setup Guide

## Overview
The Pass now includes a complete Google OAuth authentication system with role-based access control. Users can sign in with their Google accounts, and managers can control access and permissions through a web interface.

## What's Been Implemented

### 1. Google OAuth Authentication
- Users sign in with their Google accounts
- New users are automatically created in the database
- Account activation is required (manager approval)

### 2. Role-Based Access Control
- **Employee**: Basic access to create and view own workflows
- **Lead**: Can view team worksheets and manage some operations
- **Manager**: Full user management, can activate accounts and assign roles
- **Admin**: Complete system access

### 3. Manager Dashboard
- Located at `/admin/users`
- View all employees and their status
- Activate/deactivate accounts
- Assign roles and permissions
- View audit logs of all management actions

### 4. Workflow Execution
- Users can start morning/evening workflows
- Interactive task completion with photo uploads
- Progress tracking and notes
- Responsive design for mobile use

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env.local` and fill in these values:

```bash
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-nextauth-secret-here

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase (Your existing values)
NEXT_PUBLIC_SUPABASE_URL=https://xedpssqxgmnwufatyoje.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-vercel-domain.vercel.app/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret to your environment variables

### 3. Production Environment Variables (Vercel)
In your Vercel dashboard, add these environment variables:

```bash
# Authentication (REQUIRED)
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=your-generated-secret-key

# Google OAuth (REQUIRED - from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://xedpssqxgmnwufatyoje.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **Important**: 
- Replace `your-vercel-domain.vercel.app` with your actual Vercel domain
- Generate a secure NEXTAUTH_SECRET using: `openssl rand -base64 32`
- Use the Google OAuth credentials from your Google Cloud Console

### 4. Database Setup
Run the schema setup endpoint to create the authentication tables:
```bash
curl -X POST https://your-vercel-domain.vercel.app/api/auth/setup-schema
```

Or visit the endpoint in your browser after deployment.

### 5. First Manager Account
After the first user signs in:
1. They will see "Account Pending Approval"
2. Manually set their role to 'manager' in the database:
   ```sql
   UPDATE employees 
   SET role = 'manager', is_active = true 
   WHERE email = 'your-email@gmail.com';
   ```
3. Now they can access the manager dashboard and activate other users

## How It Works

### User Flow
1. User visits the app → redirected to `/auth/signin`
2. User clicks "Sign in with Google" → Google OAuth flow
3. User account created automatically but `is_active = false`
4. User sees "Account Pending Approval" message
5. Manager activates the account through the dashboard
6. User can now access workflows

### Manager Flow
1. Manager signs in and goes to `/admin/users`
2. Sees list of all employees with activation status
3. Can activate accounts, change roles, set permissions
4. All actions are logged in the audit trail

### Workflow Flow
1. Activated user sees dashboard with workflow options
2. Clicks "Start Morning/Evening Workflow"
3. Creates a new worksheet with tasks
4. Goes to `/workflows/{id}` to complete tasks
5. Can add photos, ratings, and notes for each task
6. Progress is saved automatically

## Fixing the NO_SECRET Error

If you see the error `[next-auth][error][NO_SECRET]`, add these environment variables to Vercel:

```bash
NEXTAUTH_SECRET=your-generated-secret-key
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
```

Generate a secure secret with: `openssl rand -base64 32`

## Key Features

### Security
- Session-based authentication with NextAuth.js
- Role-based access control with permissions
- Audit logging for all management actions
- Automatic account creation with manual activation

### User Experience
- Clean, professional Google sign-in flow
- Mobile-responsive design
- Real-time progress tracking
- Photo uploads for task verification

### Management
- Complete user lifecycle management
- Granular role and permission control
- Audit trail for accountability
- Easy activation/deactivation of accounts

## File Structure
- `/src/lib/auth.ts` - NextAuth configuration
- `/src/app/api/auth/[...nextauth]/route.ts` - Authentication endpoints
- `/src/app/auth/signin/page.tsx` - Sign-in page
- `/src/app/admin/users/page.tsx` - Manager dashboard
- `/src/app/workflows/[id]/page.tsx` - Workflow execution
- `/src/app/api/auth/employees/route.ts` - Employee management API
- `/src/app/api/worksheets/` - Worksheet management APIs

## Next Steps
1. Set up Google OAuth credentials in Google Cloud Console
2. Configure environment variables in Vercel
3. Run database schema setup endpoint
4. Create first manager account
5. Test the complete flow
6. Deploy and provide feedback!

The system is now ready for production use with proper authentication and user management!
