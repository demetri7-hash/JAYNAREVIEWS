'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email?: string
  department: 'FOH' | 'BOH' | 'BOTH'
  role: string
  language: 'en' | 'es' | 'tr'
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const setUser = (newUser: User | null) => {
    setUserState(newUser)
    if (newUser) {
      localStorage.setItem('the-pass-user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('the-pass-user')
    }
  }

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('the-pass-user')
      if (stored) {
        setUserState(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading user from storage:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
