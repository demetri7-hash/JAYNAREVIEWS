# 🔐 EXTRACTED CREDENTIALS & CONFIGURATION
**Date**: September 15, 2025
**Purpose**: Preserve all working credentials before cleanup

## 🗄️ SUPABASE DATABASE
**Project URL**: https://xedpssqxgmnwufatyoje.supabase.co
**Database Name**: xedpssqxgmnwufatyoje

### Environment Variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xedpssqxgmnwufatyoje.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODI4OTYsImV4cCI6MjA3Mjg1ODg5Nn0.8Itnr8BcsBkD-Gnr_9LTwJcJ_3nnoHZAonfMFKcB3LE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s
```

## 🚀 VERCEL DEPLOYMENT
**Active URL**: https://jaynareviews-b1q1-git-main-demetri-gregorakis-projects.vercel.app
**Project**: jaynareviews
**GitHub Repo**: demetri7-hash/JAYNAREVIEWS

### Vercel Environment Variables (Already Configured):
- NEXT_PUBLIC_SUPABASE_URL ✅
- NEXT_PUBLIC_SUPABASE_ANON_KEY ✅
- SUPABASE_SERVICE_ROLE_KEY ✅

## Google OAuth Configuration

- **Google Cloud Project**: jayna-reviews  
- **OAuth 2.0 Client ID**: [REDACTED - Available in .env.local]
- **OAuth 2.0 Client Secret**: [REDACTED - Available in .env.local]
- **Authorized redirect URIs**:
  - http://localhost:3000/api/auth/callback/google
  - https://jaynareviews-b1q1-git-main-demetri-gregorakis-projects.vercel.app/api/auth/callback/google

## 📝 TODO: Get Missing Google OAuth Credentials
1. Go to Google Cloud Console
2. Find your existing OAuth project (likely already setup)
3. Get Client ID and Client Secret
4. Generate new NextAuth secret: `openssl rand -base64 32`

## 🎯 CLEANUP PLAN
1. Keep this credentials file safe
2. Delete all FULL ARCHIVE folders and old projects
3. Reset Supabase database (keep credentials)
4. Create fresh Next.js project
5. Use existing Vercel deployment
6. Configure Google OAuth with new project

## ⚠️ IMPORTANT NOTES
- Supabase project is ACTIVE and WORKING
- Vercel deployment is ACTIVE and WORKING
- Just need to clean up the code and start fresh
- Google OAuth setup exists with credentials stored securely in .env.local