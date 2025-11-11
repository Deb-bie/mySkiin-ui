'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import NotificationPanel from '../components/NotificationPanel'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isAuth = localStorage.getItem('isAuthenticated')
    if (!isAuth) {
      router.push('/')
    }
  }, [router])

  if (!mounted) return null

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onNotificationClick={() => setShowNotifications(!showNotifications)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <NotificationPanel 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  )
}
