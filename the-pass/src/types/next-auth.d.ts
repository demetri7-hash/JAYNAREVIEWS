import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      department: string
      is_active: boolean
      permissions: string[]
      employee?: {
        id: string
        name: string
        email: string
        role: string
        department: string
        shift_preference: string
        permissions: string[]
        is_active: boolean
        created_at: string
        updated_at: string
      }
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role?: string
    department?: string
    is_active?: boolean
    permissions?: string[]
    employee?: {
      id: string
      name: string
      email: string
      role: string
      department: string
      shift_preference: string
      permissions: string[]
      is_active: boolean
      created_at: string
      updated_at: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role?: string
    department?: string
    is_active?: boolean
    permissions?: string[]
    employee?: {
      id: string
      name: string
      email: string
      role: string
      department: string
      shift_preference: string
      permissions: string[]
      is_active: boolean
      created_at: string
      updated_at: string
    }
  }
}
