'use client'
import { useState } from 'react'

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications] = useState([
    { id: 1, type: 'user', message: 'New user registration: John Doe', time: '2 minutes ago', read: false },
    { id: 2, type: 'payment', message: 'Payment received: $99.00', time: '15 minutes ago', read: false },
    { id: 3, type: 'system', message: 'System backup completed', time: '1 hour ago', read: true },
    { id: 4, type: 'user', message: 'User upgraded to premium', time: '2 hours ago', read: true },
    { id: 5, type: 'alert', message: 'High server load detected', time: '3 hours ago', read: true },
  ])

  if (!isOpen) return null

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'user': return '👤'
      case 'payment': return '💰'
      case 'system': return '⚙️'
      case 'alert': return '⚠️'
      default: return '📢'
    }
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-opacity-30 z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {notifications.filter(n => !n.read).length} unread notifications
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
                !notification.read ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="flex gap-3">
                <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1">
                  <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition font-semibold text-sm">
            Mark All as Read
          </button>
        </div>
      </div>
    </>
  )
}