import React from 'react'
import Navigation from '@/components/layout/Navigation'
import { TranslationProvider } from '@/context/TranslationContext'

interface LayoutProps {
  children: React.ReactNode
  user?: any
  notifications?: number
  showNavigation?: boolean
}

export default function Layout({ 
  children, 
  user, 
  notifications = 0, 
  showNavigation = true 
}: LayoutProps) {
  return (
    <TranslationProvider>
      <div className="min-h-screen bg-gray-50">
        {showNavigation && (
          <Navigation user={user} notifications={notifications} />
        )}
        
        <main className={showNavigation ? '' : 'pt-0'}>
          {children}
        </main>
      </div>
    </TranslationProvider>
  )
}