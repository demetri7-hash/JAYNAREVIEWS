import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: 'manager' | 'employee'
    } & DefaultSession['user']
  }

  interface User {
    role: 'manager' | 'employee'
  }
}