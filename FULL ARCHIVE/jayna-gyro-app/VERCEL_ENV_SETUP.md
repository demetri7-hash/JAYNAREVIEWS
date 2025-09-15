# Environment Variables Setup for Vercel

## Required Environment Variables

To deploy the Jayna Gyro app to Vercel, you need to set these environment variables in your Vercel dashboard:

### 1. Supabase URL
```
NEXT_PUBLIC_SUPABASE_URL=https://xedpssqxgmnwufatyoje.supabase.co
```

### 2. Supabase Anonymous Key
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODI4OTYsImV4cCI6MjA3Mjg1ODg5Nn0.8Itnr8BcsBkD-Gnr_9LTwJcJ_3nnoHZAonfMFKcB3LE
```

### 3. Supabase Service Role Key (Optional but recommended for full functionality)
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s
```

## How to Set in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Add each variable:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://xedpssqxgmnwufatyoje.supabase.co`
   - Environment: All (Production, Preview, Development)

5. Repeat for all three variables
6. Redeploy your app

## Verification

Once set, your app should load without the "supabaseKey is required" error.

⚠️ **IMPORTANT**: Make sure all variable names match exactly, including the `NEXT_PUBLIC_` prefix for client-side variables.
