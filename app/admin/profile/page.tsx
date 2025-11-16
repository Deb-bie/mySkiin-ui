'use client'
import { useState, useEffect } from 'react'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Super Administrator',
    phone: '+1 (555) 123-4567',
    department: 'Management',
    joinDate: '2024-01-15',
    lastLogin: new Date().toISOString().split('T')[0],
    bio: 'Experienced administrator managing the platform and its users.',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(profile)

  useEffect(() => {
    const email = localStorage.getItem('adminEmail') || 'admin@example.com'
    setProfile({ ...profile, email })
    setEditForm({ ...profile, email })
  }, [])


  const stats = [
    { label: 'Total Logins', value: '1,247', icon: '🔐' },
    { label: 'Users Managed', value: '1,248', icon: '👥' },
    { label: 'Products Added', value: '89', icon: '📝' },
    { label: 'Active Days', value: '298', icon: '📅' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-32 h-32 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-4xl font-bold">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-indigo-600 font-medium">{profile.role}</p>
              <p className="text-sm text-gray-600 mt-1">{profile.email}</p>
            </div>

            <div className="space-y-3 border-t pt-4">
      
              
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-700">Joined {profile.joinDate}</span>
              </div>
            </div>

           
          </div>
        </div>

        {/* Details & Stats */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-4">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: 'Created new post "Welcome to our platform"', time: '2 hours ago' },
                { action: 'Updated user permissions for John Doe', time: '5 hours ago' },
                { action: 'Deleted spam post', time: '1 day ago' },
                { action: 'Exported user data report', time: '2 days ago' },

              ].map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-4 border-b last:border-0">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}