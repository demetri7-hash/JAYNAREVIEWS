import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { UserProvider } from '@/contexts/UserContext'

export const metadata: Metadata = {
  title: 'The Pass - Jayna Gyro Collaborative Workspace',
  description: 'Slack-style collaborative workspace for Jayna Gyro operations and workflows',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-pass-dark text-pass-text">
        <UserProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </UserProvider>
      </body>
    </html>
  )
}
