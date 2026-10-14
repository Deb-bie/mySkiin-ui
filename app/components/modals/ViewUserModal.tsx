'use client'
import Link from 'next/link'
import { ViewUserModalProps } from '@/app/models/model'
import { formatDate, initials, timeAgo, userEmail, userJoined, userLastActive, userName, userPlan, userSkinTypes } from '@/app/lib/userFields'

/** Quick-look modal for a user. The Users page links to the full detail page instead. */
export default function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  if (!isOpen || !user) return null
  const name = userName(user)
  const plan = userPlan(user)
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">✕</button>
        </div>
        <div className="flex items-center gap-4 pb-6 border-b">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">{initials(name)}</div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{name}</h3>
            <p className="text-gray-600">{userEmail(user)}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{plan}</span>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 py-6 text-sm">
          <div><dt className="text-gray-500">Joined</dt><dd className="font-medium">{formatDate(userJoined(user))}</dd></div>
          <div><dt className="text-gray-500">Last active</dt><dd className="font-medium">{timeAgo(userLastActive(user))}</dd></div>
          <div className="col-span-2"><dt className="text-gray-500">Skin type</dt><dd className="font-medium">{userSkinTypes(user).join(', ') || '—'}</dd></div>
        </dl>
        <Link href={`/admin/users/${user.id}`} className="block text-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-semibold">
          Open full profile
        </Link>
      </div>
    </div>
  )
}
