'use client'
import { useAppState } from '../hooks/useAppState'

/** Explains why user data is missing (usually Firestore rules) instead of showing zeros. */
export default function UsersAccessNotice() {
  const { state, loadUsers } = useAppState()
  if (!state.usersError) return null
  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 text-sm flex items-start justify-between gap-4">
      <div>
        <p className="font-semibold">User data couldn&apos;t be loaded</p>
        <p className="mt-0.5">{state.usersError}</p>
        <p className="mt-1 text-amber-800">The updated rules are in <code className="bg-amber-100 px-1 rounded">firestore.rules</code> in this project. Publish them in the Firebase console (Firestore → Rules) or deploy them from the app project with <code className="bg-amber-100 px-1 rounded">firebase deploy --only firestore:rules</code>.</p>
      </div>
      <button onClick={() => loadUsers()} className="shrink-0 font-semibold hover:underline">Try again</button>
    </div>
  )
}
