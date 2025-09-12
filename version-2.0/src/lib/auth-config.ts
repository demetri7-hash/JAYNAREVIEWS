import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { DatabaseService, type User } from './database'

// Create Supabase client for NextAuth
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  
  providers: [
    // Email/Password authentication
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        action: { label: 'Action', type: 'text' }, // 'signin' or 'signup'
        firstName: { label: 'First Name', type: 'text' },
        lastName: { label: 'Last Name', type: 'text' },
        employeeId: { label: 'Employee ID', type: 'text' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const { email, password, action } = credentials

        try {
          if (action === 'signup') {
            // Registration flow
            const { firstName, lastName, employeeId, role } = credentials
            
            if (!firstName || !lastName) {
              throw new Error('First name and last name are required')
            }

            // Check if user already exists
            const { data: existingUser } = await DatabaseService.users.getByEmail(email)
            if (existingUser) {
              throw new Error('User already exists with this email')
            }

            // Create user account in Supabase Auth (includes password)
            const { data: authData, error: authError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  first_name: firstName,
                  last_name: lastName,
                  employee_id: employeeId,
                  role: role || 'employee'
                }
              }
            })

            if (authError) throw authError

            // Create user profile in our users table
            const { data: newUser, error } = await DatabaseService.users.create({
              id: authData.user?.id || crypto.randomUUID(),
              email,
              first_name: firstName,
              last_name: lastName,
              employee_id: employeeId,
              role: (role as User['role']) || 'employee',
              preferred_language: 'en',
              is_active: true
            })

            if (error || !newUser) {
              throw new Error('Failed to create user account')
            }

            return {
              id: newUser.id,
              email: newUser.email,
              name: `${newUser.first_name} ${newUser.last_name}`,
              role: newUser.role,
              employeeId: newUser.employee_id,
              preferredLanguage: newUser.preferred_language
            }
          } else {
            // Sign in flow
            const { data: user } = await DatabaseService.users.getByEmail(email)
            
            if (!user || !user.is_active) {
              throw new Error('Invalid credentials or account disabled')
            }

            // Verify password
            if (!user.encrypted_password) {
              throw new Error('Account not set up for password login')
            }

            const isValidPassword = await bcrypt.compare(password, user.encrypted_password)
            if (!isValidPassword) {
              throw new Error('Invalid credentials')
            }

            // Update last sign in
            await DatabaseService.users.update(user.id, {
              last_sign_in_at: new Date().toISOString()
            })

            return {
              id: user.id,
              email: user.email,
              name: `${user.first_name} ${user.last_name}`,
              role: user.role,
              employeeId: user.employee_id,
              preferredLanguage: user.preferred_language
            }
          }
        } catch (error) {
          console.error('Authentication error:', error)
          throw error
        }
      }
    }),

    // Google OAuth (optional)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
    updateAge: 60 * 60, // 1 hour
  },

  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Persist user data in JWT token
      if (user) {
        token.role = user.role
        token.employeeId = user.employee?.id
        token.preferredLanguage = user.employee?.language
      }

      // Handle OAuth sign-in
      if (account?.provider === 'google' && user?.email) {
        try {
          // Check if user exists in our database
          const { data: existingUser } = await DatabaseService.users.getByEmail(user.email)
          
          if (existingUser) {
            // Update existing user
            token.role = existingUser.role
            token.employeeId = existingUser.employee_id
            token.preferredLanguage = existingUser.preferred_language
            
            await DatabaseService.users.update(existingUser.id, {
              last_sign_in_at: new Date().toISOString(),
              avatar_url: user.image || undefined
            })
          } else {
            // Create new user from Google account
            const nameParts = user.name?.split(' ') || []
            const firstName = nameParts[0] || 'Unknown'
            const lastName = nameParts.slice(1).join(' ') || 'User'

            const { data: newUser } = await DatabaseService.users.create({
              email: user.email,
              first_name: firstName,
              last_name: lastName,
              avatar_url: user.image || undefined,
              role: 'employee', // Default role
              preferred_language: 'en',
              is_active: true
            })

            if (newUser) {
              token.role = newUser.role
              token.employeeId = newUser.employee_id
              token.preferredLanguage = newUser.preferred_language
            }
          }
        } catch (error) {
          console.error('Error handling Google sign-in:', error)
        }
      }

      return token
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.sub!
        // Store employee data in the session if available
        if (token.role) {
          session.user.employee = {
            id: token.employeeId as string || '',
            name: session.user.name || '',
            email: session.user.email || '',
            role: token.role as string,
            department: 'general', // Default department
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            language: token.preferredLanguage as string || 'en'
          }
        }
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful authentication
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    }
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  events: {
    async signIn({ user, account, profile }) {
      // Log authentication events
      await DatabaseService.audit.log({
        user_id: user.id,
        action: 'user_signin',
        table_name: 'users',
        record_id: user.id,
        new_values: {
          provider: account?.provider,
          timestamp: new Date().toISOString()
        }
      })
    },

    async signOut({ token }) {
      // Log sign out events
      if (token?.sub) {
        await DatabaseService.audit.log({
          user_id: token.sub,
          action: 'user_signout',
          table_name: 'users',
          record_id: token.sub,
          new_values: {
            timestamp: new Date().toISOString()
          }
        })
      }
    }
  },

  debug: process.env.NODE_ENV === 'development',
}

// Role-based access control helpers
export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    'employee': 0,
    'shift_lead': 1,
    'manager': 2,
    'admin': 3
  }

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] ?? -1
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] ?? 999

  return userLevel >= requiredLevel
}

export const requireAuth = (requiredRole: string = 'employee') => {
  return (req: any, res: any, next: any) => {
    const session = req.session
    
    if (!session?.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (!hasPermission(session.user.role, requiredRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    next()
  }
}

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}