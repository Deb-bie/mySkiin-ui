'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAppState } from '../../../hooks/useAppState'
import { getUser, getUserSubcollections } from '../../../lib/firebase/services'
import { SubcollectionSummary, User } from '../../../models/model'
import {
  displayValue, formatDate, initials, timeAgo, userAvatar, userConcerns, userEmail, userExperience,
  userJoined, userLastActive, userName, userPlan, userSignInMethod, userSkinTone, userSkinTypes,
} from '../../../lib/userFields'

export default function UserDetailPage() {
  const params = useParams()
  const userId = params?.id as string
  const { state } = useAppState()
  const cached = state.users.find(u => u.id === userId) ?? null
  const [user, setUser] = useState<User | null>(cached)
  const [subs, setSubs] = useState<SubcollectionSummary[] | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const fresh = await getUser(userId)
        if (!cancelled) setUser(fresh)
      } catch (e: any) {
        if (!cancelled) setError(e?.code === 'permission-denied' ? 'Permission denied. Deploy the updated firestore.rules to give the admin account read access.' : 'Could not load this user.')
      } finally {
        if (!cancelled) setLoading(false)
      }
      const s = await getUserSubcollections(userId)
      if (!cancelled) setSubs(s)
    })()
    return () => { cancelled = true }
  }, [userId])

  if (loading) return <p className="text-gray-500">Loading user…</p>

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600 mb-4">{error || "This user doesn't exist or was deleted."}</p>
          <Link href="/admin/users" className="text-indigo-600 hover:text-indigo-700 font-semibold">← Back to Users</Link>
        </div>
      </div>
    )
  }

  const name = userName(user)
  const plan = userPlan(user)
  const avatar = userAvatar(user)
  const joined = userJoined(user)
  const ageDays = joined ? Math.floor((Date.now() - joined.getTime()) / 86_400_000) : null
  const foundSubs = (subs ?? []).filter(s => s.count > 0)
  const fields = Object.entries(user).filter(([k]) => k !== 'id').sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="text-gray-600 hover:text-gray-900 transition" aria-label="Back to users">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center mb-6">
              {avatar.startsWith('http') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
              ) : (
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 text-3xl font-bold">
                  {initials(name)}
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
              <p className="text-gray-600 mt-1 break-all">{userEmail(user) || '—'}</p>
              <span className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-semibold ${plan === 'Premium' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {plan === 'Premium' ? '💎 Premium' : plan}
              </span>
            </div>
            <dl className="space-y-3 border-t pt-4 text-sm">
              <Row label="Joined" value={joined ? `${formatDate(joined)} (${ageDays} days ago)` : '—'} />
              <Row label="Last active" value={`${timeAgo(userLastActive(user))}`} />
              <Row label="Sign-in method" value={userSignInMethod(user) || '—'} />
              <Row label="User ID" value={<span className="font-mono text-xs break-all">{user.id}</span>} />
            </dl>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Skin profile</h3>
            <dl className="space-y-3 text-sm">
              <Row label="Skin type" value={userSkinTypes(user).join(', ') || '—'} />
              <Row label="Skin tone" value={userSkinTone(user) || '—'} />
              <Row label="Experience" value={userExperience(user) || '—'} />
            </dl>
            <p className="text-xs text-gray-500 mt-4 mb-2">Concerns</p>
            <div className="flex flex-wrap gap-1.5">
              {userConcerns(user).length
                ? userConcerns(user).map(c => <span key={c} className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-xs font-medium">{c}</span>)
                : <span className="text-sm text-gray-400">None recorded</span>}
            </div>
          </div>
        </div>

        {/* Activity & data */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {subs === null
              ? <p className="col-span-full text-sm text-gray-500">Checking this user&apos;s saved data…</p>
              : foundSubs.length
                ? foundSubs.map(s => (
                  <div key={s.name} className="bg-white rounded-xl shadow-sm p-5">
                    <p className="text-sm text-gray-600 capitalize">{s.name}</p>
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">{s.count.toLocaleString()}</p>
                  </div>
                ))
                : <p className="col-span-full text-sm text-gray-500 bg-white rounded-xl shadow-sm p-5">
                    No saved routines, products or diary entries were found under this user.
                    {subs.some(s => s.error) && ' Some collections could not be read — check the Firestore rules.'}
                  </p>}
          </div>

          {foundSubs.map(s => (
            <details key={s.name} className="bg-white rounded-xl shadow-sm p-6 group">
              <summary className="cursor-pointer font-semibold text-gray-900 capitalize flex justify-between">
                <span>{s.name} <span className="text-sm font-normal text-gray-500">({s.count})</span></span>
                <span className="text-sm font-normal text-indigo-600 group-open:hidden">Show</span>
              </summary>
              <div className="mt-4 space-y-3">
                {s.recent.map(d => (
                  <div key={d.id} className="border rounded-lg p-3 text-sm">
                    <p className="font-mono text-xs text-gray-400 mb-2">{d.id}</p>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                      {Object.entries(d).filter(([k]) => k !== 'id').slice(0, 12).map(([k, v]) => (
                        <div key={k} className="flex gap-2 min-w-0">
                          <dt className="text-gray-500 shrink-0">{k}:</dt>
                          <dd className="text-gray-800 truncate" title={displayValue(v)}>{displayValue(v)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
                {s.count > s.recent.length && <p className="text-xs text-gray-500">Showing {s.recent.length} of {s.count}.</p>}
              </div>
            </details>
          ))}

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">All profile fields</h3>
            <p className="text-xs text-gray-500 mb-4">Everything stored on this user&apos;s document, as written by the app.</p>
            <dl className="divide-y text-sm">
              {fields.map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-4 py-2">
                  <dt className="text-gray-500 font-mono text-xs pt-0.5 break-all">{k}</dt>
                  <dd className="col-span-2 text-gray-900 whitespace-pre-wrap break-words">{displayValue(v)}</dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="text-xs text-gray-500">Users are managed in the mobile app. To delete an account, use the app&apos;s account-deletion flow or the Firebase console so the sign-in account is removed too.</p>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900 font-medium text-right">{value}</dd>
    </div>
  )
}
