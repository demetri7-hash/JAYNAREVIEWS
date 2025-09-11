import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { SupabaseAdapter } from '@next-auth/supabase-adapter'
import { createClient } from '@supabase/supabase-js'

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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
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
      if (user) {
        // Fetch employee data
        const { data: employee } = await supabase
          .from('employees')
          .select('*')
          .eq('email', user.email)
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
