'use client'
import Link from 'next/link'
import { useMemo } from 'react'
import { useAppState } from '../hooks/useAppState'
import { BarList, Card, ColumnChart, Meter, StatTile } from '../components/charts'
import { catalogSummary, userSummary, weeklySignups } from '../lib/analytics'
import { initials, timeAgo, userEmail, userJoined, userName } from '../lib/userFields'
import UsersAccessNotice from '../components/UsersAccessNotice'

export default function DashboardPage() {
  const { state, refreshAll } = useAppState()
  const users = useMemo(() => userSummary(state.users), [state.users])
  const catalog = useMemo(() => catalogSummary(state.products, state.brands), [state.products, state.brands])
  const signups = useMemo(() => weeklySignups(state.users, 12), [state.users])
  const usersReady = state.usersLoaded && !state.usersError
  const dash = (v: number | null) => (usersReady && v != null ? v : '—')

  const recentUsers = state.users.slice(0, 5)
  const recentProducts = state.products.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button onClick={() => refreshAll()} className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-white text-gray-700">
          {state.loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <UsersAccessNotice />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatTile title="Total users" value={dash(users.total)} icon="👥" sub={usersReady ? `${users.new30} joined in 30 days` : undefined} />
        <StatTile title="New this week" value={dash(users.new7)} icon="✨" />
        <StatTile title="Active (7 days)" value={dash(users.active7)} icon="🟢"
          sub={usersReady && users.active7 == null ? 'No last-active field found' : undefined} />
        <StatTile title="Premium users" value={dash(users.premium)} icon="💎"
          sub={usersReady && users.premium == null ? 'No plan field found' : undefined} />
        <StatTile title="Products" value={catalog.products} icon="🧴" />
        <StatTile title="Brands" value={catalog.brands} icon="🏷️" sub={catalog.brandsWithoutProducts ? `${catalog.brandsWithoutProducts} with no products` : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Sign-ups per week" subtitle="Last 12 weeks, from each user's join date">
          <ColumnChart data={usersReady ? signups : []} empty={usersReady ? 'No sign-up dates found yet' : 'User data unavailable'} />
        </Card>
        <Card title="Catalog completeness" subtitle={`Share of ${catalog.products.toLocaleString()} products with each field filled in`}>
          <div className="space-y-3">
            {catalog.completeness.map(c => <Meter key={c.label} label={c.label} value={c.value} total={catalog.products} />)}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Newest users">
          {recentUsers.length ? (
            <ul className="divide-y">
              {recentUsers.map(u => (
                <li key={u.id}>
                  <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 py-2.5 hover:bg-gray-50 rounded -mx-2 px-2">
                    <span className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">{initials(userName(u))}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-gray-900 truncate">{userName(u)}</span>
                      <span className="block text-xs text-gray-500 truncate">{userEmail(u)}</span>
                    </span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo(userJoined(u))}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-400 py-6 text-center">{usersReady ? 'No users yet' : 'User data unavailable'}</p>}
        </Card>

        <Card title="Products by category">
          <BarList data={catalog.byCategory.slice(0, 8)} />
        </Card>

        <Card title="Recently added products">
          {recentProducts.length ? (
            <ul className="divide-y">
              {recentProducts.map(p => (
                <li key={p.id}>
                  <Link href={`/admin/products/${p.id}`} className="block py-2.5 hover:bg-gray-50 rounded -mx-2 px-2">
                    <span className="block text-sm font-medium text-gray-900 truncate">{p.name}</span>
                    <span className="block text-xs text-gray-500 truncate">{p.brandName} · {(p.categoryNames ?? []).join(', ')}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 py-6 text-center">
              No products yet. <Link href="/admin/import" className="text-indigo-600 hover:underline">Import a file</Link>
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
