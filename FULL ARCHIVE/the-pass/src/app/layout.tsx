import type { Metadata } from 'next'import type { Metadata } from 'next'import type { Metadata, Viewport } from 'next'



export const metadata: Metadata = {import './globals.css'

  title: 'Test App',

  description: 'Simple test app',export const metadata: Metadata = {import { TranslationProvider } from '@/context/TranslationContext'

}

  title: 'Test App',import { UserProvider } from '@/contexts/UserContext'

export default function RootLayout({

  children,  description: 'Simple test app',import { Providers } from '@/components/Providers'

}: {

  children: React.ReactNode}import Navigation from '@/components/layout/Navigation'

}) {

  return (import { NotificationProvider } from '@/components/NotificationProvider'

    <html lang="en">

      <body>{children}</body>export default function RootLayout({import { PWAProvider } from '@/components/PWAProvider'

    </html>

  )  children,import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'

}
}: {

  children: React.ReactNodeexport const metadata: Metadata = {

}) {  title: 'The Pass - Jayna Gyro Collaborative Workspace',

  return (  description: 'Slack-style collaborative workspace for Jayna Gyro operations and workflows',

    <html lang="en">  manifest: '/manifest.json',

      <body>{children}</body>  icons: {

    </html>    icon: [

  )      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },

}      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'The Pass'
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: 'website',
    siteName: 'The Pass',
    title: 'The Pass - Workflow Management',
    description: 'Restaurant workflow and task management system'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
  viewportFit: 'cover'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="The Pass" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className="bg-gray-50 text-gray-900 overflow-x-hidden">
        <PWAProvider>
          <Providers>
            <UserProvider>
              <TranslationProvider>
                <NotificationProvider>
                  <Navigation />
                  <main className="relative">
                    {children}
                  </main>
                  <PWAInstallPrompt />
                </NotificationProvider>
              </TranslationProvider>
            </UserProvider>
          </Providers>
        </PWAProvider>
      </body>
    </html>
  )
}
