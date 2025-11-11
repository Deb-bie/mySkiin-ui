import './globals.css'
import type { Metadata } from 'next'
import { AppProvider } from './context/AppContext'

export const metadata: Metadata = {
  title: 'mySkiin Admin Dashboard',
  description: 'Admin Dashboard for managing mySkiin App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
