# The Pass - Current Working Configuration Backup
## September 11, 2025

This document contains the current working configuration of all critical files for backup and reference purposes.

---

## 🔐 Authentication Configuration (`src/lib/auth.ts`)

```typescript
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if employee exists with this email
          const { data: employee, error } = await supabase
            .from('employees')
            .select('*')
            .eq('email', user.email)
            .single()

          if (error && error.code !== 'PGRST116') {
            console.error('Error checking employee:', error)
            return false
          }

          if (!employee) {
            // Create new employee record
            const { error: insertError } = await supabase
              .from('employees')
              .insert({
                name: user.name || '',
                email: user.email || '',
                role: 'employee',
                department: 'unassigned',
                is_active: false, // Requires manager approval
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (insertError) {
              console.error('Error creating employee:', insertError)
              return false
            }
          }

          return true
        } catch (error) {
          console.error('SignIn callback error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      // Always fetch employee data to get current status
      const email = user?.email || token.email
      if (email) {
        const { data: employee } = await supabase
          .from('employees')
          .select('*')
          .eq('email', email)
          .single()

        if (employee) {
          token.employee = employee
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.employee) {
        session.user.employee = token.employee
      }
      return session
    },
  },
}
```

---

## 📝 TypeScript Definitions (`src/types/next-auth.d.ts`)

```typescript
import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      employee?: {
        id: string
        name: string
        email: string
        role: string
        department: string
        is_active: boolean
        created_at: string
        updated_at: string
        last_seen?: string
        status?: string
        phone?: string
        display_name?: string
        timezone?: string
        avatar_url?: string
        language?: string
      }
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role?: string
    department?: string
    is_active?: boolean
    employee?: {
      id: string
      name: string
      email: string
      role: string
      department: string
      is_active: boolean
      created_at: string
      updated_at: string
      last_seen?: string
      status?: string
      phone?: string
      display_name?: string
      timezone?: string
      avatar_url?: string
      language?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role?: string
    department?: string
    is_active?: boolean
    employee?: {
      id: string
      name: string
      email: string
      role: string
      department: string
      is_active: boolean
      created_at: string
      updated_at: string
      last_seen?: string
      status?: string
      phone?: string
      display_name?: string
      timezone?: string
      avatar_url?: string
      language?: string
    }
  }
}
```

---

## 🏠 Main Dashboard (`src/app/page.tsx` - Key Sections)

### Authentication Check Logic
```typescript
useEffect(() => {
  console.log('=== PAGE USEEFFECT DEBUG ===')
  console.log('Status:', status)
  console.log('Session:', session)
  console.log('Session user:', session?.user)
  console.log('Session user employee:', session?.user?.employee)
  console.log('Employee is_active:', session?.user?.employee?.is_active)
  console.log('=== END DEBUG ===')
  
  if (status === 'loading') return
  
  if (!session) {
    console.log('No session, redirecting to signin')
    router.push('/auth/signin')
    return
  }

  // Check if user account is activated
  if (session.user?.employee && !session.user.employee.is_active) {
    console.log('User has employee record but is not active')
    return // Show pending approval message
  }
  
  console.log('User is authenticated and active')
}, [session, status, router])
```

### Inactive User Screen
```typescript
if (!session.user?.employee?.is_active) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
          <Settings className="h-6 w-6 text-yellow-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Account Pending Approval
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Your account has been created but needs to be activated by a manager before you can access the system.
        </p>
        <button
          onClick={() => router.push('/auth/signin')}
          className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
```

---

## 👥 Admin Users Page (`src/app/admin/users/page.tsx` - Key Logic)

### Manager Permission Check
```typescript
// Check if user has manager permissions
if (session.user?.employee?.role !== 'manager' && session.user?.employee?.role !== 'admin') {
  router.push('/')
  return
}
```

---

## 🔍 Debug Endpoints

### User Management Debug (`/api/debug-users`)
- **Purpose**: Server-side user management and debugging
- **Features**: List users, create manager accounts, activate users
- **Key Function**: Create demetri7@gmail.com as manager for testing

### Session Debug (`/api/debug-session`)
- **Purpose**: Server-side session inspection
- **Note**: Blocked by Vercel deployment protection in production

### Client Debug (`/debug-client`)
- **Purpose**: Client-side real-time session debugging
- **Shows**: Live session data, authentication status, employee information

---

## 🌐 Environment Variables (Vercel)

```
NEXTAUTH_SECRET=<secure-random-string>
NEXTAUTH_URL=https://jaynareviews-b1q1-git-main-demetri-gregorakis-projects.vercel.app
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
```

---

## 🗄️ Database Schema (Supabase)

```sql
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'admin')),
  department TEXT DEFAULT 'unassigned' CHECK (department IN ('FOH', 'BOH', 'BOTH', 'unassigned')),
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ,
  status TEXT,
  phone TEXT,
  display_name TEXT,
  timezone TEXT DEFAULT 'America/Los_Angeles',
  avatar_url TEXT,
  language TEXT DEFAULT 'en'
);
```

---

## 🚀 Deployment Notes

### Build Status: ✅ PASSING
- No TypeScript errors
- All imports resolved
- Session structure aligned
- Authentication flow complete

### Last Successful Deploy: September 11, 2025
- Commit: `71fa109d` - "Fix TypeScript error in admin users page"
- Status: All authentication issues resolved
- Ready for: User testing and workflow feature development

---

*This backup point represents a fully functional authentication system ready for production use and further feature development.*
