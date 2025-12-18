'use client'
import { useState } from 'react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      weeklyReport: true,
      userSignups: true,
      postCreated: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '30',
      loginAlerts: true,
    },
    preferences: {
      language: 'en',
      timezone: 'UTC-5',
      dateFormat: 'MM/DD/YYYY',
      theme: 'light',
    },
    system: {
      maintenanceMode: false,
      allowSignups: true,
      moderateComments: true,
    }
  })

  const [showSaveMessage, setShowSaveMessage] = useState(false)

  const handleSave = () => {
    // In production, save to backend
    setShowSaveMessage(true)
    setTimeout(() => setShowSaveMessage(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        {showSaveMessage && (
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Settings saved successfully!
          </div>
        )}
      </div>

      {/* Notifications Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔔</span>
          Notifications
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => setSettings({
                ...settings,
                notifications: {...settings.notifications, emailNotifications: e.target.checked}
              })}
              className="w-5 h-5 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-600">Receive push notifications in browser</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.pushNotifications}
              onChange={(e) => setSettings({
                ...settings,
                notifications: {...settings.notifications, pushNotifications: e.target.checked}
              })}
              className="w-5 h-5 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Weekly Report</p>
              <p className="text-sm text-gray-600">Get weekly analytics report</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.weeklyReport}
              onChange={(e) => setSettings({
                ...settings,
                notifications: {...settings.notifications, weeklyReport: e.target.checked}
              })}
              className="w-5 h-5 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">New User Signups</p>
              <p className="text-sm text-gray-600">Notify when new users register</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.userSignups}
              onChange={(e) => setSettings({
                ...settings,
                notifications: {...settings.notifications, userSignups: e.target.checked}
              })}
              className="w-5 h-5 text-indigo-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔒</span>
          Security
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Add extra layer of security</p>
            </div>
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => setSettings({
                ...settings,
                security: {...settings.security, twoFactorAuth: e.target.checked}
              })}
              className="w-5 h-5 text-indigo-600 rounded"
            />
          </label>

          <div>
            <label className="block font-medium text-gray-900 mb-2">Session Timeout (minutes)</label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => setSettings({
                ...settings,
                security: {...settings.security, sessionTimeout: e.target.value}
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Login Alerts</p>
              <p className="text-sm text-gray-600">Get notified of new login attempts</p>
            </div>
            <input
              type="checkbox"
              checked={settings.security.loginAlerts}
              onChange={(e) => setSettings({
                ...settings,
                security: {...settings.security, loginAlerts: e.target.checked}
              })}
              className="w-5 h-5 text-indigo-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          Preferences
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-900 mb-2">Language</label>
            <select
              value={settings.preferences.language}
              onChange={(e) => setSettings({
                ...settings,
                preferences: {...settings.preferences, language: e.target.value}
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-2">Timezone</label>
            <select
              value={settings.preferences.timezone}
              onChange={(e) => setSettings({
                ...settings,
                preferences: {...settings.preferences, timezone: e.target.value}
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="UTC-8">Pacific Time (UTC-8)</option>
              <option value="UTC-5">Eastern Time (UTC-5)</option>
              <option value="UTC+0">UTC</option>
              <option value="UTC+1">Central European Time (UTC+1)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-2">Date Format</label>
            <select
              value={settings.preferences.dateFormat}
              onChange={(e) => setSettings({
                ...settings,
                preferences: {...settings.preferences, dateFormat: e.target.value}
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-2">Theme</label>
            <select
              value={settings.preferences.theme}
              onChange={(e) => setSettings({
                ...settings,
                preferences: {...settings.preferences, theme: e.target.value}
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🖥️</span>
          System
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Maintenance Mode</p>
              <p className="text-sm text-gray-600">Temporarily disable the platform</p>
            </div>
            <input
              type="checkbox"
              checked={settings.system.maintenanceMode}
              onChange={(e) => setSettings({
                ...settings,
                system: {...settings.system, maintenanceMode: e.target.checked}
              })}
              className="w-5 h-5 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Allow New Signups</p>
              <p className="text-sm text-gray-600">Enable user registration</p>
            </div>
            <input
              type="checkbox"
              checked={settings.system.allowSignups}
              onChange={(e) => setSettings({
                ...settings,
                system: {...settings.system, allowSignups: e.target.checked}
              })}
              className="w-5 h-5 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Moderate Comments</p>
              <p className="text-sm text-gray-600">Require approval for comments</p>
            </div>
            <input
              type="checkbox"
              checked={settings.system.moderateComments}
              onChange={(e) => setSettings({
                ...settings,
                system: {...settings.system, moderateComments: e.target.checked}
              })}
              className="w-5 h-5 text-indigo-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold">
          Reset to Defaults
        </button>
        <button 
          onClick={handleSave}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
