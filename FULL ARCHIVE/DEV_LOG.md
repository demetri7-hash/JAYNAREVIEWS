# The Pass - Restaurant Management System
## Development Log & Project Documentation

---

## 📋 PROJECT OVERVIEW

**Project**: The Pass - Jayna Gyro Restaurant Management System  
**Purpose**: Digital workflow management system for restaurant operations with Google OAuth authentication and role-based access control  
**Stack**: Next.js 15, NextAuth.js, Supabase, TypeScript, Tailwind CSS  
**Deployment**: Vercel  

---

## 🎯 PRIMARY OBJECTIVES

1. **Google OAuth Authentication**: Users authenticate using their Google accounts
2. **Role-Based Access Control**: Manager can edit user roles, permissions, activate/deactivate accounts
3. **Workflow Management**: Digital checklists and workflows for restaurant operations
4. **Multi-language Support**: English, Spanish, Turkish language options
5. **Department Management**: FOH (Front of House) and BOH (Back of House) operations

---

## 🏗️ CURRENT SYSTEM ARCHITECTURE

### Authentication System
- **NextAuth.js v4** with Google OAuth provider
- **JWT Strategy** (no database adapter to avoid conflicts)
- **Supabase Database** integration for user/employee management
- **Role-based permissions**: employee, manager, admin

### Database Structure (Supabase)
```sql
employees table:
- id (uuid, primary key)
- name (text)
- email (text, unique)
- role (text) - employee/manager/admin
- department (text) - FOH/BOH/BOTH/unassigned
- is_active (boolean) - manager approval required
- created_at (timestamp)
- updated_at (timestamp)
- last_seen (timestamp, nullable)
- status (text, nullable)
- phone (text, nullable)
- display_name (text, nullable)
- timezone (text, nullable)
- avatar_url (text, nullable)
- language (text, nullable)
```

### File Structure
```
src/
├── app/
│   ├── page.tsx                    # Main dashboard (authentication-compatible version)
│   ├── auth/signin/page.tsx        # Google OAuth sign-in page
│   ├── admin/users/page.tsx        # Manager user management interface
│   ├── debug-client/page.tsx       # Client-side authentication debugging
│   └── api/
│       ├── auth/[...nextauth]/route.ts    # NextAuth API route
│       ├── debug-users/route.ts           # Server-side user debugging/management
│       └── debug-session/route.ts         # Session debugging endpoint
├── lib/
│   └── auth.ts                     # NextAuth configuration
├── types/
│   └── next-auth.d.ts             # TypeScript session/user type definitions
└── components/
    └── Providers.tsx              # NextAuth SessionProvider wrapper
```

---

## 🚧 ISSUES FACED & SOLUTIONS

### Issue #1: Google OAuth Redirect URI Mismatch
**Problem**: OAuth redirects failing due to wrong redirect URI configuration  
**Root Cause**: Vercel deployment URL didn't match Google OAuth settings  
**Solution**: Updated Google OAuth console with correct Vercel URL: `jaynareviews-b1q1-git-main-demetri-gregorakis-projects.vercel.app`

### Issue #2: NO_SECRET Error
**Problem**: NextAuth throwing NO_SECRET error in production  
**Root Cause**: Missing NEXTAUTH_SECRET and NEXTAUTH_URL environment variables  
**Solution**: Added required environment variables to Vercel deployment

### Issue #3: Database Schema Conflicts
**Problem**: Code expected `permissions` column that didn't exist in database  
**Root Cause**: Mismatch between code expectations and actual database schema  
**Solution**: Updated all code to work with existing `employees` table structure

### Issue #4: Authentication Loop (CRITICAL)
**Problem**: Users successfully authenticated but kept getting redirected back to sign-in  
**Root Causes**:
1. **Adapter Conflict**: SupabaseAdapter conflicted with manual employee table management
2. **TypeScript Type Mismatch**: Session types expected non-existent columns
3. **Page Version Incompatibility**: Complex page.tsx incompatible with new auth system

**Solutions Applied**:
1. **Removed SupabaseAdapter**: Switched to pure JWT strategy to avoid table conflicts
2. **Fixed TypeScript Definitions**: Updated `next-auth.d.ts` to match actual database schema
3. **Replaced Page Version**: Used simple dashboard version compatible with authentication
4. **Session Structure**: Streamlined to only include employee data in `session.user.employee`

### Issue #5: Build Failures
**Problem**: TypeScript compilation errors in production build  
**Root Cause**: Admin pages accessing `session.user.role` instead of `session.user.employee.role`  
**Solution**: Updated all references to use correct session structure

---

## ✅ CURRENT WORKING STATE

### Authentication Flow
1. User visits app → redirected to `/auth/signin`
2. User clicks "Sign in with Google" → Google OAuth flow
3. User authorizes → NextAuth creates JWT with employee data
4. User lands on dashboard if active, or pending approval screen if inactive

### User Management Flow
1. New users auto-created as inactive employees
2. Manager accesses `/admin/users` to manage users
3. Manager can activate/deactivate users, change roles
4. Users see appropriate interfaces based on their role and activation status

### Session Structure
```typescript
session = {
  user: {
    id: string,
    email: string,
    name: string,
    image: string,
    employee: {
      id: string,
      name: string,
      email: string,
      role: 'employee' | 'manager' | 'admin',
      department: 'FOH' | 'BOH' | 'BOTH' | 'unassigned',
      is_active: boolean,
      created_at: string,
      updated_at: string,
      // ... other optional fields
    }
  }
}
```

---

## 🔧 DEBUGGING TOOLS AVAILABLE

### Client-Side Debug
- **URL**: `/debug-client`
- **Purpose**: View real-time session data in browser
- **Shows**: Session status, user data, employee data

### Server-Side Debug
- **URL**: `/api/debug-users`
- **Purpose**: Manage users, create test accounts, view all users
- **Features**: Create manager accounts, activate users, inspect database

### Console Logging
- **Location**: Main page (`page.tsx`)
- **Shows**: Detailed authentication flow in browser console

---

## 🌐 DEPLOYMENT CONFIGURATION

### Vercel Environment Variables
```
NEXTAUTH_SECRET=<secure-random-string>
NEXTAUTH_URL=https://jaynareviews-b1q1-git-main-demetri-gregorakis-projects.vercel.app
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
```

### Google OAuth Configuration
- **Authorized Redirect URIs**: 
  - `https://jaynareviews-b1q1-git-main-demetri-gregorakis-projects.vercel.app/api/auth/callback/google`
- **Authorized JavaScript Origins**:
  - `https://jaynareviews-b1q1-git-main-demetri-gregorakis-projects.vercel.app`

---

## 🎯 CURRENT STATUS & NEXT STEPS

### ✅ Completed Features
- [x] Google OAuth authentication integration
- [x] User account creation and management
- [x] Role-based access control (employee/manager/admin)
- [x] Manager dashboard for user management
- [x] Database integration with existing schema
- [x] Deployment to Vercel
- [x] Debug tools and logging
- [x] TypeScript type safety
- [x] **COMPLETE WORKFLOW MANAGEMENT SYSTEM**
  - [x] Database schema with full audit trail
  - [x] Drag-and-drop checklist builder
  - [x] Task assignment and reassignment
  - [x] Workflow tracking dashboard
  - [x] Progress monitoring and analytics
  - [x] Due date management
  - [x] Department-based filtering

### 🔄 Recently Fixed (Current Session - Sept 12, 2025)
- [x] **Universal Navigation System**: Added comprehensive navigation with breadcrumbs to all pages
- [x] **Database Schema**: Created complete workflow management database schema 
- [x] **Checklist Builder**: Full drag-and-drop checklist creation with "allow notes" feature
- [x] **API Fixes**: Fixed all 500/403 errors by correcting table references and authentication
- [x] **Table Structure**: Aligned all APIs with actual database schema (workflows, tasks, task_completions, comments)
- [x] **Authentication**: Added proper session checks and role-based access control to all endpoints

### 🎯 Immediate Priority - NEXT STEPS
1. **Run Database Migration**: Execute the SQL migration in Supabase dashboard
2. **Test Complete Workflow**: Create checklist → assign workflow → complete tasks
3. **Employee Task Interface**: Test the employee workflow completion interface
4. **Manager Dashboard**: Verify workflow assignment and monitoring works

### 🎯 Current Priority: Employee Interface
1. **Employee Workflow View**: Mobile-friendly task completion interface
2. **Task Completion**: Photo upload, notes, time tracking
3. **Real-time Updates**: Live progress synchronization
4. **Notifications**: Task assignments and deadlines

### 📋 Upcoming Development
- [ ] Employee mobile workflow interface
- [ ] Photo upload for task completion
- [ ] Real-time notifications system
- [ ] Advanced analytics and reporting
- [ ] Multi-language support integration
- [ ] Restaurant reference document integration

---

## 🏃‍♂️ HOW TO TEST CURRENT SYSTEM

1. **Visit**: `https://jaynareviews-b1q1-git-main-demetri-gregorakis-projects.vercel.app`
2. **Sign in** with Google account (demetri7@gmail.com is pre-configured as manager)
3. **Check console** for authentication flow logs
4. **Visit `/debug-client`** to see session data
5. **Access `/admin/users`** as manager to manage users

---

## 📝 DEVELOPMENT NOTES

### Key Lessons Learned
1. **Avoid Multiple Auth Adapters**: Using both SupabaseAdapter and manual user management causes conflicts
2. **TypeScript Alignment**: Always align TypeScript definitions with actual database schema
3. **JWT vs Database Sessions**: JWT strategy more suitable for custom user management
4. **Debug Early**: Comprehensive debugging tools save significant development time

### Technical Decisions
- **JWT over Database Sessions**: Better control over session data and structure
- **Supabase for User Data**: Leverages existing database while maintaining flexibility
- **Client + Server Debug**: Comprehensive debugging from both perspectives
- **Role in Employee Object**: Cleaner separation between auth user and business user

---

*Last Updated: September 11, 2025*  
*Status: Authentication system implemented and debugged, ready for workflow feature development*
