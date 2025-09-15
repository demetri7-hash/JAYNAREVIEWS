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
