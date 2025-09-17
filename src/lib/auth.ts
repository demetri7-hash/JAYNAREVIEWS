import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session }) {
      // Add user role to session
      if (session.user?.email) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('email', session.user.email)
          .single()
        
        session.user.role = profile?.role || 'employee'
      }
      return session
    },
    async signIn({ user }) {
      if (user?.email) {
        // Create or update user profile
        const { error } = await supabaseAdmin
          .from('profiles')
          .upsert({
            email: user.email,
            name: user.name || user.email,
            role: 'employee' // Default role, managers can be updated manually
          }, {
            onConflict: 'email'
          })
        
        if (error) {
          console.error('Error creating profile:', error)
          return false
        }
      }
      return true
    }
  },
  pages: {
    signIn: '/',
    error: '/', // Redirect errors back to homepage
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    }
  }
}