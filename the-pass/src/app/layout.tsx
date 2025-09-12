import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { UserProvider } from '@/contexts/UserContext'
import { Providers } from '@/components/Providers'
import Navigation from '@/components/Navigation'

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
      <body className="bg-gray-50 text-gray-900">
        <Providers>
          <UserProvider>
            <LanguageProvider>
              <Navigation />
              <main>
                {children}
              </main>
            </LanguageProvider>
          </UserProvider>
        </Providers>
      </body>
    </html>
  )
}
