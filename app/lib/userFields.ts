// Helpers for reading user documents written by the mobile app.
// Field names vary between app versions, so each reader checks a list of likely names.
// If your app uses a different name, add it to the matching list below.

import { User } from '../models/model'

const get = (obj: any, path: string): any =>
  path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)

const firstDefined = (u: any, paths: string[]): any => {
  for (const p of paths) {
    const v = get(u, p)
    if (v !== undefined && v !== null && v !== '') return v
  }
  return undefined
}

export const FIELD_PATHS = {
  name: ['username', 'displayName', 'name', 'fullName', 'profile.name', 'profile.username'],
  email: ['email', 'profile.email'],
  joined: ['createdAt', 'joinDate', 'joinedAt', 'signUpDate', 'signupDate', 'created', 'profile.createdAt'],
  lastActive: ['lastLogin', 'lastLoginAt', 'lastActive', 'lastActiveAt', 'lastSeen', 'lastOpenedAt', 'updatedAt'],
  premium: ['isPremium', 'premium', 'isPro', 'subscription.active'],
  plan: ['plan', 'status', 'subscription', 'subscription.plan', 'tier', 'accountType'],
  skinType: ['skinType', 'skin_type', 'assessment.skinType', 'profile.skinType', 'skinProfile.skinType'],
  concerns: ['concerns', 'skinConcerns', 'assessment.concerns', 'profile.concerns', 'skinProfile.concerns'],
  skinTone: ['skinTone', 'fitzpatrick', 'profile.skinTone', 'skinProfile.skinTone'],
  experience: ['experienceLevel', 'experience', 'assessment.experienceLevel', 'profile.experienceLevel'],
  signInMethod: ['signInMethod', 'provider', 'authProvider', 'loginMethod'],
  avatar: ['photoURL', 'photoUrl', 'avatar', 'avatarUrl', 'profile.avatar'],
} as const

/** Converts Firestore Timestamps, {seconds}, ISO strings and epoch numbers to Date. */
export function toDate(v: any): Date | null {
  if (v == null || v === '') return null
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v
  if (typeof v?.toDate === 'function') return v.toDate()
  if (typeof v === 'object' && typeof v.seconds === 'number') return new Date(v.seconds * 1000)
  if (typeof v === 'number') return new Date(v < 1e12 ? v * 1000 : v)
  if (typeof v === 'string') {
    const d = new Date(v)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

export const userName = (u: User): string => {
  const n = firstDefined(u, [...FIELD_PATHS.name])
  if (n) return String(n)
  const first = firstDefined(u, ['firstName', 'profile.firstName'])
  const last = firstDefined(u, ['lastName', 'profile.lastName'])
  if (first || last) return [first, last].filter(Boolean).join(' ')
  const email = userEmail(u)
  return email ? email.split('@')[0] : 'Unnamed user'
}

export const userEmail = (u: User): string => String(firstDefined(u, [...FIELD_PATHS.email]) ?? '')
export const userJoined = (u: User): Date | null => toDate(firstDefined(u, [...FIELD_PATHS.joined]))
export const userLastActive = (u: User): Date | null => toDate(firstDefined(u, [...FIELD_PATHS.lastActive]))
export const userAvatar = (u: User): string => String(firstDefined(u, [...FIELD_PATHS.avatar]) ?? '')

/** 'Premium' | 'Free' | the app's own plan label | 'Unknown' */
export const userPlan = (u: User): string => {
  const premium = firstDefined(u, [...FIELD_PATHS.premium])
  if (typeof premium === 'boolean') return premium ? 'Premium' : 'Free'
  const plan = firstDefined(u, [...FIELD_PATHS.plan])
  if (typeof plan === 'string') {
    const p = plan.toLowerCase()
    if (['paid', 'premium', 'pro', 'plus', 'subscribed', 'active'].includes(p)) return 'Premium'
    if (['free', 'basic', 'trial'].includes(p)) return 'Free'
    return plan.charAt(0).toUpperCase() + plan.slice(1)
  }
  return 'Unknown'
}

const asList = (v: any): string[] => {
  if (v == null || v === '') return []
  if (Array.isArray(v)) return v.map(x => String(typeof x === 'object' ? (x.name ?? x.label ?? JSON.stringify(x)) : x)).filter(Boolean)
  if (typeof v === 'string') return v.split(/[,;|]/).map(s => s.trim()).filter(Boolean)
  return [String(v)]
}

export const userSkinTypes = (u: User): string[] => asList(firstDefined(u, [...FIELD_PATHS.skinType])).map(titleCase)
export const userConcerns = (u: User): string[] => asList(firstDefined(u, [...FIELD_PATHS.concerns])).map(titleCase)
export const userSkinTone = (u: User): string => String(firstDefined(u, [...FIELD_PATHS.skinTone]) ?? '')
export const userExperience = (u: User): string => String(firstDefined(u, [...FIELD_PATHS.experience]) ?? '')
export const userSignInMethod = (u: User): string => String(firstDefined(u, [...FIELD_PATHS.signInMethod]) ?? '')

function titleCase(s: string): string {
  return s.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim()
}

export const initials = (name: string): string =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]!.toUpperCase()).join('') || '?'

export function formatDate(d: Date | null, withTime = false): string {
  if (!d) return '—'
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  })
}

export function timeAgo(d: Date | null): string {
  if (!d) return '—'
  const s = Math.round((Date.now() - d.getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.round(s / 60); if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60); if (h < 24) return `${h} h ago`
  const days = Math.round(h / 24); if (days < 30) return `${days} d ago`
  return formatDate(d)
}

/** Renders any Firestore value as readable text for the "all fields" table. */
export function displayValue(v: any): string {
  if (v == null || v === '') return '—'
  const d = (typeof v === 'object' && (typeof v.toDate === 'function' || typeof v.seconds === 'number')) ? toDate(v) : null
  if (d) return formatDate(d, true)
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (Array.isArray(v)) return v.length ? v.map(displayValue).join(', ') : '—'
  if (typeof v === 'object') return JSON.stringify(v, null, 1)
  return String(v)
}
