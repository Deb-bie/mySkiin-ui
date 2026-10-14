'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useAppState } from '../../hooks/useAppState'
import UsersAccessNotice from '../../components/UsersAccessNotice'
import {
  formatDate, initials, timeAgo, userEmail, userJoined, userLastActive, userName, userPlan, userSkinTypes,
} from '../../lib/userFields'
import { User } from '../../models/model'

export default function UsersPage() {
  const { state, loadUsers } = useAppState()
  const [searchTerm, setSearchTerm] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [skinFilter, setSkinFilter] = useState('all')

  const plans = useMemo(() => Array.from(new Set(state.users.map(userPlan))).sort(), [state.users])
  const skinTypes = useMemo(() => Array.from(new Set(state.users.flatMap(userSkinTypes))).sort(), [state.users])

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return state.users.filter(u => {
      const matchesSearch = !q || userName(u).toLowerCase().includes(q) || userEmail(u).toLowerCase().includes(q) || u.id.toLowerCase().includes(q)
      const matchesPlan = planFilter === 'all' || userPlan(u) === planFilter
      const matchesSkin = skinFilter === 'all' || userSkinTypes(u).includes(skinFilter)
      return matchesSearch && matchesPlan && matchesSkin
    })
  }, [state.users, searchTerm, planFilter, skinFilter])

  const exportCsv = (rows: User[]) => {
    const header = ['User ID', 'Name', 'Email', 'Plan', 'Skin type', 'Joined', 'Last active']
    const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
    const lines = rows.map(u => [
      u.id, userName(u), userEmail(u), userPlan(u), userSkinTypes(u).join('; '),
      userJoined(u)?.toISOString() ?? '', userLastActive(u)?.toISOString() ?? '',
    ].map(esc).join(','))
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `myskiin-users-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <div className="flex gap-2">
          <button onClick={() => loadUsers()} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition">Refresh</button>
          <button onClick={() => exportCsv(filteredUsers)} disabled={!filteredUsers.length}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
            Export CSV
          </button>
        </div>
      </div>

      <UsersAccessNotice />

      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <input type="text" placeholder="Search by name, email or user ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="all">All plans ({state.users.length})</option>
          {plans.map(p => <option key={p} value={p}>{p} ({state.users.filter(u => userPlan(u) === p).length})</option>)}
        </select>
        <select value={skinFilter} onChange={e => setSkinFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="all">All skin types</option>
          {skinTypes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['User', 'Plan', 'Skin type', 'Joined', 'Last active', ''].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map(u => {
              const plan = userPlan(u)
              return (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <Link href={`/admin/users/${u.id}`} className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                        {initials(userName(u))}
                      </div>
                      <div className="ml-4 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{userName(u)}</div>
                        <div className="text-sm text-gray-500 truncate">{userEmail(u) || u.id}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${plan === 'Premium' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      {plan === 'Premium' ? '💎 ' : ''}{plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{userSkinTypes(u).join(', ') || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(userJoined(u))}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{timeAgo(userLastActive(u))}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <Link href={`/admin/users/${u.id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!filteredUsers.length && (
          <p className="p-10 text-center text-gray-500 text-sm">
            {!state.usersLoaded ? 'Loading users…' : state.usersError ? 'User data unavailable.' : state.users.length ? 'No users match these filters.' : 'No users yet.'}
          </p>
        )}
      </div>
      <p className="text-xs text-gray-500">Showing {filteredUsers.length} of {state.users.length} users. Users are managed in the mobile app; the dashboard has read-only access.</p>
    </div>
  )
}
