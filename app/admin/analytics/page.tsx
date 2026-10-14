'use client'
import { useMemo } from 'react'
import { useAppState } from '../../hooks/useAppState'
import { BarList, Card, ColumnChart, StatTile } from '../../components/charts'
import { catalogSummary, userSummary, weeklySignups } from '../../lib/analytics'
import UsersAccessNotice from '../../components/UsersAccessNotice'

export default function AnalyticsPage() {
  const { state } = useAppState()
  const users = useMemo(() => userSummary(state.users), [state.users])
  const catalog = useMemo(() => catalogSummary(state.products, state.brands), [state.products, state.brands])
  const signups = useMemo(() => weeklySignups(state.users, 26), [state.users])
  const usersReady = state.usersLoaded && !state.usersError
  const pct = (v: number | null, total: number) => (v == null || !total ? '—' : `${Math.round((v / total) * 100)}%`)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
        <p className="text-gray-600 mt-1">Calculated live from your Firestore users and catalog.</p>
      </div>

      <UsersAccessNotice />

      {/* USERS */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Users</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatTile title="Daily active" value={usersReady && users.active1 != null ? users.active1 : '—'} sub={usersReady ? `${pct(users.active1, users.total)} of users` : undefined} />
          <StatTile title="Weekly active" value={usersReady && users.active7 != null ? users.active7 : '—'} sub={usersReady ? `${pct(users.active7, users.total)} of users` : undefined} />
          <StatTile title="Monthly active" value={usersReady && users.active30 != null ? users.active30 : '—'} sub={usersReady ? `${pct(users.active30, users.total)} of users` : undefined} />
          <StatTile title="Completed skin profile" value={usersReady ? users.withSkinProfile : '—'} sub={usersReady ? `${pct(users.withSkinProfile, users.total)} of users` : undefined} />
        </div>

        <Card title="Sign-ups per week" subtitle="Last 26 weeks">
          <ColumnChart data={usersReady ? signups : []} height={200} empty={usersReady ? 'No sign-up dates found yet' : 'User data unavailable'} />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Skin types" subtitle="From users' skin profiles">
            <BarList data={users.skinTypes} empty={usersReady ? 'No skin types recorded' : 'User data unavailable'} />
          </Card>
          <Card title="Top concerns" subtitle="What users want to work on">
            <BarList data={users.concerns} empty={usersReady ? 'No concerns recorded' : 'User data unavailable'} />
          </Card>
          <Card title="Plans">
            <BarList data={users.plans} empty={usersReady ? 'No users yet' : 'User data unavailable'} />
          </Card>
          {users.skinTones.length > 0 && (
            <Card title="Skin tones"><BarList data={users.skinTones} /></Card>
          )}
          {users.experience.length > 0 && (
            <Card title="Experience level"><BarList data={users.experience} /></Card>
          )}
        </div>
      </section>

      {/* CATALOG */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Catalog</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatTile title="Products" value={catalog.products} />
          <StatTile title="Brands" value={catalog.brands} sub={catalog.brandsWithoutProducts ? `${catalog.brandsWithoutProducts} have no products yet` : undefined} />
          <StatTile title="Missing ingredient list" value={catalog.products - (catalog.completeness.find(c => c.label.startsWith('Full'))?.value ?? 0)} />
          <StatTile title="Missing image" value={catalog.products - (catalog.completeness.find(c => c.label === 'Image')?.value ?? 0)} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Products by category"><BarList data={catalog.byCategory} /></Card>
          <Card title="Top brands" subtitle="By number of products"><BarList data={catalog.topBrands} /></Card>
          <div className="space-y-6">
            <Card title="Price tier"><BarList data={catalog.byTier} /></Card>
            <Card title="Pregnancy-safe"><BarList data={catalog.pregnancy} /></Card>
          </div>
        </div>
      </section>
    </div>
  )
}
